import mongoose from 'mongoose';

const performanceReportSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GDSession', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overallScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  fluencyScore: { type: Number, default: 0 },
  participationScore: { type: Number, default: 0 },
  vocabularyScore: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 0 },
  leadershipScore: { type: Number, default: 0 },
  startedDiscussion: { type: Boolean, default: false },
  concludedDiscussion: { type: Boolean, default: false },
  totalWords: { type: Number, default: 0 },
  passCount: { type: Number, default: 0 },
  mandatoryTurnsTriggered: { type: Number, default: 0 },
  averageResponseLength: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  usedWords: [String],
  suggestedWords: [String],
  advancedAlternatives: [{ original: String, alternatives: [String] }],
  grade: { type: String, default: '' }
}, { timestamps: true });

performanceReportSchema.index({ userId: 1, sessionId: 1 });

export default mongoose.model('PerformanceReport', performanceReportSchema);
