import 'dotenv/config';
import mongoose from 'mongoose';
import Topic from '../models/Topic.js';
import { GD_TOPICS } from './constants.js';

const seedTopics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'ai_gd_platform' });
    console.log('Connected to MongoDB');

    const existing = await Topic.countDocuments();
    if (existing > 0) {
      console.log(`Already have ${existing} topics. Skipping seed.`);
      process.exit(0);
    }

    await Topic.insertMany(GD_TOPICS);
    console.log(`Seeded ${GD_TOPICS.length} topics successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedTopics();
