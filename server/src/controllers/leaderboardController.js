import UserStats from '../models/UserStats.js';

export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const leaderboard = await UserStats.find()
      .sort({ leaderboardPoints: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar');

    const ranked = leaderboard.map((entry, index) => ({
      rank: skip + index + 1,
      name: entry.userId?.name || 'Unknown',
      points: entry.leaderboardPoints,
      sessions: entry.totalSessions,
      confidenceScore: entry.confidenceScore,
      userId: entry.userId?._id
    }));

    res.json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRank = async (req, res) => {
  try {
    const myStats = await UserStats.findOne({ userId: req.user._id });
    if (!myStats) {
      return res.json({ success: true, data: { rank: 0, points: 0 } });
    }
    const higherCount = await UserStats.countDocuments({
      leaderboardPoints: { $gt: myStats.leaderboardPoints }
    });
    res.json({
      success: true,
      data: { rank: higherCount + 1, points: myStats.leaderboardPoints }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
