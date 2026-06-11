import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technology', 'Education', 'Business', 'Environment', 'Society', 'Politics', 'Abstract'],
    required: true
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

topicSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model('Topic', topicSchema);
