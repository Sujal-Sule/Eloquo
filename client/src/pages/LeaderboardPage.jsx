import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Trophy, Star } from 'lucide-react';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lbRes, rankRes] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/me')
        ]);
        setLeaderboard(lbRes.data.data);
        setMyRank(rankRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="leaderboard-section-title">Leaderboard</h1>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  const rankIcons = ['🥇', '🥈', '🥉'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="page-container">
      <header className="leaderboard-header-pane">
        <h1 className="leaderboard-section-title"><Trophy size={28} /> Leaderboard</h1>
        <p className="leaderboard-section-desc">Compete with global students. Ranks update in real-time based on discussion readiness scores.</p>
      </header>

      {myRank && (
        <motion.div 
          className="my-rank-banner-editorial"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="my-rank-col">
            <span className="my-rank-lbl">Your Ranking</span>
            <span className="my-rank-val">#{myRank.rank || '—'}</span>
          </div>
          <div className="my-rank-separator" />
          <div className="my-rank-col">
            <span className="my-rank-lbl">Total Points Earned</span>
            <span className="my-rank-val"><Star size={18} style={{ color: '#D97706' }} /> {myRank.points}</span>
          </div>
        </motion.div>
      )}

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <Trophy size={44} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p>No ranks recorded yet. Complete discussion sessions to enter the board.</p>
        </div>
      ) : (
        <motion.div 
          className="leaderboard-directory"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {leaderboard.map((entry, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className={`leaderboard-row ${entry.userId === user?._id ? 'is-current-user' : ''}`}
            >
              <div className="lb-col-rank">
                {i < 3 ? <span className="lb-medal">{rankIcons[i]}</span> : <span className="lb-num">#{entry.rank}</span>}
              </div>
              <div className="lb-col-info">
                <span className="lb-row-name">
                  {entry.name} {entry.userId === user?._id && <span className="lb-self-tag">(You)</span>}
                </span>
                <span className="lb-row-meta">
                  {entry.sessions} sessions played · Confidence {entry.confidenceScore}%
                </span>
              </div>
              <div className="lb-col-points">
                <Star size={12} style={{ color: '#D97706' }} />
                <span>{entry.points} pts</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
