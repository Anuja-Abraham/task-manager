import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #bef264, #3b82f6)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold', fontSize: '1.2rem' }}>
          TT
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Task Manager</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Workplace execution</p>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderKanban size={18} /> Projects
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={18} /> Tasks
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'white', margin: '0 0 4px 0' }}>{user?.name || 'Loading...'}</h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 12px 0' }}>{user?.email || '...'}</p>
        <span style={{ display: 'inline-block', background: '#e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', marginBottom: '16px' }}>MEMBER</span>
        
        <button 
          onClick={() => { logout(); navigate('/login'); }} 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'white', color: '#0f172a', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s' }} 
          onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'} 
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
