import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    fetch(`${API_URL}/api/projects/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data));

    fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProjectsCount(data.length);
        const uniqueMembers = new Set();
        data.forEach(p => p.members.forEach(m => uniqueMembers.add(m.user._id || m.user)));
        setMembersCount(uniqueMembers.size);
      });
  }, [token]);

  if (!stats) return <div style={{ padding: '40px' }}>Loading...</div>;

  const total = stats.totalTasks || 1; // prevent div by zero
  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Unique Banner Design */}
      <div style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)', borderRadius: '20px', padding: '48px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)' }}>
        
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', right: '15%', top: '-30%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', left: '-5%', bottom: '-50%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', color: '#c7d2fe' }}>Workspace Overview</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', lineHeight: 1.2 }}>
            Good to see you! <br/> Your team is at {completionPercentage}% efficiency.
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#e0e7ff', maxWidth: '600px', lineHeight: 1.5 }}>
            You're currently managing <strong>{projectsCount} active projects</strong>. 
            There are {stats.inProgressTasks} tasks actively moving forward, while {stats.overdueTasks} tasks require your immediate attention.
          </p>
        </div>
        
        {/* Custom Stats Box instead of a simple ring */}
        <div style={{ zIndex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px' }}>
          <span style={{ fontSize: '1rem', color: '#e0e7ff', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Tasks Resolved</span>
          <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#ffffff', lineHeight: 1 }}>{stats.doneTasks}</span>
          <span style={{ fontSize: '0.9rem', color: '#c7d2fe', marginTop: '8px', fontWeight: '500' }}>out of {total} total</span>
        </div>
      </div>

      {/* Top 4 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <MetricCard title="Active projects" value={projectsCount} />
        <MetricCard title="Open tasks" value={stats.todoTasks + stats.inProgressTasks} />
        <MetricCard title="Overdue" value={stats.overdueTasks} />
        <MetricCard title="Team members" value={membersCount} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Status Flow */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Status flow</h3>
            <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{stats.totalTasks} tracked tasks</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <StatusFlowCard title="To do" value={stats.todoTasks} total={stats.totalTasks} color="#475569" bg="#f1f5f9" />
            <StatusFlowCard title="In progress" value={stats.inProgressTasks} total={stats.totalTasks} color="#2563eb" bg="#dbeafe" />
            <StatusFlowCard title="Review" value={0} total={stats.totalTasks} color="#d97706" bg="#fef3c7" />
            <StatusFlowCard title="Done" value={stats.doneTasks} total={stats.totalTasks} color="#16a34a" bg="#dcfce3" />
          </div>
        </div>

        {/* Priority Queue */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Priority queue</h3>
            <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{stats.overdueTasks} hot</span>
          </div>
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
            {stats.overdueTasks > 0 ? `${stats.overdueTasks} tasks require immediate attention!` : "No urgent or overdue tasks right now."}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div className="glass" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '12px', fontWeight: '600' }}>{title}</h4>
    <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a' }}>{value}</p>
    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: '#ccfbf1', opacity: 0.5 }}></div>
  </div>
);

const StatusFlowCard = ({ title, value, total, color, bg }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: bg, color: color, padding: '4px 8px', borderRadius: '12px' }}>{title}</span>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{value}</span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{pct}% of workload</p>
    </div>
  );
};

export default Dashboard;
