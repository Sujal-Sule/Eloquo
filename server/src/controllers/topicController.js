import Topic from '../models/Topic.js';
import { GD_TOPICS } from '../utils/constants.js';

export const getRandomTopics = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    const topics = await Topic.aggregate([
      { $match: filter },
      { $sample: { size: 5 } }
    ]);
    if (topics.length === 0) {
      const fallback = GD_TOPICS.slice(0, 5).map((t, i) => ({ _id: `fallback_${i}`, ...t }));
      return res.json({ success: true, data: fallback });
    }
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopics = async (req, res) => {
  try {
    const { category, difficulty, page = 1 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    const limit = 10;
    const skip = (page - 1) * limit;
    const topics = await Topic.find(filter).skip(skip).limit(limit);
    const total = await Topic.countDocuments(filter);
    res.json({ success: true, data: { topics, total, page: Number(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomTopic = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Topic title required' });
    }
    res.json({ success: true, data: { title, isCustom: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
