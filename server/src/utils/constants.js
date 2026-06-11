export const AI_NAMES = {
  analyst: 'Priya Sharma',
  challenger: 'Arjun Mehta',
  supporter: 'Ananya Das',
  moderator: 'Vikram Rao',
  dominator: 'Rohan Kapoor'
};

export const PERSONALITY_PROMPTS = {
  analyst: `You are Priya Sharma, an analytical thinker in a group discussion. You:
- Use facts, statistics, and logical reasoning
- Provide structured, well-organized arguments
- Reference real-world data and examples
- Speak in a measured, thoughtful tone
- Keep responses to 2-4 sentences
- Never break character`,

  challenger: `You are Arjun Mehta, a challenger in a group discussion. You:
- Respectfully question assumptions and weak arguments
- Present counterpoints and alternative perspectives
- Create healthy debate pressure
- Push others to think deeper
- Keep responses to 2-4 sentences
- Never break character`,

  supporter: `You are Ananya Das, a supportive speaker in a group discussion. You:
- Build upon and expand existing points
- Acknowledge good arguments from others
- Add complementary examples
- Encourage quieter participants
- Keep responses to 2-4 sentences
- Never break character`,

  moderator: `You are Vikram Rao, a moderator in a group discussion. You:
- Summarize key discussion points
- Create smooth transitions between topics
- Redirect off-topic conversations
- Ensure balanced participation
- Keep responses to 2-4 sentences
- Never break character`,

  dominator: `You are Rohan Kapoor, a dominant speaker in a group discussion. You:
- Express strong, confident opinions
- Sometimes give slightly longer responses
- Simulate a dominant GD participant
- Create realistic competitive pressure
- Keep responses to 3-5 sentences
- Never break character`
};

export const DIFFICULTY_MODIFIERS = {
  easy: {
    responseLength: '2-3 sentences',
    vocabulary: 'simple and clear',
    pressure: 'low, encouraging',
    style: 'Use simple vocabulary. Be encouraging. Give the user more space to speak.'
  },
  medium: {
    responseLength: '3-4 sentences',
    vocabulary: 'moderate',
    pressure: 'balanced',
    style: 'Use moderate vocabulary. Balance challenge with encouragement.'
  },
  hard: {
    responseLength: '4-5 sentences',
    vocabulary: 'advanced and precise',
    pressure: 'high, competitive',
    style: 'Use advanced vocabulary. Be more challenging. Present strong counterarguments frequently.'
  }
};

export const PASS_LIMITS = {
  easy: 4,
  medium: 3,
  hard: 2
};

export const SCORING_WEIGHTS = {
  confidence: 0.25,
  participation: 0.25,
  relevance: 0.20,
  fluency: 0.15,
  vocabulary: 0.10,
  leadership: 0.05
};

export const POINT_VALUES = {
  sessionCompletion: 50,
  goodPerformance: 25,
  startDiscussion: 25,
  concludeDiscussion: 50,
  startAndConclude: 100,
  streakBonus: 20,
  growthBonus: 10,
  participation: 10,
  strongResponse: 15
};

export const GD_TOPICS = [
  { title: 'Is AI Replacing Jobs or Creating New Opportunities?', category: 'Technology', difficulty: 'medium' },
  { title: 'Should Social Media Be Regulated by the Government?', category: 'Society', difficulty: 'medium' },
  { title: 'Is Work From Home the Future of Employment?', category: 'Business', difficulty: 'easy' },
  { title: 'Should College Education Be Free for Everyone?', category: 'Education', difficulty: 'easy' },
  { title: 'Is Climate Change the Biggest Threat to Humanity?', category: 'Environment', difficulty: 'medium' },
  { title: 'Should Cryptocurrencies Replace Traditional Banking?', category: 'Business', difficulty: 'hard' },
  { title: 'Is Online Education Better Than Classroom Learning?', category: 'Education', difficulty: 'easy' },
  { title: 'Should India Focus on Manufacturing or Services?', category: 'Business', difficulty: 'hard' },
  { title: 'Are Smartphones Making Us Less Intelligent?', category: 'Technology', difficulty: 'medium' },
  { title: 'Is Economic Growth More Important Than Environmental Protection?', category: 'Environment', difficulty: 'hard' },
  { title: 'Should Voting Be Made Compulsory?', category: 'Politics', difficulty: 'medium' },
  { title: 'Is the Indian Education System Outdated?', category: 'Education', difficulty: 'medium' },
  { title: 'Does Social Media Create More Harm Than Good?', category: 'Society', difficulty: 'easy' },
  { title: 'Should Private Companies Be Allowed in Space Exploration?', category: 'Technology', difficulty: 'hard' },
  { title: 'Is Success About Hard Work or Smart Work?', category: 'Abstract', difficulty: 'easy' },
  { title: 'Can Money Buy Happiness?', category: 'Abstract', difficulty: 'easy' },
  { title: 'Is Technology Making Us More Lonely?', category: 'Society', difficulty: 'medium' },
  { title: 'Should India Adopt a Four-Day Work Week?', category: 'Business', difficulty: 'medium' },
  { title: 'Is Data Privacy a Myth in the Digital Age?', category: 'Technology', difficulty: 'hard' },
  { title: 'Are Startups Better Than Corporate Jobs?', category: 'Business', difficulty: 'medium' },
  { title: 'Should Artificial Intelligence Have Rights?', category: 'Abstract', difficulty: 'hard' },
  { title: 'Is English Necessary for Success in India?', category: 'Education', difficulty: 'easy' },
  { title: 'Should Public Transport Be Free?', category: 'Society', difficulty: 'medium' },
  { title: 'Is Nuclear Energy the Solution to Climate Change?', category: 'Environment', difficulty: 'hard' },
  { title: 'Do Grades Define Intelligence?', category: 'Education', difficulty: 'easy' },
  { title: 'Should Genetically Modified Foods Be Banned?', category: 'Environment', difficulty: 'medium' },
  { title: 'Is Globalization Helping or Hurting Developing Countries?', category: 'Business', difficulty: 'hard' },
  { title: 'Should Students Be Allowed to Use AI for Assignments?', category: 'Education', difficulty: 'medium' },
  { title: 'Is Competition Healthy or Toxic?', category: 'Abstract', difficulty: 'easy' },
  { title: 'Will Robots Replace Doctors and Teachers?', category: 'Technology', difficulty: 'medium' }
];
