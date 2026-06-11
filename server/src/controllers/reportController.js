import PerformanceReport from '../models/PerformanceReport.js';

export const getReport = async (req, res) => {
  try {
    const report = await PerformanceReport.findOne({ sessionId: req.params.sessionId });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reports = await PerformanceReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('sessionId', 'topic difficulty duration');

    const total = await PerformanceReport.countDocuments({ userId: req.user._id });
    res.json({ success: true, data: { reports, total, page: Number(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
