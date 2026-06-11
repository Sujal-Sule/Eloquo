import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  participantType: { type: String, enum: ['user', 'ai'], required: true },
  name: { type: String, required: true },
  personality: { type: String, enum: ['analyst', 'challenger', 'supporter', 'moderator', 'dominator', 'user'], default: 'user' },
  points: { type: Number, default: 0 },
  speakingTurns: { type: Number, default: 0 },
  speakingTime: { type: Number, default: 0 }
}, { _id: true });

const messageSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId },
  speakerName: { type: String, required: true },
  speakerType: { type: String, enum: ['user', 'ai', 'system'], required: true },
  personality: { type: String, default: '' },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['speech', 'introduction', 'conclusion', 'system'], default: 'speech' },
  timestamp: { type: Date, default: Date.now }
});

const gdSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  duration: { type: Number, required: true },
  participantCount: { type: Number, required: true },
  startedBy: { type: String, enum: ['user', 'ai'], required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  participants: [participantSchema],
  messages: [messageSchema],
  passCount: { type: Number, default: 0 },
  maxPasses: { type: Number, default: 3 },
  userSpeakingTurns: { type: Number, default: 0 },
  userStarted: { type: Boolean, default: false },
  userConcluded: { type: Boolean, default: false },
  totalScore: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null }
}, { timestamps: true });

gdSessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model('GDSession', gdSessionSchema);
