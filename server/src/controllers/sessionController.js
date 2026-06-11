import GDSession from '../models/GDSession.js';
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
    res.json({ success: true, data: { session } });
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

    res.json({
      success: true,
      data: {
        userMessage: { speakerName: userParticipant.name, message: transcript },
        aiResponse: { speakerName: respondingAI.name, message: aiResponse, personality: respondingAI.personality },
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

    res.json({
      success: true,
      data: {
        passCount: session.passCount,
        maxPasses: session.maxPasses,
        remainingPasses: session.maxPasses - session.passCount,
        mandatory: isMandatory,
        newMessage: !isMandatory ? session.messages[session.messages.length - 1] : null
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

    res.json({
      success: true,
      data: {
        speaker: respondingAI.name,
        personality: respondingAI.personality,
        message: aiResponse
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { userConcluded } = req.body;
    const session = await GDSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    session.userConcluded = userConcluded || false;

    if (userConcluded) {
      session.messages.push({
        speakerName: 'System',
        speakerType: 'system',
        message: `${req.user.name} concluded the discussion.`,
        messageType: 'conclusion'
      });
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
