import GDSession from '../models/GDSession.js';
import genAI from '../config/gemini.js';
import UserStats from '../models/UserStats.js';
import PerformanceReport from '../models/PerformanceReport.js';
import Achievement from '../models/Achievement.js';
import { AI_NAMES, PASS_LIMITS } from '../utils/constants.js';
import { generateAIResponse, generateOpeningStatement, generateConclusionStatement, generateSessionReport } from '../services/ai/geminiService.js';
import { calculateSessionScore, calculateLeadershipScore, calculateLeaderboardPoints, getGrade } from '../services/scoringService.js';

export const createSession = async (req, res) => {
  try {
    const { topic, customTopic, difficulty, duration, participantCount, startMode, personalities } = req.body;
    const userId = req.user._id;

    await GDSession.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'completed', endedAt: new Date() } }
    );

    const sessionTopic = customTopic || topic;
    if (!sessionTopic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const aiCount = participantCount - 1;
    const selectedPersonalities = personalities.slice(0, aiCount);
    const participants = [
      { participantType: 'user', name: req.user.name, personality: 'user', points: 0, speakingTurns: 0, speakingTime: 0 }
    ];

    selectedPersonalities.forEach(p => {
      participants.push({
        participantType: 'ai',
        name: AI_NAMES[p] || p,
        personality: p,
        points: 0,
        speakingTurns: 0,
        speakingTime: 0
      });
    });

    const session = await GDSession.create({
      userId,
      topic: sessionTopic,
      difficulty,
      duration,
      participantCount,
      startedBy: startMode,
      participants,
      maxPasses: PASS_LIMITS[difficulty] || 3,
      startedAt: new Date(),
      userStarted: startMode === 'user'
    });

    if (startMode === 'ai') {
      const firstAI = participants.find(p => p.participantType === 'ai');
      if (firstAI) {
        const opening = await generateOpeningStatement({
          personality: firstAI.personality,
          topic: sessionTopic,
          difficulty
        });
        session.messages.push({
          participantId: firstAI._id,
          speakerName: firstAI.name,
          speakerType: 'ai',
          personality: firstAI.personality,
          message: opening,
          messageType: 'introduction'
        });
        await session.save();
      }
    }

    res.status(201).json({ success: true, data: { sessionId: session._id, session } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await GDSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    let lastMessageAudio = null;
    if (session.messages && session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg.speakerType === 'ai') {
        try {
          lastMessageAudio = await synthesizeAudio(lastMsg.message, lastMsg.speakerName);
        } catch (ttsErr) {
          console.error(ttsErr);
        }
      }
    }
    res.json({
      success: true,
      data: {
        session,
        lastMessageAudio
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userSpeak = async (req, res) => {
  try {
    const { transcript } = req.body;
    const session = await GDSession.findById(req.params.sessionId);

    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session not active' });
    }

    const userParticipant = session.participants.find(p => p.participantType === 'user');

    session.messages.push({
      participantId: userParticipant._id,
      speakerName: userParticipant.name,
      speakerType: 'user',
      personality: 'user',
      message: transcript,
      messageType: session.messages.length === 0 ? 'introduction' : 'speech'
    });

    session.userSpeakingTurns += 1;
    userParticipant.speakingTurns += 1;

    if (session.messages.length === 1 && session.startedBy === 'user') {
      session.userStarted = true;
    }

    await session.save();

    const aiParticipants = session.participants.filter(p => p.participantType === 'ai');
    const respondingAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];

    const aiResponse = await generateAIResponse({
      personality: respondingAI.personality,
      topic: session.topic,
      difficulty: session.difficulty,
      discussionHistory: session.messages.slice(-8),
      lastMessage: transcript
    });

    session.messages.push({
      participantId: respondingAI._id,
      speakerName: respondingAI.name,
      speakerType: 'ai',
      personality: respondingAI.personality,
      message: aiResponse,
      messageType: 'speech'
    });

    respondingAI.speakingTurns += 1;
    await session.save();

    let audioData = null;
    try {
      audioData = await synthesizeAudio(aiResponse, respondingAI.name);
    } catch (ttsErr) {
      console.error(ttsErr);
    }

    res.json({
      success: true,
      data: {
        userMessage: { speakerName: userParticipant.name, message: transcript },
        aiResponse: { 
          speakerName: respondingAI.name, 
          message: aiResponse, 
          personality: respondingAI.personality,
          audioContent: audioData?.audioContent || null,
          mimeType: audioData?.mimeType || null
        },
        passCount: session.passCount,
        maxPasses: session.maxPasses,
        userSpeakingTurns: session.userSpeakingTurns
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const passTurn = async (req, res) => {
  try {
    const session = await GDSession.findById(req.params.sessionId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session not active' });
    }

    session.passCount += 1;
    const isMandatory = session.passCount >= session.maxPasses;

    if (!isMandatory) {
      const aiParticipants = session.participants.filter(p => p.participantType === 'ai');
      const respondingAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];

      const aiResponse = await generateAIResponse({
        personality: respondingAI.personality,
        topic: session.topic,
        difficulty: session.difficulty,
        discussionHistory: session.messages.slice(-8),
        lastMessage: session.messages[session.messages.length - 1]?.message || ''
      });

      session.messages.push({
        participantId: respondingAI._id,
        speakerName: respondingAI.name,
        speakerType: 'ai',
        personality: respondingAI.personality,
        message: aiResponse,
        messageType: 'speech'
      });

      respondingAI.speakingTurns += 1;
    }

    await session.save();

    let audioData = null;
    if (!isMandatory) {
      const lastMsg = session.messages[session.messages.length - 1];
      try {
        audioData = await synthesizeAudio(lastMsg.message, lastMsg.speakerName);
      } catch (ttsErr) {
        console.error(ttsErr);
      }
    }

    res.json({
      success: true,
      data: {
        passCount: session.passCount,
        maxPasses: session.maxPasses,
        remainingPasses: session.maxPasses - session.passCount,
        mandatory: isMandatory,
        newMessage: !isMandatory ? {
          ...session.messages[session.messages.length - 1].toObject(),
          audioContent: audioData?.audioContent || null,
          mimeType: audioData?.mimeType || null
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerAIResponse = async (req, res) => {
  try {
    const session = await GDSession.findById(req.params.sessionId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session not active' });
    }

    const aiParticipants = session.participants.filter(p => p.participantType === 'ai');
    const lastSpeaker = session.messages[session.messages.length - 1];
    let candidates = aiParticipants;
    if (lastSpeaker && lastSpeaker.speakerType === 'ai') {
      candidates = aiParticipants.filter(p => p.name !== lastSpeaker.speakerName);
      if (candidates.length === 0) candidates = aiParticipants;
    }
    const respondingAI = candidates[Math.floor(Math.random() * candidates.length)];

    const aiResponse = await generateAIResponse({
      personality: respondingAI.personality,
      topic: session.topic,
      difficulty: session.difficulty,
      discussionHistory: session.messages.slice(-8),
      lastMessage: lastSpeaker?.message || ''
    });

    session.messages.push({
      participantId: respondingAI._id,
      speakerName: respondingAI.name,
      speakerType: 'ai',
      personality: respondingAI.personality,
      message: aiResponse,
      messageType: 'speech'
    });

    respondingAI.speakingTurns += 1;
    await session.save();

    let audioData = null;
    try {
      audioData = await synthesizeAudio(aiResponse, respondingAI.name);
    } catch (ttsErr) {
      console.error(ttsErr);
    }

    res.json({
      success: true,
      data: {
        speaker: respondingAI.name,
        personality: respondingAI.personality,
        message: aiResponse,
        audioContent: audioData?.audioContent || null,
        mimeType: audioData?.mimeType || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { userConcluded, conclusionText } = req.body;
    const session = await GDSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    session.userConcluded = userConcluded || false;

    if (userConcluded) {
      const userParticipant = session.participants.find(p => p.participantType === 'user');
      session.messages.push({
        participantId: userParticipant?._id,
        speakerName: req.user.name,
        speakerType: 'user',
        personality: 'user',
        message: conclusionText || `${req.user.name} concluded the discussion.`,
        messageType: 'conclusion'
      });
      session.userSpeakingTurns += 1;
      if (userParticipant) {
        userParticipant.speakingTurns += 1;
      }
    } else {
      const moderator = session.participants.find(p => p.personality === 'moderator');
      const conclusion = await generateConclusionStatement({
        topic: session.topic,
        discussionHistory: session.messages
      });
      session.messages.push({
        participantId: moderator?._id,
        speakerName: moderator?.name || 'AI Moderator',
        speakerType: 'ai',
        personality: 'moderator',
        message: conclusion,
        messageType: 'conclusion'
      });
    }

    const userMessages = session.messages.filter(m => m.speakerType === 'user');
    const reportData = await generateSessionReport({
      topic: session.topic,
      messages: session.messages,
      userMessages,
      passCount: session.passCount,
      userStarted: session.userStarted,
      userConcluded: session.userConcluded,
      difficulty: session.difficulty
    });

    const leadershipScore = calculateLeadershipScore({
      userStarted: session.userStarted,
      userConcluded: session.userConcluded,
      speakingTurns: session.userSpeakingTurns,
      totalTurns: session.messages.length
    });

    const overallScore = calculateSessionScore({
      confidenceScore: reportData.confidenceScore,
      participationScore: reportData.participationScore,
      fluencyScore: reportData.fluencyScore,
      vocabularyScore: reportData.vocabularyScore,
      relevanceScore: reportData.relevanceScore,
      leadershipScore
    });

    session.totalScore = overallScore;
    await session.save();

    const report = await PerformanceReport.create({
      sessionId: session._id,
      userId: req.user._id,
      overallScore,
      confidenceScore: reportData.confidenceScore,
      fluencyScore: reportData.fluencyScore,
      participationScore: reportData.participationScore,
      vocabularyScore: reportData.vocabularyScore,
      relevanceScore: reportData.relevanceScore,
      leadershipScore,
      startedDiscussion: session.userStarted,
      concludedDiscussion: session.userConcluded,
      totalWords: userMessages.reduce((sum, m) => sum + m.message.split(/\s+/).length, 0),
      passCount: session.passCount,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      advancedAlternatives: reportData.vocabularySuggestions || [],
      grade: getGrade(overallScore)
    });

    const stats = await UserStats.findOne({ userId: req.user._id });
    if (stats) {
      stats.totalSessions += 1;
      const now = new Date();
      const last = stats.lastSessionDate;
      if (last) {
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
        const diffTime = nowDate - lastDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          stats.currentStreak += 1;
        } else if (diffDays > 1) {
          stats.currentStreak = 1;
        }
        // if diffDays === 0, currentStreak remains unchanged
      } else {
        stats.currentStreak = 1;
      }
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      stats.lastSessionDate = now;

      const leaderboardPts = calculateLeaderboardPoints({
        overallScore,
        userStarted: session.userStarted,
        userConcluded: session.userConcluded,
        streakActive: stats.currentStreak > 1
      });
      stats.leaderboardPoints += leaderboardPts;
      stats.confidenceScore = Math.round((stats.confidenceScore * (stats.totalSessions - 1) + reportData.confidenceScore) / stats.totalSessions);
      stats.averageScore = Math.round((stats.averageScore * (stats.totalSessions - 1) + overallScore) / stats.totalSessions);
      await stats.save();
    }

    await checkAchievements(req.user._id, stats, session);

    res.json({
      success: true,
      data: { report, overallScore, grade: getGrade(overallScore) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function checkAchievements(userId, stats, session) {
  const existing = await Achievement.find({ userId }).select('badgeName');
  const earned = new Set(existing.map(a => a.badgeName));
  const newAchievements = [];

  if (!earned.has('First Discussion') && stats.totalSessions >= 1) {
    newAchievements.push({ userId, badgeName: 'First Discussion', description: 'Completed your first GD session', icon: '🎯' });
  }
  if (!earned.has('Discussion Starter') && session.userStarted) {
    const startedCount = await GDSession.countDocuments({ userId, userStarted: true, status: 'completed' });
    if (startedCount >= 5) {
      newAchievements.push({ userId, badgeName: 'Discussion Starter', description: 'Started 5 discussions', icon: '🚀' });
    }
  }
  if (!earned.has('Strong Finisher') && session.userConcluded) {
    const concludedCount = await GDSession.countDocuments({ userId, userConcluded: true, status: 'completed' });
    if (concludedCount >= 5) {
      newAchievements.push({ userId, badgeName: 'Strong Finisher', description: 'Concluded 5 discussions', icon: '🏁' });
    }
  }
  if (!earned.has('Consistent Speaker') && stats.totalSessions >= 10) {
    newAchievements.push({ userId, badgeName: 'Consistent Speaker', description: 'Completed 10 sessions', icon: '🗣️' });
  }
  if (!earned.has('Streak Master') && stats.currentStreak >= 5) {
    newAchievements.push({ userId, badgeName: 'Streak Master', description: '5-day practice streak', icon: '🔥' });
  }

  if (newAchievements.length > 0) {
    await Achievement.insertMany(newAchievements);
  }
}

export const getSessionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const sessions = await GDSession.find({ userId: req.user._id, status: 'completed' })
      .sort({ endedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('topic difficulty duration totalScore startedAt endedAt participantCount');

    const total = await GDSession.countDocuments({ userId: req.user._id, status: 'completed' });
    res.json({ success: true, data: { sessions, total, page: Number(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const GEMINI_VOICES = {
  'Zara Iyer': 'Aoede',
  'Aisha Nair': 'Kore',
  'Kabir Verma': 'Charon',
  'Reyansh Joshi': 'Puck',
  'Rudra Thakur': 'Fenrir'
};

const SARVAM_VOICES = {
  'Zara Iyer': 'shreya',
  'Aisha Nair': 'ishita',
  'Kabir Verma': 'shubh',
  'Reyansh Joshi': 'manan',
  'Rudra Thakur': 'shubh'
};

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  header.write('RIFF', 0);
  header.writeUInt32LE(dataLength + 36, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * bitsPerSample * numChannels) / 8, 28);
  header.writeUInt16LE((bitsPerSample * numChannels) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return Buffer.concat([header, pcmBuffer]);
}

export const synthesizeAudio = async (text, speakerName) => {
  if (process.env.SARVAM_API_KEY) {
    try {
      const sarvamVoice = SARVAM_VOICES[speakerName] || 'shreya';
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': process.env.SARVAM_API_KEY
        },
        body: JSON.stringify({
          text,
          target_language_code: 'en-IN',
          speaker: sarvamVoice,
          model: 'bulbul:v3'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audios && data.audios[0]) {
          return {
            audioContent: data.audios[0],
            mimeType: 'audio/wav'
          };
        }
      }
    } catch (err) {
      console.error('Sarvam TTS failed, falling back to Gemini:', err.message);
    }
  }

  const geminiVoice = GEMINI_VOICES[speakerName] || 'Aoede';
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-tts-preview' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: geminiVoice
          }
        }
      }
    }
  });

  const candidate = result.response.candidates?.[0];
  const part = candidate?.content?.parts?.find(p => p.inlineData);

  if (part && part.inlineData) {
    const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
    return {
      audioContent: wavBuffer.toString('base64'),
      mimeType: 'audio/wav'
    };
  }

  throw new Error('No audio returned from Gemini');
};

export const generateTTS = async (req, res) => {
  try {
    const { text, speakerName } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    const data = await synthesizeAudio(text, speakerName);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('TTS Generation failed:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
