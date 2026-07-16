import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shuffle, PenLine, Zap, Clock, Users, Brain, Play, ArrowLeft, Loader2 } from 'lucide-react';
import './NewGDPage.css';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Relaxed pace, simple vocabulary', icon: '🌱' },
  { id: 'medium', label: 'Medium', desc: 'Balanced discussion', icon: '⚡' },
  { id: 'hard', label: 'Hard', desc: 'Fast-paced, strong counterarguments', icon: '🔥' }
];

const DURATIONS = [
  { value: 5, label: 'Quick', desc: '5 minutes' },
  { value: 10, label: 'Normal', desc: '10 minutes' },
  { value: 20, label: 'Long', desc: '20 minutes' }
];

const PERSONALITIES = [
  { id: 'analyst', name: 'Zara Iyer', role: 'Analyst', desc: 'Uses facts and logic', icon: '🔬' },
  { id: 'challenger', name: 'Kabir Verma', role: 'Challenger', desc: 'Questions assumptions', icon: '⚔️' },
  { id: 'supporter', name: 'Aisha Nair', role: 'Supporter', desc: 'Builds on ideas', icon: '🤝' },
  { id: 'moderator', name: 'Reyansh Joshi', role: 'Moderator', desc: 'Guides discussion', icon: '🎯' },
  { id: 'dominator', name: 'Rudra Thakur', role: 'Dominator', desc: 'Strong opinions', icon: '👑' }
];

