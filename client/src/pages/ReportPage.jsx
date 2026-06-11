import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ArrowLeft, TrendingUp, Mic, BookOpen, Target, Zap, Award, Star, ChevronRight, Check } from 'lucide-react';
import './ReportPage.css';

const SCORE_COLORS = { A: '#059669', B: '#2563EB', C: '#D97706', D: '#DC2626' };

export default function ReportPage() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${sessionId}`);
        setReport(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 160, borderRadius: 8, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 8 }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Report not found. The session may still be in progress.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 20 }}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const gradeLetter = report.grade?.[0] || 'B';
  const gradeColor = SCORE_COLORS[gradeLetter] || '#6B7280';

  const scores = [
    { label: 'Confidence', value: report.confidenceScore, icon: <TrendingUp size={16} />, color: '#2563EB' },
    { label: 'Participation', value: report.participationScore, icon: <Mic size={16} />, color: '#059669' },
    { label: 'Fluency', value: report.fluencyScore, icon: <Zap size={16} />, color: '#D97706' },
    { label: 'Vocabulary', value: report.vocabularyScore, icon: <BookOpen size={16} />, color: '#8B5CF6' },
    { label: 'Relevance', value: report.relevanceScore, icon: <Target size={16} />, color: '#0EA5E9' },
    { label: 'Leadership', value: report.leadershipScore, icon: <Star size={16} />, color: '#EC4899' }
  ];

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
      <Link to="/reports" className="btn btn-ghost back-btn-link">
        <ArrowLeft size={16} /> Back to Reports
      </Link>

      {/* Hero Performance Banner */}
      <motion.section 
        className="report-editorial-hero"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="editorial-hero-left">
          <h1 className="editorial-hero-title">{report.topic}</h1>
          <div className="editorial-achievements">
            {report.startedDiscussion && (
              <span className="achievement-pill-tag">
                <Check size={12} /> Started Discussion
              </span>
            )}
            {report.concludedDiscussion && (
              <span className="achievement-pill-tag">
                <Check size={12} /> Concluded Discussion
              </span>
            )}
            <span className="achievement-pill-tag text-muted">
              {report.passCount} passes used
            </span>
          </div>
        </div>
        
        <div className="editorial-hero-right">
          <div className="editorial-score-block">
            <span className="editorial-grade-label" style={{ color: gradeColor }}>
              Grade {report.grade}
            </span>
            <div className="editorial-score-display">
              <span className="score-number">{report.overallScore}</span>
              <span className="score-total">/100</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Scores Grid */}
      <motion.section 
        className="report-scores-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {scores.map((s, i) => (
          <motion.div key={i} className="score-row-item" variants={itemVariants}>
            <div className="score-row-meta">
              <div className="score-row-title-wrap">
                <span className="score-row-icon" style={{ color: s.color }}>{s.icon}</span>
                <span className="score-row-label">{s.label}</span>
              </div>
              <span className="score-row-value" style={{ color: s.color }}>{s.value}%</span>
            </div>
            <div className="score-row-gauge-bg">
              <div className="score-row-gauge-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Detailed Insights Split Layout */}
      <section className="insights-editorial-split">
        <div className="insights-split-inner">
          <div className="insights-split-left">
            <h2 className="insights-split-title">Discussion Analytics</h2>
            <p className="insights-split-desc">
              Your speech patterns were analyzed relative to the AI peers. Review details below to prepare for the next round.
            </p>
          </div>
          <div className="insights-split-right">
            <motion.div 
              className="insights-stack"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerVariants}
            >
              <motion.div className="insight-stack-item" variants={itemVariants}>
                <h3 className="insight-header strengths-col">Strengths</h3>
                <ul className="editorial-insight-bullets">
                  {report.strengths?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </motion.div>

              <motion.div className="insight-stack-item" variants={itemVariants}>
                <h3 className="insight-header weaknesses-col">Areas to Improve</h3>
                <ul className="editorial-insight-bullets">
                  {report.weaknesses?.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </motion.div>

              <motion.div className="insight-stack-item" variants={itemVariants}>
                <h3 className="insight-header recommendations-col">Actionable Recommendations</h3>
                <ul className="editorial-insight-bullets">
                  {report.recommendations?.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </motion.div>

              {report.advancedAlternatives?.length > 0 && (
                <motion.div className="insight-stack-item" variants={itemVariants}>
                  <h3 className="insight-header vocabulary-col">Vocabulary suggestions</h3>
                  <div className="editorial-vocab-table">
                    {report.advancedAlternatives.map((v, idx) => (
                      <div key={idx} className="vocab-table-row">
                        <span className="vocab-row-original">"{v.original}"</span>
                        <ChevronRight size={12} className="vocab-row-arrow" />
                        <span className="vocab-row-alternatives">{v.alternatives?.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="report-bottom-actions">
        <Link to="/gd/new" className="btn btn-primary btn-lg">
          <Award size={18} /> Start Another GD
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </section>
    </div>
  );
}
