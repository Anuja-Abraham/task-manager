import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div className="decorative-circle" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
        <div className="decorative-circle" style={{ width: '250px', height: '250px', bottom: '50px', left: '-50px' }}></div>
        <h1>Streamline Your Workflow</h1>
        <p>Task Manager helps teams align their goals, track progress in real-time, and celebrate every milestone. Log in to pick up right where you left off.</p>
      </div>
      
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Enter your credentials to access your workspace.</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@company.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Log In</button>
          </form>
          
          <p className="auth-footer">
            New to our platform? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
