import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import topicRoutes from './routes/topics.js';
import sessionRoutes from './routes/sessions.js';
import reportRoutes from './routes/reports.js';
import leaderboardRoutes from './routes/leaderboard.js';
import achievementRoutes from './routes/achievements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [process.env.CLIENT_URL || 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/topics', topicRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/achievements', achievementRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Eloquo API is running', env: process.env.NODE_ENV });
});

if (isProduction) {
  const clientBuild = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message
  });
});

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('generate')) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set. Set a strong secret in .env before deploying.');
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is missing. AI features will not work.');
  }
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();
