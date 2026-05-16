import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { token, user } = useContext(AuthContext);

  const fetchProjects = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error);
  };

  useEffect(() => { fetchProjects(); }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (projectId, email) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to add member');
      } else {
        alert('Member added successfully!');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem' }}>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No projects found. Create one to get started.</p>
        ) : projects.map(p => (
          <div key={p._id} className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{p.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', minHeight: '48px', lineHeight: '1.5' }}>{p.description || 'No description'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
              <span>{p.members.length} Members</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {p.createdBy === user?.id && (
                  <button 
                    onClick={() => {
                      const email = prompt("Enter the email address of the user you want to add:");
                      if(email) handleAddMember(p._id, email);
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    + Invite
                  </button>
                )}
                <span style={{ background: p.createdBy === user?.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: p.createdBy === user?.id ? 'var(--primary)' : 'var(--text-secondary)', padding: '4px 12px', borderRadius: '12px' }}>
                  {p.createdBy === user?.id ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass modal">
            <h2 style={{ marginBottom: '24px' }}>Create Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Marketing Campaign" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
