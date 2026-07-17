import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, Play, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0);
  const [activeTopic, setActiveTopic] = useState('tech');
  const [expandedTopic, setExpandedTopic] = useState(null);

  const demoMessages = [
    { name: 'Reyansh Joshi', role: 'moderator', text: 'Welcome to this group discussion session. Today\'s topic is: "Is AI replacing human jobs or creating new opportunities?" Let\'s begin.' },
    { name: 'Zara Iyer', role: 'analyst', text: 'I believe AI will primarily automate repetitive tasks, which actually frees up human capital to focus on strategic and creative positions.' },
    { name: 'Kabir Verma', role: 'challenger', text: 'While that sounds ideal, the displacement rate is currently outstripping the creation of new roles. Millions of workers face a transition bottleneck.' },
    { name: 'You (User)', role: 'user', text: 'Both points are valid. However, the solution lies in human-AI collaboration. The most valuable skill in the future will be AI orchestration.' }
  ];

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev < demoMessages.length - 1 ? prev + 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      if (demoStep === 0) {
        chatContainerRef.current.scrollTop = 0;
      } else {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [demoStep]);

  const topicsShowcase = {
    tech: [
      {
        title: 'Is Artificial Intelligence replacing human jobs?',
        difficulty: 'Medium',
        duration: '10 mins',
        talkingPoints: ['Job displacement vs Creation', 'Reskilling programs', 'Collaborative AI tools'],
        participants: ['Rohan (Analyst)', 'Priya (Challenger)']
      },
      {
        title: 'Should social media platforms be regulated by governments?',
        difficulty: 'Hard',
        duration: '15 mins',
        talkingPoints: ['Freedom of Speech', 'Misinformation controls', 'Monopoly concerns'],
        participants: ['Kabir (Supporter)', 'Vikram (Diplomat)']
      },
      {
        title: 'Will cryptocurrency replace traditional fiat banking?',
        difficulty: 'Hard',
        duration: '12 mins',
        talkingPoints: ['Decentralization', 'Security & Volatility', 'Central Bank Digital Currencies'],
        participants: ['Rohan (Analyst)', 'Vikram (Diplomat)']
      }
    ],
    social: [
      {
        title: 'Should public transport be completely free for everyone?',
        difficulty: 'Easy',
        duration: '10 mins',
        talkingPoints: ['Environmental impact', 'Economic funding models', 'Inclusivity benefits'],
        participants: ['Kabir (Supporter)', 'Priya (Challenger)']
      },
      {
        title: 'Is remote working better than traditional office environments?',
        difficulty: 'Easy',
        duration: '10 mins',
        talkingPoints: ['Work-life balance', 'Team synergy & Culture', 'Operational costs'],
        participants: ['Vikram (Diplomat)', 'Rohan (Analyst)']
      },
      {
        title: 'Are physical libraries still relevant in the digital age?',
        difficulty: 'Medium',
        duration: '8 mins',
        talkingPoints: ['Community spaces', 'Information credibility', 'Digital infrastructure'],
        participants: ['Kabir (Supporter)', 'Priya (Challenger)']
      }
    ],
    education: [
      {
        title: 'Is online education better than classroom-based learning?',
        difficulty: 'Medium',
        duration: '10 mins',
        talkingPoints: ['Accessibility', 'Peer socialization', 'Practical lab limitations'],
        participants: ['Rohan (Analyst)', 'Priya (Challenger)']
      },
      {
        title: 'Should coding be taught as a mandatory language in schools?',
        difficulty: 'Easy',
        duration: '12 mins',
        talkingPoints: ['Logical reasoning', 'Future career trends', 'Curriculum congestion'],
        participants: ['Vikram (Diplomat)', 'Kabir (Supporter)']
      },
      {
        title: 'Do college degrees guarantee successful professional careers?',
        difficulty: 'Hard',
        duration: '15 mins',
        talkingPoints: ['Alternative paths', 'Credential inflation', 'Practical experience'],
        participants: ['Priya (Challenger)', 'Rohan (Analyst)']
      }
    ]
  };

  const featuresList = [
    {
      num: '01',
      title: 'Diverse AI Personalities',
      desc: 'Engage with distinct logical thinkers, critics, and supporters that adjust their debating style to push your critical thinking.'
    },
    {
      num: '02',
      title: 'Safe, Judgment-Free Environment',
      desc: 'Build communication fluency and eliminate speaking hesitation in private sessions before facing real interviews.'
    },
    {
      num: '03',
      title: 'Advanced Vocabulary Enrichment',
      desc: 'Receive automated vocabulary critiques, alternative phrasing suggestions, and placement readiness scores after every session.'
    },
    {
      num: '04',
      title: 'Detailed Analytical Reporting',
      desc: 'Track speaking turns, time distribution, language fluency, and observe confidence progress mapped over time.'
    },
    {
      num: '05',
      title: 'Interactive Placement Gamification',
      desc: 'Maintain daily practice habits with streak tracking, speak milestones, and climb the student leaderboards.'
    }
  ];

  // Animation variants
  const heroVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const toggleExpandTopic = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.svg" alt="Eloquo" className="landing-logo" style={{ width: '190px', height: '105px', margin: '-45px 0' }} />
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="landing-grid-container">
        <aside className="landing-left-panel">
          <motion.div 
            className="hero"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
          >
            <motion.h1 className="hero-title" variants={itemVariants}>
              Speak Clearly.<br />
              <span className="hero-gradient">Confidently & persuasively.</span>
            </motion.h1>
            
            <motion.div className="hero-flower-dec" variants={itemVariants} style={{ margin: '24px 0', display: 'flex' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
                <rect x="10" y="2" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="10" y="18" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="2" y="10" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="18" y="10" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="5" y="5" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="15" y="5" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="5" y="15" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="15" y="15" width="4" height="4" fill="#D4E2EC" stroke="#1A2D42" stroke-width="2" />
                <rect x="10" y="10" width="4" height="4" fill="#F4F3EF" stroke="#1A2D42" stroke-width="2" />
              </svg>
            </motion.div>

            <motion.p className="hero-subtitle" variants={itemVariants}>
              Eloquo provides a judgment-free virtual environment to practice group discussions
              with active AI peers. Conquer stage fear, master fluency, and get ready for placement interviews.
            </motion.p>
            <motion.div className="hero-actions" variants={itemVariants}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Start Practicing Free <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div className="retro-status-card card" variants={itemVariants} style={{ marginTop: '24px', textAlign: 'left', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 'bold' }}>
                <span>SYSTEM_STATUS.LOG</span>
                <span className="typing-dot" style={{ background: '#8DE0A6', opacity: 1, animation: 'pulse 1.4s infinite' }}></span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>&gt; AIDiscussant.engine: loaded (5 personalities)</div>
                <div>&gt; VoiceSynthesis: Gemini-Sarvam dual pipeline active</div>
                <div>&gt; UserDictation: WebSpeechAPI debounced</div>
              </div>
            </motion.div>
          </motion.div>
        </aside>

        <main className="landing-right-panel">
          <div className="landing-section-card card">
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '4px' }}>01. LIVE PREVIEW</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Observe a mock session in progress. Active speakers auto-highlight in real-time.</p>
            </div>
            
            <div className="demo-container">
              <div className="demo-header">
                <div className="demo-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <span className="demo-title-text" style={{ fontFamily: 'var(--font-mono)' }}>Live Simulator Preview</span>
                <button className="demo-reset-btn" onClick={() => setDemoStep(0)} style={{ fontFamily: 'var(--font-mono)' }}>Reset</button>
              </div>
              <div className="demo-messages-list" ref={chatContainerRef}>
                {demoMessages.slice(0, demoStep + 1).map((msg, i) => (
                  <motion.div 
                    key={i} 
                    className={`demo-msg-item msg-${msg.role}`}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  >
                    <div className="demo-msg-avatar" style={{ borderRadius: 'var(--radius-md)', border: '3px solid var(--border-color)' }}>
                      {msg.name[0]}
                    </div>
                    <div className="demo-msg-body">
                      <div className="demo-msg-meta">
                        <span className="demo-msg-name">{msg.name}</span>
                        <span className="demo-msg-role-tag" style={{ fontFamily: 'var(--font-mono)' }}>{msg.role}</span>
                      </div>
                      <p className="demo-msg-text" style={{ border: '3px solid var(--border-color)' }}>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                <div className="demo-typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-label" style={{ fontFamily: 'var(--font-mono)' }}>AI is responding...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-section-card card">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '4px' }}>02. PLACEMENT TOPICS</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Click tabs to preview custom scenarios designed for tech and corporate drives.</p>
            </div>
            
            <div className="topic-tabs">
              {['tech', 'social', 'education'].map((category) => (
                <button 
                  key={category}
                  className={`topic-tab-btn ${activeTopic === category ? 'active' : ''}`} 
                  onClick={() => {
                    setActiveTopic(category);
                    setExpandedTopic(null);
                  }}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {category === 'tech' ? 'Tech' : category === 'social' ? 'Social' : 'Edu'}
                </button>
              ))}
            </div>

            <motion.div 
              className="topics-directory-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={activeTopic}
            >
              {topicsShowcase[activeTopic].map((topic, i) => (
                <motion.div 
                  key={i} 
                  className={`directory-row-item ${expandedTopic === i ? 'is-expanded' : ''}`}
                  variants={itemVariants}
                >
                  <div 
                    className="directory-row-header"
                    onClick={() => toggleExpandTopic(i)}
                  >
                    <div className="dir-col-main">
                      <span className="dir-index">0{i + 1}</span>
                      <span className="dir-title">{topic.title}</span>
                    </div>
                    <div className="dir-col-meta">
                      <div className="difficulty-badge" data-difficulty={topic.difficulty.toLowerCase()} style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '2px 6px' }}>
                        {topic.difficulty}
                      </div>
                      <div className="dir-icon-toggle">
                        {expandedTopic === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedTopic === i && (
                      <motion.div 
                        className="directory-row-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="dir-expand-inner" style={{ paddingLeft: '54px' }}>
                          <div className="dir-expand-grid">
                            <div className="dir-expand-column">
                              <h4 style={{ fontFamily: 'var(--font-mono)' }}>Focus Points</h4>
                              <ul>
                                {topic.talkingPoints.map((pt, idx) => (
                                  <li key={idx}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="dir-expand-column">
                              <h4 style={{ fontFamily: 'var(--font-mono)' }}>AI Cast</h4>
                              <div className="peer-tags">
                                {topic.participants.map((p, idx) => (
                                  <span key={idx} className="peer-tag" style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>{p}</span>
                                ))}
                              </div>
                              <div className="sandbox-link-wrapper" style={{ marginTop: '16px' }}>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                  Try Now <Play size={10} fill="currentColor" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="landing-section-card card">
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '4px' }}>03. DESIGN INTEGRITY</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Built specifically to reduce nervousness and reward preparation.</p>
            </div>
            
            <div className="editorial-features-stack">
              {featuresList.map((feat, i) => (
                <div key={i} className="editorial-feature-item" style={{ padding: '20px 0', borderBottom: '3px solid var(--border-color)' }}>
                  <span className="editorial-num">0{i + 1}</span>
                  <div className="editorial-content">
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>{feat.title}</h3>
                    <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-section-card card" style={{ background: 'var(--bg-elevated)', border: '3px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', marginBottom: '12px' }}>Start practicing today.</h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>Get instant feedback on your communication, vocabulary, and logic.</p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', width: 'auto' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>

          <footer className="landing-footer" style={{ padding: '32px 0 0 0', marginTop: '48px', borderTop: '3px solid var(--border-color)', textAlign: 'center' }}>
            <p>© {new Date().getFullYear()} Eloquo. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