export default function NewGDPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [config, setConfig] = useState({
    topicMode: 'random',
    topic: '',
    customTopic: '',
    difficulty: 'medium',
    duration: 10,
    participantCount: 4,
    personalities: ['analyst', 'challenger', 'supporter'],
    startMode: 'ai'
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/topics/random');
      setTopics(res.data.data);
      if (res.data.data.length > 0) {
        setConfig(c => ({ ...c, topic: res.data.data[0].title }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aiCount = config.participantCount - 1;

  const handlePersonalityToggle = (id) => {
    setConfig(c => {
      const has = c.personalities.includes(id);
      if (has) {
        if (c.personalities.length <= 1) return c;
        return { ...c, personalities: c.personalities.filter(p => p !== id) };
      }
      if (c.personalities.length >= aiCount) {
        return { ...c, personalities: [...c.personalities.slice(1), id] };
      }
      return { ...c, personalities: [...c.personalities, id] };
    });
  };

  const handleStart = async () => {
    const topic = config.topicMode === 'custom' ? config.customTopic : config.topic;
    if (!topic) return toast.error('Please select or enter a topic');
    setCreating(true);
    try {
      const res = await api.post('/sessions', {
        topic,
        customTopic: config.topicMode === 'custom' ? config.customTopic : null,
        difficulty: config.difficulty,
        duration: config.duration,
        participantCount: config.participantCount,
        startMode: config.startMode,
        personalities: config.personalities.slice(0, aiCount)
      });
      toast.success('GD session created!');
      navigate(`/gd/${res.data.data.sessionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-container">
      <div className="newgd-header animate-fadeIn">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /> Back</button>
        <h1>Create New GD</h1>
        <span className="step-indicator">Step {step}/6</span>
      </div>

      <div className="newgd-progress">
        <div className="newgd-progress-bar" style={{ width: `${(step / 6) * 100}%` }} />
      </div>

      <motion.div 
        className="newgd-body"
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {step === 1 && (
          <div className="newgd-step">
            <h2><PenLine size={22} /> Choose Topic</h2>
            <div className="topic-mode-tabs">
              <button className={`tab ${config.topicMode === 'random' ? 'active' : ''}`}
                onClick={() => setConfig(c => ({ ...c, topicMode: 'random' }))}>
                <Shuffle size={16} /> Random Topic
              </button>
              <button className={`tab ${config.topicMode === 'custom' ? 'active' : ''}`}
                onClick={() => setConfig(c => ({ ...c, topicMode: 'custom' }))}>
                <PenLine size={16} /> Custom Topic
              </button>
            </div>
            {config.topicMode === 'random' ? (
              <div className="topic-list">
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loader" /></div>
                ) : topics.map((t, i) => (
                  <button key={i} className={`topic-option ${config.topic === t.title ? 'selected' : ''}`}
                    onClick={() => setConfig(c => ({ ...c, topic: t.title }))}>
                    <span className="topic-text">{t.title}</span>
                    <span className="topic-category badge badge-primary">{t.category}</span>
                  </button>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={fetchTopics} style={{ marginTop: 8 }}>
                  <Shuffle size={14} /> Shuffle Topics
                </button>
              </div>
            ) : (
              <input type="text" className="input-field" placeholder="Enter your discussion topic..."
                value={config.customTopic} onChange={(e) => setConfig(c => ({ ...c, customTopic: e.target.value }))} />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="newgd-step">
            <h2><Zap size={22} /> Select Difficulty</h2>
            <div className="option-cards">
              {DIFFICULTIES.map(d => (
                <button key={d.id} className={`option-card ${config.difficulty === d.id ? 'selected' : ''}`}
                  onClick={() => setConfig(c => ({ ...c, difficulty: d.id }))}>
                  <span className="option-icon">{d.icon}</span>
                  <span className="option-label">{d.label}</span>
                  <span className="option-desc">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="newgd-step">
            <h2><Clock size={22} /> Session Duration</h2>
            <div className="option-cards">
              {DURATIONS.map(d => (
                <button key={d.value} className={`option-card ${config.duration === d.value ? 'selected' : ''}`}
                  onClick={() => setConfig(c => ({ ...c, duration: d.value }))}>
                  <span className="option-icon"><Clock size={24} /></span>
                  <span className="option-label">{d.label}</span>
                  <span className="option-desc">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="newgd-step">
            <h2><Users size={22} /> Participants</h2>
            <p className="step-desc">Choose total participants (including you)</p>
            <div className="participant-options">
              {[3, 4, 5, 6].map(n => (
                <button key={n} className={`participant-btn ${config.participantCount === n ? 'selected' : ''}`}
                  onClick={() => setConfig(c => ({ ...c, participantCount: n, personalities: c.personalities.slice(0, n - 1) }))}>
                  <span className="participant-count">{n}</span>
                  <span className="participant-label">You + {n - 1} AI</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="newgd-step">
            <h2><Brain size={22} /> AI Personalities</h2>
            <p className="step-desc">Select {aiCount} personalities for your AI participants</p>
            <div className="personality-grid">
              {PERSONALITIES.map(p => (
                <button key={p.id} className={`personality-card ${config.personalities.includes(p.id) ? 'selected' : ''}`}
                  onClick={() => handlePersonalityToggle(p.id)}>
                  <span className="personality-icon">{p.icon}</span>
                  <span className="personality-name">{p.name}</span>
                  <span className="personality-role">{p.role}</span>
                  <span className="personality-desc">{p.desc}</span>
                </button>
              ))}
            </div>
            <p className="selected-count">{config.personalities.length}/{aiCount} selected</p>
          </div>
        )}

        {step === 6 && (
          <div className="newgd-step">
            <h2><Play size={22} /> Who Starts?</h2>
            <div className="option-cards">
              <button className={`option-card ${config.startMode === 'user' ? 'selected' : ''}`}
                onClick={() => setConfig(c => ({ ...c, startMode: 'user' }))}>
                <span className="option-icon">🙋</span>
                <span className="option-label">I'll Start</span>
                <span className="option-desc">Earn leadership bonus (+25 pts)</span>
              </button>
              <button className={`option-card ${config.startMode === 'ai' ? 'selected' : ''}`}
                onClick={() => setConfig(c => ({ ...c, startMode: 'ai' }))}>
                <span className="option-icon">🤖</span>
                <span className="option-label">Let AI Start</span>
                <span className="option-desc">Listen first, then join in</span>
              </button>
            </div>

            <div className="session-preview card">
              <h3>Session Preview</h3>
              <div className="preview-grid">
                <div className="preview-item"><span className="preview-label">Topic</span><span className="preview-value">{config.topicMode === 'custom' ? config.customTopic : config.topic}</span></div>
                <div className="preview-item"><span className="preview-label">Difficulty</span><span className="preview-value" style={{ textTransform: 'capitalize' }}>{config.difficulty}</span></div>
                <div className="preview-item"><span className="preview-label">Duration</span><span className="preview-value">{config.duration} minutes</span></div>
                <div className="preview-item"><span className="preview-label">Participants</span><span className="preview-value">You + {aiCount} AI</span></div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="newgd-actions">
        {step > 1 && (
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>
        )}
        {step < 6 ? (
          <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue</button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={creating} id="start-session-btn">
            {creating ? <><Loader2 size={18} className="spinning" /> Creating...</> : <><Play size={18} /> Start Discussion</>}
          </button>
        )}
      </div>
    </div>
  );
}
