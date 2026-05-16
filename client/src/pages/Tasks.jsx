import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, User } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { token, user } = useContext(AuthContext);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');

  const fetchTasks = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setTasks(data);
  };

  const fetchProjects = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProjects(data);
    if(data.length > 0) setProjectId(data[0]._id);
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectId) return alert("Please create a project first");
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title, 
          description, 
          project: projectId, 
          priority,
          assignedTo: assignedTo || null
        })
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getProjectMembers = (taskProject) => {
    if (!taskProject) return [];
    const pid = taskProject._id || taskProject;
    const p = projects.find(proj => proj._id === pid);
    return p ? p.members : [];
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'var(--warning)' },
    { id: 'inprogress', title: 'In Progress', color: 'var(--primary)' },
    { id: 'done', title: 'Done', color: 'var(--success)' }
  ];

  const selectedProject = projects.find(p => p._id === projectId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem' }}>Tasks Board</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `2px solid ${col.color}`, paddingBottom: '12px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{col.title}</h3>
              <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '12px', fontWeight: '500' }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="task-list">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task._id} className="task-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '8px' }}>{task.title}</h4>
                  </div>
                  {task.project && <div className="task-project">{task.project.name}</div>}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="var(--text-secondary)" />
                      <select 
                        value={task.assignedTo ? task.assignedTo._id : ''} 
                        onChange={(e) => updateTask(task._id, { assignedTo: e.target.value || null })}
                        className="status-select"
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem', background: 'transparent' }}
                      >
                        <option value="" style={{ color: 'black' }}>Unassigned</option>
                        {getProjectMembers(task.project).map(m => (
                          <option key={m.user._id} value={m.user._id} style={{ color: 'black' }}>{m.user.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)', textTransform: 'capitalize' }}>
                        {task.priority}
                      </span>
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTask(task._id, { status: e.target.value })}
                        className="status-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <option value="todo" style={{ color: 'black' }}>To Do</option>
                        <option value="inprogress" style={{ color: 'black' }}>In Progress</option>
                        <option value="done" style={{ color: 'black' }}>Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="glass modal">
            <h2 style={{ marginBottom: '24px' }}>Create Task</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Update landing page" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Add some details..." />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Project</label>
                  <select 
                    className="modal-select"
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)}
                  >
                    {projects.length === 0 ? <option value="">No projects</option> : projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Assignee</label>
                  <select 
                    className="modal-select"
                    value={assignedTo} 
                    onChange={e => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {selectedProject && selectedProject.members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select 
                    className="modal-select"
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!projectId}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
