import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, PlusCircle, BarChart3, Trophy, LogOut } from 'lucide-react';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isMobile) {
    return (
      <div className="mobile-layout">
        <header className="mobile-header">
          <div className="mobile-logo-section">
            <span className="mobile-logo-text">Eloquo</span>
          </div>
          <div className="mobile-header-right">
            <div className="mobile-user-avatar">{user?.name?.[0] || 'U'}</div>
            <button className="mobile-header-logout" onClick={handleLogout} title="Logout" id="mobile-logout-btn">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mobile-main-content">
          <Outlet />
        </main>
        <nav className="mobile-bottom-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/gd/new" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>New GD</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <Trophy size={20} />
            <span>Leaderboard</span>
          </NavLink>
        </nav>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ padding: '0', display: 'flex', justifyContent: 'center', marginBottom: '32px', borderBottom: 'none' }}>
          <img src="/logo.svg" alt="Eloquo" className="sidebar-logo" style={{ width: '190px', height: '190px', margin: '-45px 0 -15px 0' }} />
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/gd/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>New GD</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Trophy size={20} />
            <span>Leaderboard</span>
          </NavLink>
          <button className="sidebar-link mobile-only" onClick={handleLogout} id="mobile-logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0] || 'U'}</div>
            <span className="sidebar-username">{user?.name || 'User'}</span>
          </div>
          <button className="sidebar-link" onClick={handleLogout} id="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
