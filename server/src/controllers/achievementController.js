import Achievement from '../models/Achievement.js';

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort({ earnedAt: -1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
