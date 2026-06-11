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
    { name: 'AI Moderator', role: 'moderator', text: 'Welcome to this group discussion session. Today\'s topic is: "Is AI replacing human jobs or creating new opportunities?" Let\'s begin.' },
    { name: 'Rohan Kapoor', role: 'analyst', text: 'I believe AI will primarily automate repetitive tasks, which actually frees up human capital to focus on strategic and creative positions.' },
    { name: 'Priya Sharma', role: 'challenger', text: 'While that sounds ideal, the displacement rate is currently outstripping the creation of new roles. Millions of workers face a transition bottleneck.' },
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
          <div className="landing-brand">
            <img src="/logo.svg" alt="Eloquo" className="landing-logo" style={{ width: '190px', height: '105px', margin: '-45px 0' }} />
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <motion.h1 className="hero-title" variants={itemVariants}>
          Speak Clearly.<br />
          <span className="hero-gradient">Confidently & persuasively.</span>
        </motion.h1>
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Eloquo provides a modern environment to practice realistic group discussions
          with active AI peers. Conquer hesitation, master fluency, and prepare for placements.
        </motion.p>
        <motion.div className="hero-actions" variants={itemVariants}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Practicing Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            I have an account
          </Link>
        </motion.div>
      </motion.section>

      {/* Interactive Simulator Demo Section */}
      <section className="demo-section">
        <motion.div 
          className="demo-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="demo-header">
            <div className="demo-dots">
              <span className="dot-red"></span>
              <span className="dot-yellow"></span>
              <span className="dot-green"></span>
            </div>
            <span className="demo-title-text">Live Simulator Preview</span>
            <button className="demo-reset-btn" onClick={() => setDemoStep(0)}>Reset Demo</button>
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
                <div className="demo-msg-avatar">
                  {msg.name[0]}
                </div>
                <div className="demo-msg-body">
                  <div className="demo-msg-meta">
                    <span className="demo-msg-name">{msg.name}</span>
                    <span className="demo-msg-role-tag">{msg.role}</span>
                  </div>
                  <p className="demo-msg-text">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            <div className="demo-typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-label">AI is responding...</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Topics Showcase Directory (Table Accordion Layout) */}
      <section className="topics-section">
        <h2 className="section-title text-center" style={{ textAlign: 'center', marginBottom: '12px' }}>
          Explore Placement Topics
        </h2>
        <p className="section-subtitle-text">
          Select a category and expand a topic to preview talking parameters.
        </p>
        
        <div className="topic-tabs">
          {['tech', 'social', 'education'].map((category) => (
            <button 
              key={category}
              className={`topic-tab-btn ${activeTopic === category ? 'active' : ''}`} 
              onClick={() => {
                setActiveTopic(category);
                setExpandedTopic(null);
              }}
            >
              {category === 'tech' ? 'Technology' : category === 'social' ? 'Social & Economy' : 'Education & Career'}
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
                  <div className="difficulty-badge" data-difficulty={topic.difficulty.toLowerCase()}>
                    {topic.difficulty}
                  </div>
                  <div className="dir-meta-details">
                    <Clock size={13} />
                    <span>{topic.duration}</span>
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
                    <div className="dir-expand-inner">
                      <div className="dir-expand-grid">
                        <div className="dir-expand-column">
                          <h4>Key Discussion Focus</h4>
                          <ul>
                            {topic.talkingPoints.map((pt, idx) => (
                              <li key={idx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="dir-expand-column">
                          <h4>Active AI Discussants</h4>
                          <div className="peer-tags">
                            {topic.participants.map((p, idx) => (
                              <span key={idx} className="peer-tag">{p}</span>
                            ))}
                          </div>
                          <div className="sandbox-link-wrapper" style={{ marginTop: '20px' }}>
                            <Link to="/register" className="btn btn-primary btn-sm">
                              Launch Simulation <Play size={10} fill="currentColor" style={{ marginLeft: '4px' }} />
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
      </section>

      {/* Core Features Split-Typographic Layout */}
      <section className="features-editorial">
        <div className="features-editorial-inner">
          <div className="features-editorial-left">
            <h2 className="editorial-title">Designed to Master Placement Speaking</h2>
            <p className="editorial-desc">
              We stripped away unnecessary distractions and created a clean space focused on real discussion metrics. Elevate your confidence step by step.
            </p>
          </div>
          <div className="features-editorial-right">
            <motion.div 
              className="editorial-features-stack"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={containerVariants}
            >
              {featuresList.map((feat, i) => (
                <motion.div 
                  key={i} 
                  className="editorial-feature-item" 
                  variants={itemVariants}
                >
                  <span className="editorial-num">{feat.num}</span>
                  <div className="editorial-content">
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Start building your speaking skills today.</h2>
        <p>Zero setups. Access placement-level simulation instantly.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Eloquo. All rights reserved.</p>
      </footer>
    </div>
  );
}
