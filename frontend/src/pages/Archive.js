import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getTasks, restoreTask, deleteTask } from '../services/api';
import { toast } from 'react-toastify';
import { Archive, RotateCcw, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import '../styles/Dashboard.css';

const ArchivePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await getTasks({ archived: 'true', limit: 100 });
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load archive'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleRestore = async (id) => {
    try { await restoreTask(id); toast.success('Task restored'); fetch(); }
    catch { toast.error('Restore failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this task?')) return;
    try { await deleteTask(id, true); toast.success('Permanently deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Archive size={20} style={{ color: 'var(--text-2)' }} />
            <h2 style={{ fontWeight: 700 }}>Archive</h2>
          </div>
          <span className="text-sm text-secondary">{tasks.length} archived tasks</span>
        </header>
        <div className="page-content">
          <div className="tasks-card card">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="task-item">
                  <div className="skeleton" style={{ width: '60%', height: '1rem' }} />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <Archive size={56} />
                <h3>Archive is empty</h3>
                <p>Archived tasks will appear here</p>
              </div>
            ) : tasks.map(task => (
              <div key={task._id} className="task-item">
                <div className="task-body" style={{ cursor: 'default' }}>
                  <div className="task-title" style={{ opacity: 0.7 }}>{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  <div className="task-meta">
                    <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                    <span className="badge badge-category">{task.category}</span>
                    {task.deadline && (
                      <span className="task-deadline">
                        <Clock size={12} />
                        {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions" style={{ opacity: 1 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleRestore(task._id)} title="Restore">
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)} title="Delete permanently">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;
