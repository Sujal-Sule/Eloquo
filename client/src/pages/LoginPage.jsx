import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, Lock, ArrowRight } from 'lucide-react';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.data.user, data.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-brand" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', borderBottom: 'none' }}>
          <img src="/logo.svg" alt="Eloquo" className="auth-logo" style={{ width: '200px', height: '200px', margin: '-50px 0' }} />
        </Link>
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to continue practicing</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input id="login-email" type="email" className="input-field input-with-icon"
                  placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input id="login-password" type="password" className="input-field input-with-icon"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="login-submit">
              {loading ? <div className="loader" /> : <>Log In <ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
