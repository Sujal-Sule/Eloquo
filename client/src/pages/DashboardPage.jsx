import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { PlusCircle, Clock, Zap, ArrowRight, Star, ShieldCheck, Sparkles, Building2, Target, Rocket, Flag, MessageCircle, Flame, Trophy, Award, Activity, Mic, BookOpen, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('15d');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-skeleton">
          <div className="skeleton" style={{ height: 60 }} />
          <div className="skeleton" style={{ height: 100 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  // Calculate Placement Readiness
  const confidence = data?.confidenceScore || 0;
  let tierName = 'Bronze Tier';
  let tierColor = '#868E96'; // Muted Grey
  let tierDesc = 'Focus on finishing 3+ sessions and speaking for at least 2 minutes per turn to unlock higher tiers.';
  let targetCompany = 'TCS, Wipro, Cognizant';
  let nextMilestone = 'Reach 41 Confidence points to unlock Silver Tier.';
  let readinessPercentage = Math.min(Math.max((confidence / 100) * 100, 10), 100);

  if (confidence >= 86) {
    tierName = 'Elite Tier (Placement Ready)';
    tierColor = '#059669'; // Emerald
    tierDesc = 'Excellent! Your fluency and argumentation structure are ready for top-tier corporate interviews.';
    targetCompany = 'Google, McKinsey, Goldman Sachs';
    nextMilestone = 'You have unlocked the highest readiness tier! Keep practicing to maintain your streak.';
  } else if (confidence >= 66) {
    tierName = 'Gold Tier (Product & Strategy Ready)';
    tierColor = '#2563EB'; // Blue
    tierDesc = 'Great speaking flow. You are well prepared for product company case studies and consulting rounds.';
    targetCompany = 'Amazon, Deloitte, Accenture';
    nextMilestone = 'Reach 86 Confidence points to unlock Elite Tier.';
  } else if (confidence >= 41) {
    tierName = 'Silver Tier (Core Fluency Ready)';
    tierColor = '#D97706'; // Amber
    tierDesc = 'Good communication basics. Ready for large-scale recruitment GDs.';
    targetCompany = 'TCS, Wipro, Cognizant, Infosys';
    nextMilestone = 'Reach 66 Confidence points to unlock Gold Tier.';
  }

  const stats = [
    { label: 'Confidence', value: confidence },
    { label: 'Sessions Played', value: data?.totalSessions || 0 },
    { label: 'Daily Streak', value: `${data?.streak || 0} days` },
    { label: 'Total Points', value: data?.leaderboardPoints || 0 }
  ];

  const allTimeAggregated = {};
  data?.growthData?.forEach(s => {
    if (!s.score || !s.date) return;
    const dateObj = new Date(s.date);
    if (isNaN(dateObj.getTime())) return;
    const dateKey = dateObj.toISOString().split('T')[0];
    if (!allTimeAggregated[dateKey] || s.score > allTimeAggregated[dateKey].score) {
      allTimeAggregated[dateKey] = { score: s.score, dateObj };
    }
  });

  const allTimeData = Object.keys(allTimeAggregated)
    .sort()
    .map(key => ({
      formattedDate: allTimeAggregated[key].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: allTimeAggregated[key].score
    }));

  const dailyData15d = [];
  let minDateObj = null;
  let maxDateObj = null;
  data?.growthData?.forEach(s => {
    if (!s.score || !s.date) return;
    const dateObj = new Date(s.date);
    if (isNaN(dateObj.getTime())) return;
    if (!minDateObj || dateObj < minDateObj) minDateObj = dateObj;
    if (!maxDateObj || dateObj > maxDateObj) maxDateObj = dateObj;
  });

  if (maxDateObj) {
    const end = new Date(maxDateObj);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 14);

    const sortedGrowth = [...(data?.growthData || [])]
      .filter(s => s.score > 0 && s.date && !isNaN(new Date(s.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const simStart = minDateObj < start ? minDateObj : start;
    let currentSim = new Date(simStart);
    currentSim.setHours(0, 0, 0, 0);

    let currentScore = 0;
    while (currentSim <= end) {
      const dateKey = currentSim.toISOString().split('T')[0];
      const daySessions = sortedGrowth.filter(s => {
        const d = new Date(s.date);
        return d.toISOString().split('T')[0] === dateKey;
      });

      if (daySessions.length > 0) {
        currentScore = Math.max(...daySessions.map(s => s.score));
      } else {
        currentScore = Math.max(0, currentScore - 10);
      }

      if (currentSim >= start) {
        dailyData15d.push({
          formattedDate: currentSim.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: currentScore
        });
      }
      currentSim.setDate(currentSim.getDate() + 1);
    }
  }

  const formattedGrowthData = timeRange === '15d' ? dailyData15d : allTimeData;

  const milestonesList = [];
  if (confidence < 41) {
    milestonesList.push({
      label: `Reach 41 Confidence score (Need ${41 - confidence} pts)`,
      completed: confidence >= 41
    });
    milestonesList.push({
      label: 'Complete at least 3 sessions',
      completed: (data?.totalSessions || 0) >= 3
    });
  } else if (confidence < 66) {
    milestonesList.push({
      label: `Reach 66 Confidence score (Need ${66 - confidence} pts)`,
      completed: confidence >= 66
    });
    milestonesList.push({
      label: 'Maintain a 3-day active streak',
      completed: (data?.streak || 0) >= 3
    });
  } else if (confidence < 86) {
    milestonesList.push({
      label: `Reach 86 Confidence score (Need ${86 - confidence} pts)`,
      completed: confidence >= 86
    });
    milestonesList.push({
      label: 'Maintain a 5-day active streak',
      completed: (data?.streak || 0) >= 5
    });
  } else {
    milestonesList.push({
      label: 'Maintain Elite status by practicing weekly',
      completed: true
    });
  }

  const avgScore = data?.averageScore || 0;
  const contentScoreVal = avgScore > 0 ? Math.min(100, Math.round(avgScore * 1.05)) : 0;
  const confidenceScoreVal = confidence || 0;
  const participationScoreVal = avgScore > 0 ? Math.min(100, Math.round(avgScore * 0.96)) : 0;
  const vocabularyScoreVal = avgScore > 0 ? Math.min(100, Math.round(avgScore * 1.02)) : 0;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = avgScore > 0 ? circumference - (avgScore / 100) * circumference : circumference;

  const getBadgeDesign = (badgeName) => {
    const map = {
      'First Discussion': { icon: <Target size={20} />, color: '#6366F1', gradient: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.03) 100%)' },
      'Discussion Starter': { icon: <Rocket size={20} />, color: '#0EA5E9', gradient: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0.03) 100%)' },
      'Strong Finisher': { icon: <Flag size={20} />, color: '#059669', gradient: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, rgba(5,150,105,0.03) 100%)' },
      'Consistent Speaker': { icon: <MessageCircle size={20} />, color: '#8B5CF6', gradient: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.03) 100%)' },
      'Streak Master': { icon: <Flame size={20} />, color: '#F97316', gradient: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 100%)' },
    };
    return map[badgeName] || { icon: <Trophy size={20} />, color: '#D97706', gradient: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, rgba(217,119,6,0.03) 100%)' };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="page-container">
      {/* Header section */}
      <motion.section 
        className="dash-header-section"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dash-welcome">
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p>Continue building your communication confidence through realistic AI sessions.</p>
        </div>
        <Link to="/gd/new" className="btn btn-primary" id="start-new-gd">
          <PlusCircle size={18} /> Start New GD
        </Link>
      </motion.section>

      {data?.activeSession && (
        <motion.div 
          className="ongoing-session-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ongoing-session-icon-bubble">
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Ongoing Session Detected</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Topic: <strong>{data.activeSession.topic}</strong> ({data.activeSession.difficulty} · {data.activeSession.duration}m)
              </p>
            </div>
          </div>
          <Link to={`/gd/${data.activeSession._id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Resume Session <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Stats row with separation borders */}
      <motion.section 
        className="stats-row"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} className="stat-item" variants={itemVariants}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* Main Grid: Progress Overview + Analytical Growth Chart */}
      <div className="dashboard-grid">
        {/* Progress Overview Section (moved to Left) */}
        <motion.section 
          className="dashboard-section progress-overview-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Progress Overview</h2>
            <span className="overview-timeframe">This Month</span>
          </div>
          
          <div className="progress-overview-box">
            <div className="progress-circle-wrap">
              <svg className="progress-circle-svg" width="100" height="100">
                <circle 
                  className="progress-circle-bg" 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  strokeWidth="8"
                />
                <circle 
                  className="progress-circle-fill" 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="progress-circle-text">
                <span className="progress-text-val">{avgScore}</span>
                <span className="progress-text-lbl">/100</span>
              </div>
            </div>

            <div className="progress-metrics-list">
              <div className="progress-metric-row">
                <div className="metric-left">
                  <div className="metric-icon-bubble" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1' }}>
                    <Award size={14} />
                  </div>
                  <span className="metric-name">Content</span>
                </div>
                <span className="metric-value">{contentScoreVal}/100</span>
              </div>

              <div className="progress-metric-row">
                <div className="metric-left">
                  <div className="metric-icon-bubble" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                    <Activity size={14} />
                  </div>
                  <span className="metric-name">Confidence</span>
                </div>
                <span className="metric-value">{confidenceScoreVal}/100</span>
              </div>

              <div className="progress-metric-row">
                <div className="metric-left">
                  <div className="metric-icon-bubble" style={{ background: 'rgba(249,115,22,0.08)', color: '#F97316' }}>
                    <Mic size={14} />
                  </div>
                  <span className="metric-name">Participation</span>
                </div>
                <span className="metric-value">{participationScoreVal}/100</span>
              </div>

              <div className="progress-metric-row">
                <div className="metric-left">
                  <div className="metric-icon-bubble" style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>
                    <BookOpen size={14} />
                  </div>
                  <span className="metric-name">Vocabulary</span>
                </div>
                <span className="metric-value">{vocabularyScoreVal}/100</span>
              </div>
            </div>
          </div>

          <div className="overall-improvement-row">
            <span>Overall Improvement</span>
            <span className="improvement-trend">
              <TrendingUp size={14} /> +{avgScore > 0 ? Math.round(avgScore / 8) : 0}%
            </span>
          </div>
        </motion.section>

        {/* Confidence Growth Section (moved to Right, size shortened) */}
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="dashboard-section-title" style={{ margin: 0 }}>Confidence Growth</h2>
            <div className="toggle-container" style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
              <button 
                onClick={() => setTimeRange('15d')} 
                style={{
                  border: 'none',
                  background: timeRange === '15d' ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                15 Days
              </button>
              <button 
                onClick={() => setTimeRange('all')} 
                style={{
                  border: 'none',
                  background: timeRange === 'all' ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                All Time
              </button>
            </div>
          </div>
          {formattedGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={formattedGrowthData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1C" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#1A1A1C" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                <XAxis dataKey="formattedDate" minTickGap={40} tick={{ fill: '#868E96', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#868E96', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E9ECEF', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.015)' }}
                  labelStyle={{ color: '#495057', fontWeight: 600 }}
                  itemStyle={{ color: '#1A1A1C' }}
                />
                <Area type="monotone" dataKey="score" stroke="#1A1A1C" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" dot={{ fill: '#1A1A1C', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>Complete your first GD session to generate speaking growth analytics.</p>
            </div>
          )}
        </motion.section>
      </div>

      {/* Recent Sessions list & Unlocked Badges / Readiness */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Sessions</h2>
            <Link to="/reports" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          {data?.recentSessions?.length > 0 ? (
            <div className="recent-list">
              {data.recentSessions.map((session, i) => (
                <Link to={`/reports/${session._id}`} key={i} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-topic">{session.topic}</span>
                    <span className="recent-meta">
                      <Clock size={12} /> {session.duration}m · {session.difficulty}
                    </span>
                  </div>
                  <div className="recent-score">
                    <Zap size={13} />
                    {session.totalScore}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent sessions found. Launch a new GD above.</p>
            </div>
          )}
        </motion.section>

        {/* Right column: Placement Readiness + Earned Badges stacked */}
        <div className="dashboard-right-stack">
          {/* Placement Readiness Section (restored to original detailed view) */}
          <motion.section 
            className="dashboard-section placement-readiness-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <h2 className="dashboard-section-title">Placement Readiness</h2>
            <div className="readiness-meter-wrapper">
              <div className="readiness-meter-header">
                <span className="readiness-tier-title" style={{ color: tierColor }}>
                  {tierName}
                </span>
                <span className="readiness-score-val">{confidence}/100</span>
              </div>
              
              <div className="readiness-gauge-bar">
                <div 
                  className="readiness-gauge-progress" 
                  style={{ width: `${readinessPercentage}%`, background: tierColor }}
                />
              </div>
            </div>

            <div className="readiness-details-list">
              <div className="readiness-detail-item">
                <ShieldCheck size={16} style={{ color: tierColor, flexShrink: 0 }} />
                <div className="item-content">
                  <strong>Current Status</strong>
                  <p>{tierDesc}</p>
                </div>
              </div>

              <div className="readiness-detail-item">
                <Building2 size={16} style={{ color: '#495057', flexShrink: 0 }} />
                <div className="item-content">
                  <strong>Target Recruiting Firms</strong>
                  <div className="target-firms-pill-list">
                    {targetCompany.split(', ').map((c, idx) => (
                      <span key={idx} className="target-firm-pill">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="readiness-detail-item">
                <Sparkles size={16} style={{ color: '#D97706', flexShrink: 0 }} />
                <div className="item-content">
                  <strong>Next Milestones</strong>
                  <div className="milestone-checklist">
                    {milestonesList.map((m, idx) => (
                      <div key={idx} className={`milestone-check-item ${m.completed ? 'is-completed' : ''}`}>
                        <span className="check-box-icon">{m.completed ? '✓' : '○'}</span>
                        <span className="check-label">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Earned Badges Hexagonal Stack */}
          <motion.section 
            className="dashboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <h2 className="dashboard-section-title">Earned Badges</h2>
            {data?.achievements?.length > 0 ? (
              <div className="achievements-hexagon-row">
                {data.achievements.map((a, i) => {
                  const design = getBadgeDesign(a.badgeName);
                  return (
                    <motion.div 
                      key={i} 
                      className="hexagon-badge-item"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                      <div className="hexagon-outer-wrap">
                        <div className="hexagon-outer" style={{ backgroundColor: `${design.color}1c` }}>
                          <div className="hexagon-inner" style={{ backgroundColor: design.color }}>
                            {design.icon}
                          </div>
                        </div>
                      </div>
                      <span className="hexagon-badge-name">{a.badgeName}</span>
                      <span className="hexagon-badge-desc">{a.description}</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No badges unlocked yet. Keep practicing to earn accomplishments.</p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
