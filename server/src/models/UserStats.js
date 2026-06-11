import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  confidenceScore: { type: Number, default: 50 },
  totalSessions: { type: Number, default: 0 },
  totalSpeakingTime: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  leaderboardPoints: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastSessionDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('UserStats', userStatsSchema);
