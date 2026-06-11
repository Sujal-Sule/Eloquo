import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { BarChart3, Clock, Zap, ArrowRight, Calendar } from 'lucide-react';
import './ReportsListPage.css';

export default function ReportsListPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/sessions/history?limit=20');
        setSessions(res.data.data.sessions);
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
        <h1 className="reports-section-title">Session Reports</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="page-container">
      <header className="reports-header-pane">
        <h1 className="reports-section-title">Session Reports</h1>
        <p className="reports-section-desc">Review your historic performance records, confidence levels, and grammar critiques.</p>
      </header>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={44} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p>No sessions completed yet. Launch a session to start tracking your records.</p>
          <Link to="/gd/new" className="btn btn-primary" style={{ marginTop: 20 }}>Start New GD</Link>
        </div>
      ) : (
        <motion.div 
          className="reports-directory-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sessions.map((s, i) => {
            const scoreColor = s.totalScore >= 80 ? '#059669' : s.totalScore >= 60 ? '#2563EB' : s.totalScore >= 40 ? '#D97706' : '#DC2626';
            
            return (
              <motion.div key={i} variants={itemVariants}>
                <Link to={`/reports/${s._id}`} className="reports-directory-row">
                  <div className="rep-col-main">
                    <span className="rep-row-index">0{i + 1}</span>
                    <div className="rep-row-details">
                      <span className="rep-row-topic">{s.topic}</span>
                      <div className="rep-row-meta">
                        <span className="difficulty-badge" data-difficulty={s.difficulty.toLowerCase()}>{s.difficulty}</span>
                        <span className="meta-item"><Clock size={12} /> {s.duration}m</span>
                        <span className="meta-item"><Calendar size={12} /> {new Date(s.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rep-col-score">
                    <div className="rep-score-capsule" style={{ borderColor: scoreColor }}>
                      <Zap size={12} style={{ color: scoreColor }} />
                      <span style={{ color: scoreColor }}>{s.totalScore}</span>
                    </div>
                    <ArrowRight size={16} className="rep-arrow-link" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
