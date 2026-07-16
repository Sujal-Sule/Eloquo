import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mic, MicOff, Hand, SkipForward, LogOut, Clock, AlertTriangle, Send, Volume2 } from 'lucide-react';
import './GDRoomPage.css';

const PERSONALITY_COLORS = {
  analyst: '#6366F1',
  challenger: '#EF4444',
  supporter: '#22C55E',
  moderator: '#F59E0B',
  dominator: '#8B5CF6',
  user: '#0EA5E9'
};

export default function GDRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { messages, passCount, maxPasses, isMandatory, setSession, addMessage, addMessages, incrementPass, setMandatory, resetSession } = useSessionStore();

  const [session, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [mobileTab, setMobileTab] = useState('discussion');
  const [concluding, setConcluding] = useState(false);
  const [conclusionText, setConclusionText] = useState('');
  const [isListeningConclusion, setIsListeningConclusion] = useState(false);
  const conclusionRecognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const speakingRef = useRef(false);
  const transcriptRef = useRef('');
  const lastStartRef = useRef(0);
  const restartCountRef = useRef(0);
  const speechIdRef = useRef(0);

  useEffect(() => {
    const cached = sessionStorage.getItem(`gd_session_${sessionId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSessionData(parsed);
        setSession(parsed);
        const elapsedSeconds = parsed.startedAt ? Math.floor((Date.now() - new Date(parsed.startedAt).getTime()) / 1000) : 0;
        const remaining = Math.max(0, parsed.duration * 60 - elapsedSeconds);
        setTimeRemaining(remaining);
        if (remaining > 0) {
          startTimer(remaining);
        } else {
          setShowConclusion(true);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSession();
    return () => {
      resetSession();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        speakingRef.current = false;
        recognitionRef.current.abort();
      }
      if (conclusionRecognitionRef.current) {
        conclusionRecognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      speechIdRef.current = -1;
    };
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      const updated = {
        ...session,
        messages,
        passCount,
        maxPasses
      };
      sessionStorage.setItem(`gd_session_${sessionId}`, JSON.stringify(updated));
    }
  }, [session, messages, passCount, maxPasses, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      const s = res.data.data.session;
      const preloadedAudio = res.data.data.lastMessageAudio;
      setSessionData(s);
      setSession(s);
      const elapsedSeconds = s.startedAt ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000) : 0;
      const remaining = Math.max(0, s.duration * 60 - elapsedSeconds);
      setTimeRemaining(remaining);
      if (remaining > 0) {
        startTimer(remaining);
      } else {
        setShowConclusion(true);
      }

      if (s.messages && s.messages.length > 0) {
        const lastMsg = s.messages[s.messages.length - 1];
        if (lastMsg.speakerType === 'ai') {
          const msgKey = `${lastMsg.speakerName}_${lastMsg.message.slice(0, 20)}`;
          const spokenKey = `gd_spoken_${sessionId}_${msgKey}`;
          if (!sessionStorage.getItem(spokenKey)) {
            if (preloadedAudio && preloadedAudio.audioContent) {
              playAudioOnly(preloadedAudio.audioContent, preloadedAudio.mimeType, lastMsg.message, lastMsg.speakerName);
            } else {
              setTimeout(() => speakText(lastMsg.message, lastMsg.speakerName), 500);
            }
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load session');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setShowConclusion(true);
      }
    }, 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const speakText = useCallback(async (text, name) => {
    const msgKey = `${name}_${text.slice(0, 20)}`;
    sessionStorage.setItem(`gd_spoken_${sessionId}_${msgKey}`, 'true');
    const currentId = ++speechIdRef.current;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSpeaker(name);
      const res = await api.post('/sessions/tts', { text, speakerName: name });
      if (currentId !== speechIdRef.current || speechIdRef.current === -1) {
        return;
      }
      const { audioContent, mimeType } = res.data.data;
      const audio = new Audio(`data:${mimeType};base64,${audioContent}`);
      audioRef.current = audio;
      audio.onplay = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(name);
        }
      };
      audio.onended = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };
      await audio.play();
    } catch (err) {
      console.error(err);
      if (speechIdRef.current === currentId) {
        setActiveSpeaker(null);
      }
    }
  }, []);

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Using text mode.');
      setUseTextMode(true);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let fullTranscript = '';

    recognition.onresult = (event) => {
      let finalPart = '';
      let interimPart = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalPart += t;
        } else {
          interimPart += t;
        }
      }
      if (finalPart) {
        fullTranscript += finalPart + ' ';
      }
      const display = fullTranscript + interimPart;
      setTranscript(display);
      transcriptRef.current = display;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        const isNetworkUrl = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isNetworkUrl && window.location.protocol === 'http:') {
          toast.error(
            'Microphone access blocked on non-HTTPS network URLs. Use localhost/127.0.0.1, set up HTTPS, or add this site to chrome://flags/#unsafely-treat-insecure-origin-as-secure',
            { duration: 10000 }
          );
        } else {
          toast.error('Microphone or speech service not allowed. Switching to text mode.');
        }
        setUseTextMode(true);
        speakingRef.current = false;
        setSpeaking(false);
      } else if (event.error === 'no-speech') {
        console.log('No speech detected...');
      } else if (event.error === 'network') {
        console.log('Speech service network issue.');
      }
    };

    recognition.onend = () => {
      if (speakingRef.current) {
        const now = Date.now();
        const duration = now - lastStartRef.current;
        
        if (duration < 1500) {
          restartCountRef.current += 1;
        } else {
          restartCountRef.current = 0;
        }

        if (restartCountRef.current >= 3) {
          console.error('Speech recognition loop detected. Stopping.');
          speakingRef.current = false;
          setSpeaking(false);
          toast.error(
            'Speech recognition keeps stopping. If using Brave, enable "Use Google services for screen reader and speech recognition" in Settings.',
            { duration: 8000 }
          );
          setUseTextMode(true);
          return;
        }

        try {
          lastStartRef.current = Date.now();
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;
    speakingRef.current = true;
    setSpeaking(true);
    setActiveSpeaker('user');
    transcriptRef.current = '';
    fullTranscript = '';
    restartCountRef.current = 0;
    lastStartRef.current = Date.now();

    try {
      recognition.start();
      toast.success('Listening... Speak now!', { icon: '🎤', duration: 2000 });
    } catch (e) {
      console.error('Failed to start recognition:', e);
      toast.error('Failed to start microphone');
      speakingRef.current = false;
      setSpeaking(false);
      setActiveSpeaker(null);
    }
  };

  const stopSpeechRecognition = async () => {
    speakingRef.current = false;
    setSpeaking(false);
    setActiveSpeaker(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }

    const finalText = transcriptRef.current.trim();
    if (finalText) {
      await submitUserMessage(finalText);
    } else {
      toast('No speech detected. Try again or use text mode.', { icon: '💡' });
    }
    setTranscript('');
    transcriptRef.current = '';
  };

  const toggleConclusionSpeech = () => {
    if (isListeningConclusion) {
      if (conclusionRecognitionRef.current) {
        conclusionRecognitionRef.current.stop();
      }
      setIsListeningConclusion(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Speech recognition not supported in this browser.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let finalPart = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalPart += event.results[i][0].transcript + ' ';
          }
        }
        if (finalPart) {
          setConclusionText((prev) => prev + finalPart);
        }
      };
      recognition.onerror = (event) => {
        console.error(event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access blocked. Check browser permissions or HTTPS.');
        } else {
          toast.error(`Mic error: ${event.error}`);
        }
        setIsListeningConclusion(false);
      };
      recognition.onend = () => {
        setIsListeningConclusion(false);
      };
      conclusionRecognitionRef.current = recognition;
      setIsListeningConclusion(true);
      try {
        recognition.start();
        toast.success('Listening for conclusion...');
      } catch (e) {
        console.error(e);
        setIsListeningConclusion(false);
      }
    }
  };

  const playAudioOnly = useCallback(async (audioContent, mimeType, text, name) => {
    const currentId = ++speechIdRef.current;
    const msgKey = `${name}_${text.slice(0, 20)}`;
    sessionStorage.setItem(`gd_spoken_${sessionId}_${msgKey}`, 'true');

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSpeaker(name);

      const audio = new Audio(`data:${mimeType};base64,${audioContent}`);
      audioRef.current = audio;

      audio.onplay = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(name);
        }
      };
      audio.onended = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };

      await audio.play();
    } catch (err) {
      console.error(err);
      if (speechIdRef.current === currentId) {
        setActiveSpeaker(null);
      }
    }
  }, [sessionId]);

  const playAudioAndAddMessage = useCallback(async (audioContent, mimeType, msg) => {
    const currentId = ++speechIdRef.current;
    const msgKey = `${msg.speakerName}_${msg.message.slice(0, 20)}`;
    sessionStorage.setItem(`gd_spoken_${sessionId}_${msgKey}`, 'true');

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:${mimeType};base64,${audioContent}`);
      audioRef.current = audio;

      let added = false;
      const addOnce = () => {
        if (!added) {
          added = true;
          addMessage(msg);
        }
      };

      audio.onplay = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(msg.speakerName);
          addOnce();
        }
      };
      audio.onended = () => {
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        addOnce();
        if (speechIdRef.current === currentId) {
          setActiveSpeaker(null);
          audioRef.current = null;
        }
      };

      await audio.play();
      setTimeout(addOnce, 400);
    } catch (err) {
      console.error(err);
      addMessage(msg);
      if (speechIdRef.current === currentId) {
        setActiveSpeaker(null);
      }
    }
  }, [addMessage, sessionId]);

  const submitUserMessage = async (text) => {
    if (!text) return;
    setAiThinking(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/speak`, { transcript: text });
      const data = res.data.data;
      addMessage({
        speakerName: data.userMessage.speakerName,
        speakerType: 'user',
        message: data.userMessage.message,
        timestamp: new Date()
      });
      const aiMsg = {
        speakerName: data.aiResponse.speakerName,
        speakerType: 'ai',
        personality: data.aiResponse.personality,
        message: data.aiResponse.message,
        timestamp: new Date()
      };
      if (data.aiResponse.audioContent) {
        playAudioAndAddMessage(data.aiResponse.audioContent, data.aiResponse.mimeType, aiMsg);
      } else {
        addMessage(aiMsg);
        speakText(aiMsg.message, aiMsg.speakerName);
      }
      if (data.passCount !== undefined) {
        setMandatory(data.passCount >= maxPasses);
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setAiThinking(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    await submitUserMessage(textInput.trim());
    setTextInput('');
  };

  const handlePass = async () => {
    setAiThinking(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/pass`);
      const data = res.data.data;
      incrementPass();
      if (data.mandatory) {
        setMandatory(true);
        toast('Your participation is required. Please share your thoughts.', { icon: '🎤', duration: 5000 });
      } else {
        if (data.remainingPasses <= 1) {
          toast(`Pass ${data.passCount}/${data.passCount + data.remainingPasses} used. Try contributing soon!`, { icon: '⚠️' });
        }
        if (data.newMessage) {
          const aiMsg = {
            speakerName: data.newMessage.speakerName,
            speakerType: 'ai',
            personality: data.newMessage.personality,
            message: data.newMessage.message,
            timestamp: new Date()
          };
          if (data.newMessage.audioContent) {
            playAudioAndAddMessage(data.newMessage.audioContent, data.newMessage.mimeType, aiMsg);
          } else {
            addMessage(aiMsg);
            speakText(aiMsg.message, aiMsg.speakerName);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to pass');
    } finally {
      setAiThinking(false);
    }
  };

  const handleTriggerAI = async () => {
    setAiThinking(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/ai-respond`);
      const data = res.data.data;
      const aiMsg = {
        speakerName: data.speaker,
        speakerType: 'ai',
        personality: data.personality,
        message: data.message,
        timestamp: new Date()
      };
      if (data.audioContent) {
        playAudioAndAddMessage(data.audioContent, data.mimeType, aiMsg);
      } else {
        addMessage(aiMsg);
        speakText(aiMsg.message, aiMsg.speakerName);
      }
    } catch (err) {
      toast.error('AI response failed');
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndSession = async (userConcluded) => {
    if (conclusionRecognitionRef.current) {
      conclusionRecognitionRef.current.abort();
      conclusionRecognitionRef.current = null;
    }
    setIsListeningConclusion(false);
    try {
      const payload = { userConcluded };
      if (userConcluded && conclusionText.trim()) {
        payload.conclusionText = conclusionText.trim();
      }
      const res = await api.post(`/sessions/${sessionId}/end`, payload);
      toast.success(`Session completed! Score: ${res.data.data.overallScore}`);
      navigate(`/reports/${sessionId}`);
    } catch (err) {
      toast.error('Failed to end session');
    }
  };

  const testTTS = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const res = await api.post('/sessions/tts', { text: "Audio output is working correctly!", speakerName: "Zara Iyer" });
      const { audioContent, mimeType } = res.data.data;
      const audio = new Audio(`data:${mimeType};base64,${audioContent}`);
      audioRef.current = audio;
      audio.onplay = () => {
        toast.success("Playing test sound via centralized AI voice");
      };
      audio.onended = () => {
        audioRef.current = null;
      };
      audio.onerror = () => {
        toast.error("Centralized AI voice playback failed");
        audioRef.current = null;
      };
      await audio.play();
    } catch (err) {
      console.error(err);
      toast.error("Centralized AI voice test failed");
    }
  };

  if (loading) {
    return (
      <div className="gd-room-loading">
        <div className="loader" style={{ width: 40, height: 40 }} />
        <p>Loading discussion room...</p>
      </div>
    );
  }

  return (
    <div className="gd-room">
      <header className="gd-header">
        <div className="gd-header-left">
          <h1 className="gd-topic">{session?.topic}</h1>
          <div className="gd-meta">
            <span className="badge badge-primary">{session?.difficulty}</span>
            <span className="gd-participants">{session?.participantCount} participants</span>
          </div>
        </div>
        <div className="gd-header-right">
          <button className="btn btn-secondary btn-sm" onClick={testTTS} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={14} /> Test Sound
          </button>
          <div className={`gd-timer ${timeRemaining <= 120 ? 'warning' : ''} ${timeRemaining <= 30 ? 'critical' : ''}`}>
            <Clock size={16} />
            {formatTime(timeRemaining)}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowConclusion(true)} id="end-session-btn">
            <LogOut size={16} /> End
          </button>
        </div>
      </header>

      <div className="mobile-tabs-nav">
        <button className={`mobile-tab-btn ${mobileTab === 'discussion' ? 'active' : ''}`} onClick={() => setMobileTab('discussion')}>
          Discussion
        </button>
        <button className={`mobile-tab-btn ${mobileTab === 'info' ? 'active' : ''}`} onClick={() => setMobileTab('info')}>
          Info & Stats
        </button>
      </div>

      <div className={`gd-body ${mobileTab === 'discussion' ? 'show-discussion' : 'show-info'}`}>
        <div className="gd-discussion">
          <div className="active-speakers-strip">
            {session?.participants?.map((p, i) => {
              const isSpeaking = (p.participantType === 'user' && activeSpeaker === 'user') || p.name === activeSpeaker;
              const isThinking = p.participantType === 'ai' && aiThinking && !activeSpeaker;
              
              return (
                <div key={i} className={`speaker-bubble-card ${isSpeaking ? 'is-speaking' : ''} ${isThinking ? 'is-thinking' : ''}`}>
                  <div className="speaker-avatar-wrapper">
                    <div className="speaker-avatar" style={{ background: PERSONALITY_COLORS[p.personality] || PERSONALITY_COLORS.user }}>
                      {p.name?.[0]}
                    </div>
                    {isSpeaking && <span className="speaking-wave-dot" />}
                  </div>
                  <div className="speaker-bubble-meta">
                    <span className="speaker-bubble-name">{p.participantType === 'user' ? 'You' : p.name.split(' ')[0]}</span>
                    <span className="speaker-bubble-status">
                      {isSpeaking ? 'Speaking' : isThinking ? 'Thinking...' : 'Idle'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="messages-container">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.speakerType === 'user' ? 'message-user' : msg.speakerType === 'system' ? 'message-system' : 'message-ai'}`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                {msg.speakerType !== 'system' && (
                  <div className="message-avatar" style={{ background: PERSONALITY_COLORS[msg.personality] || PERSONALITY_COLORS.user }}>
                    {msg.speakerName?.[0] || '?'}
                  </div>
                )}
                <div className="message-content">
                  {msg.speakerType !== 'system' && (
                    <div className="message-header">
                      <span className="message-name">{msg.speakerName}</span>
                      {msg.personality && msg.personality !== 'user' && (
                        <span className="message-role">{msg.personality}</span>
                      )}
                    </div>
                  )}
                  <p className="message-text">{msg.message}</p>
                </div>
                {msg.speakerType === 'ai' && (
                  <button className="msg-speak-btn" onClick={() => speakText(msg.message, msg.speakerName)} title="Listen">
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            ))}

            {aiThinking && (
              <div className="message message-ai">
                <div className="message-avatar" style={{ background: '#6366F1' }}>AI</div>
                <div className="message-content">
                  <div className="thinking-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="gd-sidebar">
          <div className="participants-panel card">
            <h3>Participants</h3>
            {session?.participants?.map((p, i) => (
              <div key={i} className="participant-item">
                <div className="participant-avatar" style={{ background: PERSONALITY_COLORS[p.personality] || '#888' }}>
                  {p.name?.[0]}
                </div>
                <div className="participant-info">
                  <span className="participant-name">{p.name}</span>
                  <span className="participant-role">{p.participantType === 'user' ? 'You' : p.personality}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pass-tracker card">
            <h3>Pass Tracker</h3>
            <div className="pass-bar">
              <div className="pass-fill" style={{ width: `${(passCount / maxPasses) * 100}%` }} />
            </div>
            <span className="pass-text">{passCount}/{maxPasses} passes used</span>
          </div>

          {transcript && speaking && (
            <div className="transcript-panel card">
              <h3>Live Transcript</h3>
              <p className="transcript-text">{transcript}</p>
            </div>
          )}
        </div>
      </div>

      {isMandatory && (
        <div className="mandatory-banner">
          <AlertTriangle size={20} />
          <span>Your participation is required. Please share your thoughts to continue.</span>
        </div>
      )}

      <div className="gd-actions">
        {useTextMode ? (
          <form className="text-input-form" onSubmit={handleTextSubmit}>
            <input type="text" className="input-field" placeholder="Type your response..."
              value={textInput} onChange={(e) => setTextInput(e.target.value)} disabled={aiThinking} />
            <button type="submit" className="btn btn-primary" disabled={aiThinking || !textInput.trim()}>
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="voice-actions">
            {speaking ? (
              <button className="btn btn-danger btn-lg speak-btn recording" onClick={stopSpeechRecognition}>
                <MicOff size={22} /> Stop & Send
              </button>
            ) : (
              <button className="btn btn-primary btn-lg speak-btn" onClick={startSpeechRecognition}
                disabled={aiThinking}>
                <Mic size={22} /> Speak Now
              </button>
            )}
          </div>
        )}

        <div className="secondary-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setUseTextMode(!useTextMode)}>
            {useTextMode ? <><Mic size={14} /> Voice</> : <><Send size={14} /> Text</>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePass}
            disabled={aiThinking || isMandatory || passCount >= maxPasses}>
            <SkipForward size={14} /> Pass ({maxPasses - passCount} left)
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleTriggerAI} disabled={aiThinking}>
            <Hand size={14} /> Next AI
          </button>
        </div>
      </div>

      {showConclusion && (
        <div className="conclusion-overlay">
          <div className="conclusion-modal card">
            <h2>Discussion {timeRemaining <= 0 ? 'Complete' : 'Ending'}</h2>
            {!concluding ? (
              <>
                <p>Would you like to conclude the discussion?</p>
                <p className="conclusion-bonus">Concluding earns you <strong>+50 bonus points!</strong></p>
                <div className="conclusion-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => setConcluding(true)}>
                    Give Conclusion (+50 pts)
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleEndSession(false)}>
                    Skip Conclusion
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ position: 'relative', width: '100%' }}>
                  <textarea
                    className="conclusion-textarea"
                    placeholder="Type or dictate your final conclusion statement here..."
                    value={conclusionText}
                    onChange={(e) => setConclusionText(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      margin: '12px 0',
                      padding: '12px 48px 12px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleConclusionSpeech}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '24px',
                      background: isListeningConclusion ? '#EF4444' : 'var(--bg-secondary)',
                      color: isListeningConclusion ? '#fff' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      animation: isListeningConclusion ? 'pulse-ring 2s infinite' : 'none'
                    }}
                    title={isListeningConclusion ? "Stop Listening" : "Dictate Conclusion"}
                  >
                    {isListeningConclusion ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>
                <div className="conclusion-actions">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => handleEndSession(true)}
                    disabled={!conclusionText.trim()}
                  >
                    Submit & End
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    if (conclusionRecognitionRef.current) {
                      conclusionRecognitionRef.current.abort();
                      conclusionRecognitionRef.current = null;
                    }
                    setIsListeningConclusion(false);
                    setConcluding(false);
                    setConclusionText('');
                  }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
