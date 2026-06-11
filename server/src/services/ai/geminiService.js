import { getGeminiModel } from '../../config/gemini.js';
import { PERSONALITY_PROMPTS, DIFFICULTY_MODIFIERS } from '../../utils/constants.js';

const FALLBACK_RESPONSES = [
  "I understand your point, but I would like to offer a different perspective on this matter.",
  "That's an interesting argument. However, we should also consider the other side of this issue.",
  "Building on what has been discussed, I think there are additional factors we should examine.",
  "While I see the merit in that viewpoint, I believe we need to look at the bigger picture here.",
  "That raises a good point. Let me add my thoughts on this particular aspect of the discussion."
];

export const generateAIResponse = async ({ personality, topic, difficulty, discussionHistory, lastMessage }) => {
  try {
    const model = getGeminiModel();
    const personalityPrompt = PERSONALITY_PROMPTS[personality];
    const difficultyMod = DIFFICULTY_MODIFIERS[difficulty];

    const recentMessages = discussionHistory.slice(-8).map(m =>
      `${m.speakerName} (${m.speakerType}): ${m.message}`
    ).join('\n');

    const prompt = `${personalityPrompt}

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
STYLE: ${difficultyMod.style}
RESPONSE LENGTH: ${difficultyMod.responseLength}

DISCUSSION SO FAR:
${recentMessages || 'Discussion is just starting.'}

LAST MESSAGE: ${lastMessage || 'None yet.'}

INSTRUCTIONS:
- Respond naturally as your character in ${difficultyMod.responseLength}
- Stay on topic: "${topic}"
- Do NOT repeat what others have already said
- Do NOT use markdown formatting, bullet points, or asterisks
- Speak conversationally as if in a real group discussion
- Do NOT start with "I agree" or "I disagree" every time, vary your openings
- Reference previous speakers naturally when appropriate`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    if (!response || response.length < 10) {
      return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }

    return response;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
};

export const generateOpeningStatement = async ({ personality, topic, difficulty }) => {
  try {
    const model = getGeminiModel();
    const personalityPrompt = PERSONALITY_PROMPTS[personality];
    const difficultyMod = DIFFICULTY_MODIFIERS[difficulty];

    const prompt = `${personalityPrompt}

You are opening a group discussion on the topic: "${topic}"
Difficulty: ${difficulty}

INSTRUCTIONS:
- Introduce the topic naturally in 2-3 sentences
- Set up the discussion for others to join
- Do NOT use markdown, bullet points, or asterisks
- Speak conversationally
- ${difficultyMod.style}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Opening statement error:', error.message);
    return `Let's discuss an important topic today: "${topic}". I believe this is something that affects all of us in different ways. I'd love to hear everyone's perspectives on this.`;
  }
};

export const generateConclusionStatement = async ({ topic, discussionHistory }) => {
  try {
    const model = getGeminiModel();
    const summary = discussionHistory.slice(-10).map(m =>
      `${m.speakerName}: ${m.message}`
    ).join('\n');

    const prompt = `You are concluding a group discussion on: "${topic}"

DISCUSSION SUMMARY:
${summary}

INSTRUCTIONS:
- Summarize the key points discussed in 3-4 sentences
- Acknowledge different viewpoints presented
- End with a balanced conclusion
- Do NOT use markdown, bullet points, or asterisks
- Speak naturally and conversationally`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `This has been a very productive discussion on "${topic}". We explored multiple perspectives and raised important points. Thank you all for your valuable contributions.`;
  }
};

export const analyzeUserResponse = async ({ userMessage, topic, discussionHistory }) => {
  try {
    const model = getGeminiModel();
    const prompt = `Analyze this user's response in a group discussion.

TOPIC: ${topic}
USER'S RESPONSE: "${userMessage}"

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "relevanceScore": <0-100>,
  "vocabularyLevel": "<basic|moderate|advanced>",
  "responseQuality": "<weak|moderate|strong>",
  "wordCount": <number>,
  "repeatedWords": [<list of overused words>],
  "suggestedAlternatives": [{"original": "<word>", "alternatives": ["<better word 1>", "<better word 2>"]}],
  "isOnTopic": <true/false>
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Analysis error:', error.message);
    return {
      relevanceScore: 70,
      vocabularyLevel: 'moderate',
      responseQuality: 'moderate',
      wordCount: userMessage.split(/\s+/).length,
      repeatedWords: [],
      suggestedAlternatives: [],
      isOnTopic: true
    };
  }
};

export const generateSessionReport = async ({ topic, messages, userMessages, passCount, userStarted, userConcluded, difficulty }) => {
  try {
    const model = getGeminiModel();
    const userContributions = userMessages.map(m => m.message).join('\n');

    const prompt = `Generate a performance report for a user in a group discussion.

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
USER STARTED DISCUSSION: ${userStarted}
USER CONCLUDED DISCUSSION: ${userConcluded}
PASSES USED: ${passCount}
TOTAL USER MESSAGES: ${userMessages.length}
TOTAL DISCUSSION MESSAGES: ${messages.length}

USER'S CONTRIBUTIONS:
${userContributions || 'User did not contribute.'}

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "confidenceScore": <0-100>,
  "fluencyScore": <0-100>,
  "participationScore": <0-100>,
  "vocabularyScore": <0-100>,
  "relevanceScore": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendations": ["<rec 1>", "<rec 2>", "<rec 3>"],
  "vocabularySuggestions": [{"original": "<common word>", "alternatives": ["<better 1>", "<better 2>"]}]
}

RULES:
- Be encouraging, not harsh
- Focus on confidence building
- Reward participation over perfection
- If user participated well, give higher scores
- If user passed a lot, reduce confidence score`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Report generation error:', error.message);
    return {
      confidenceScore: 60,
      fluencyScore: 60,
      participationScore: userMessages.length > 0 ? 70 : 30,
      vocabularyScore: 60,
      relevanceScore: 65,
      strengths: ['Completed the discussion session'],
      weaknesses: ['Could participate more actively'],
      recommendations: ['Try to contribute more frequently', 'Practice speaking on diverse topics'],
      vocabularySuggestions: []
    };
  }
};
