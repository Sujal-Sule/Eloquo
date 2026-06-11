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

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const speakingRef = useRef(false);
  const voicesLoadedRef = useRef(false);
  const transcriptRef = useRef('');
  const lastStartRef = useRef(0);
  const restartCountRef = useRef(0);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) voicesLoadedRef.current = true;
    };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);

    fetchSession();
    return () => {
      resetSession();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        speakingRef.current = false;
        recognitionRef.current.abort();
      }
      synth.cancel();
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      const s = res.data.data.session;
      setSessionData(s);
      setSession(s);
      setTimeRemaining(s.duration * 60);
      startTimer(s.duration * 60);

      if (s.messages && s.messages.length > 0) {
        const lastMsg = s.messages[s.messages.length - 1];
        if (lastMsg.speakerType === 'ai') {
          setTimeout(() => speakText(lastMsg.message, lastMsg.speakerName), 500);
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

  const speakText = useCallback((text, name) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const PARTICIPANT_INFO = {
      'Priya Sharma': { gender: 'female', index: 0 },
      'Ananya Das': { gender: 'female', index: 1 },
      'Arjun Mehta': { gender: 'male', index: 0 },
      'Vikram Rao': { gender: 'male', index: 1 },
      'Rohan Kapoor': { gender: 'male', index: 2 }
    };

    const getVoiceGender = (voice) => {
      const vName = voice.name.toLowerCase();
      if (vName.includes('+m') || vName.includes('male') || vName.includes('man') || vName.includes('david') || vName.includes('george') || vName.includes('ravi') || vName.includes('guy') || vName.includes('boy')) {
        return 'male';
      }
      if (vName.includes('+f') || vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('hazel') || vName.includes('susan') || vName.includes('heera') || vName.includes('girl')) {
        return 'female';
      }
      return 'female';
    };

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = synth.getVoices();
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      
      if (enVoices.length > 0) {
        const info = PARTICIPANT_INFO[name] || { gender: 'female', index: 0 };
        const matchedVoices = enVoices.filter(v => getVoiceGender(v) === info.gender);
        
        if (matchedVoices.length > 0) {
          utterance.voice = matchedVoices[info.index % matchedVoices.length];
        } else {
          utterance.voice = enVoices[info.index % enVoices.length];
        }
      }

      utterance.onstart = () => {
        console.log(`TTS speaking: ${name}`);
        setActiveSpeaker(name);
      };
      utterance.onerror = (e) => {
        console.error('TTS error:', e.error);
        setActiveSpeaker(null);
      };

      synth.speak(utterance);

      const keepAlive = setInterval(() => {
        if (!synth.speaking) {
          clearInterval(keepAlive);
        } else {
          synth.pause();
          synth.resume();
        }
      }, 5000);
      utterance.onend = () => {
        clearInterval(keepAlive);
        setActiveSpeaker(null);
      };
    };

    if (synth.getVoices().length === 0) {
      synth.addEventListener('voiceschanged', () => doSpeak(), { once: true });
      synth.getVoices();
    } else {
      doSpeak();
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
        toast.error('Microphone or speech service not allowed. Switching to text mode.');
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
        
        // If it starts and stops in less than 1.5 seconds, count it as a rapid failure
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
      addMessage({
        speakerName: data.aiResponse.speakerName,
        speakerType: 'ai',
        personality: data.aiResponse.personality,
        message: data.aiResponse.message,
        timestamp: new Date()
      });
      speakText(data.aiResponse.message, data.aiResponse.speakerName);
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
          addMessage({
            speakerName: data.newMessage.speakerName,
            speakerType: 'ai',
            personality: data.newMessage.personality,
            message: data.newMessage.message,
            timestamp: new Date()
          });
          speakText(data.newMessage.message, data.newMessage.speakerName);
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
      addMessage({
        speakerName: data.speaker,
        speakerType: 'ai',
        personality: data.personality,
        message: data.message,
        timestamp: new Date()
      });
      speakText(data.message, data.speaker);
    } catch (err) {
      toast.error('AI response failed');
    } finally {
      setAiThinking(false);
    }
  };

  const handleEndSession = async (userConcluded) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/end`, { userConcluded });
      toast.success(`Session completed! Score: ${res.data.data.overallScore}`);
      navigate(`/reports/${sessionId}`);
    } catch (err) {
      toast.error('Failed to end session');
    }
  };

  const testTTS = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      toast.error('Text-to-speech (TTS) is not supported by your browser.');
      return;
    }
    const voices = synth.getVoices();
    console.log('--- Speech Synthesis Debug Info ---');
    console.log('Voices available:', voices.length);
    voices.forEach((v, i) => console.log(`[${i}] ${v.name} (${v.lang}) - default: ${v.default}`));

    if (voices.length === 0) {
      toast.error('No speech voices found on your system! If on Linux Mint, try installing speech-dispatcher: "sudo apt install speech-dispatcher" then restart your browser.', { duration: 8000 });
      return;
    }

    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance("Audio output is working correctly!");
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      if (enVoices.length > 0) {
        utterance.voice = enVoices[0];
      } else {
        utterance.voice = voices[0];
      }

      utterance.onstart = () => {
        toast.success(`Playing sound using voice: ${utterance.voice?.name || 'default'}`);
      };
      utterance.onerror = (e) => {
        toast.error(`TTS Speech Error: ${e.error}`);
      };

      synth.speak(utterance);
    } catch (err) {
      toast.error(`TTS trigger failed: ${err.message}`);
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

      <div className="gd-body">
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
            <p>Would you like to conclude the discussion?</p>
            <p className="conclusion-bonus">Concluding earns you <strong>+50 bonus points!</strong></p>
            <div className="conclusion-actions">
              <button className="btn btn-primary btn-lg" onClick={() => handleEndSession(true)}>
                Give Conclusion (+50 pts)
              </button>
              <button className="btn btn-secondary" onClick={() => handleEndSession(false)}>
                Skip Conclusion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
