import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeName: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  earnedAt: { type: Date, default: Date.now }
});

achievementSchema.index({ userId: 1 });

export default mongoose.model('Achievement', achievementSchema);
