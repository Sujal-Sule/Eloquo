import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './AuthPages.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Fill all fields');
    if (password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.data.user, data.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-brand" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', borderBottom: 'none' }}>
          <img src="/logo.svg" alt="Eloquo" className="auth-logo" style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto' }} />
        </Link>
        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start building speaking confidence today</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="register-name">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input id="register-name" type="text" className="input-field input-with-icon"
                  placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="register-email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input id="register-email" type="email" className="input-field input-with-icon"
                  placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="register-password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input id="register-password" type="password" className="input-field input-with-icon"
                  placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="register-submit">
              {loading ? <div className="loader" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
