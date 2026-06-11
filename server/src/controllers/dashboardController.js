import UserStats from '../models/UserStats.js';
import GDSession from '../models/GDSession.js';
import Achievement from '../models/Achievement.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    // Self-heal and recalculate streak based on completed sessions
    const completedSessions = await GDSession.find({ userId, status: 'completed' })
      .sort({ endedAt: 1 })
      .select('endedAt');

    let calculatedStreak = 0;
    let calculatedLongest = 0;
    let lastDateKey = null;

    for (const session of completedSessions) {
      if (!session.endedAt) continue;
      const sessionDate = new Date(session.endedAt);
      const dateKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}-${sessionDate.getDate()}`;
      
      if (lastDateKey === null) {
        calculatedStreak = 1;
      } else if (lastDateKey !== dateKey) {
        const [lastYear, lastMonth, lastDay] = lastDateKey.split('-').map(Number);
        const prevDate = new Date(lastYear, lastMonth, lastDay);
        const currDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        const diffTime = currDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          calculatedStreak += 1;
        } else if (diffDays > 1) {
          calculatedStreak = 1;
        }
      }
      calculatedLongest = Math.max(calculatedLongest, calculatedStreak);
      lastDateKey = dateKey;
    }

    if (lastDateKey) {
      const [lastYear, lastMonth, lastDay] = lastDateKey.split('-').map(Number);
      const lastSessionDateObj = new Date(lastYear, lastMonth, lastDay);
      const today = new Date();
      const currDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = currDate - lastSessionDateObj;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        calculatedStreak = 0;
      }
    } else {
      calculatedStreak = 0;
    }

    if (stats.currentStreak !== calculatedStreak || stats.longestStreak !== calculatedLongest) {
      stats.currentStreak = calculatedStreak;
      stats.longestStreak = Math.max(stats.longestStreak, calculatedLongest);
      await stats.save();
    }

    const recentSessions = await GDSession.find({ userId, status: 'completed' })
      .sort({ endedAt: -1 })
      .limit(5)
      .select('topic difficulty duration totalScore startedAt endedAt');

    const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 }).limit(5);

    const allScores = await GDSession.find({ userId, status: 'completed' })
      .sort({ endedAt: 1 })
      .select('totalScore endedAt')
      .limit(20);

    const growthData = allScores.map(s => ({
      score: s.totalScore,
      date: s.endedAt
    }));

    res.json({
      success: true,
      data: {
        confidenceScore: stats.confidenceScore,
        totalSessions: stats.totalSessions,
        streak: stats.currentStreak,
        leaderboardPoints: stats.leaderboardPoints,
        leaderboardRank: 0,
        averageScore: stats.averageScore,
        recentSessions,
        achievements,
        growthData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
