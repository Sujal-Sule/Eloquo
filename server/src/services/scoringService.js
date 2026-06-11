import { SCORING_WEIGHTS, POINT_VALUES } from '../utils/constants.js';

export const calculateSessionScore = ({ confidenceScore, participationScore, fluencyScore, vocabularyScore, relevanceScore, leadershipScore = 0 }) => {
  return Math.round(
    confidenceScore * SCORING_WEIGHTS.confidence +
    participationScore * SCORING_WEIGHTS.participation +
    relevanceScore * SCORING_WEIGHTS.relevance +
    fluencyScore * SCORING_WEIGHTS.fluency +
    vocabularyScore * SCORING_WEIGHTS.vocabulary +
    leadershipScore * SCORING_WEIGHTS.leadership
  );
};

export const calculateLeadershipScore = ({ userStarted, userConcluded, speakingTurns, totalTurns }) => {
  let score = 0;
  if (userStarted) score += 30;
  if (userConcluded) score += 40;
  const participationRatio = totalTurns > 0 ? speakingTurns / totalTurns : 0;
  if (participationRatio >= 0.2) score += 15;
  if (participationRatio >= 0.3) score += 15;
  return Math.min(score, 100);
};

export const calculateLeaderboardPoints = ({ overallScore, userStarted, userConcluded, streakActive }) => {
  let points = POINT_VALUES.sessionCompletion;
  if (overallScore >= 75) points += POINT_VALUES.goodPerformance;
  if (userStarted) points += POINT_VALUES.startDiscussion;
  if (userConcluded) points += POINT_VALUES.concludeDiscussion;
  if (userStarted && userConcluded) points += POINT_VALUES.startAndConclude;
  if (streakActive) points += POINT_VALUES.streakBonus;
  return points;
};

export const getGrade = (score) => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'Needs Improvement';
};
