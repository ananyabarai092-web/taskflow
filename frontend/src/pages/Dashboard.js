import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getTasks, deleteTask, updateTask, getTaskStats, archiveTask, duplicateTask, bulkAction } from '../services/api';
import { toast } from 'react-toastify';
import TaskForm from '../components/TaskForm';
import Sidebar from '../components/Sidebar';
import {
  Plus, Filter, CheckCircle2, Clock, AlertCircle, ListTodo,
  Edit2, Trash2, Archive, Copy, LayoutGrid, List, Search,
  ChevronDown, MoreHorizontal, Zap, Target, TrendingUp, Star
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import '../styles/Dashboard.css';

const PRIORITY_COLOR = { Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

const SkeletonCard = () => (
  <div className="task-item">
    <div className="skeleton skeleton-text" style={{ width: '60%', height: '1.1rem' }} />
    <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.8rem', marginTop: '0.5rem' }} />
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon-wrap"><Icon size={22} /></div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('list'); // list | kanban
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', sortBy: 'createdAt' });
  const [selected, setSelected] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        getTasks({ ...filters, search }),
        getTaskStats()
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(id); toast.success('Task deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleArchive = async (id) => {
    try { await archiveTask(id); toast.success('Task archived'); fetchAll(); }
    catch { toast.error('Failed to archive'); }
  };

  const handleDuplicate = async (id) => {
    try { await duplicateTask(id); toast.success('Task duplicated'); fetchAll(); }
    catch { toast.error('Failed to duplicate'); }
  };

  const handleStatusToggle = async (task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await updateTask(task._id, { status: newStatus });
      fetchAll();
    } catch { toast.error('Failed to update'); }
  };

  const handleBulk = async (action) => {
    if (!selected.length) return;
    try {
      await bulkAction(selected, action);
      toast.success(`${selected.length} tasks updated`);
      setSelected([]);
      fetchAll();
    } catch { toast.error('Bulk action failed'); }
  };

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const selectAll = () => setSelected(tasks.map(t => t._id));

  const getDeadlineLabel = (deadline, status) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    if (status === 'completed') return null;
    if (isPast(d) && !isToday(d)) return { text: 'Overdue', cls: 'deadline-overdue' };
    if (isToday(d)) return { text: 'Due today', cls: 'deadline-today' };
    if (isTomorrow(d)) return { text: 'Due tomorrow', cls: 'deadline-tomorrow' };
    return null;
  };

  const productivityScore = stats.productivityScore || 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-right">
            <div className="productivity-pill">
              <Zap size={14} />
              <span>{productivityScore}% score</span>
            </div>
            <div className="user-avatar-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* Page header */}
          <div className="page-header">
            <div>
              <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-secondary text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
              <Plus size={17} /> New Task
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard label="Total Tasks" value={stats.total || 0} icon={ListTodo} color="blue" />
            <StatCard label="Completed" value={stats.completed || 0} icon={CheckCircle2} color="green"
              sub={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}% done` : null} />
            <StatCard label="Pending" value={stats.pending || 0} icon={Clock} color="yellow" />
            <StatCard label="Overdue" value={stats.overdue || 0} icon={AlertCircle} color="red" />
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div className="progress-section card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Daily Progress</span>
                <span className="text-sm text-secondary">{stats.completed}/{stats.total} tasks</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${productivityScore}%` }} />
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="toolbar card">
            <div className="toolbar-left">
              <Filter size={16} className="text-muted" />
              <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select className="filter-select" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select className="filter-select" value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value })}>
                <option value="createdAt">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="smart">Smart Sort</option>
              </select>
            </div>
            <div className="toolbar-right">
              {selected.length > 0 && (
                <div className="bulk-actions">
                  <span className="text-sm text-secondary">{selected.length} selected</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleBulk('complete')}>Complete</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleBulk('archive')}>Archive</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleBulk('delete')}>Delete</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setSelected([])}>Clear</button>
                </div>
              )}
              <div className="view-toggle">
                <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List view"><List size={16} /></button>
                <button className={`view-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')} title="Kanban view"><LayoutGrid size={16} /></button>
              </div>
            </div>
          </div>

          {/* Task list */}
          {view === 'list' ? (
            <div className="tasks-card card">
              {loading ? (
                Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : tasks.length === 0 ? (
                <div className="empty-state">
                  <ListTodo size={56} />
                  <h3>No tasks found</h3>
                  <p>Click "New Task" to get started</p>
                </div>
              ) : (
                <>
                  <div className="task-list-header">
                    <input type="checkbox" onChange={e => e.target.checked ? selectAll() : setSelected([])}
                      checked={selected.length === tasks.length && tasks.length > 0} />
                    <span className="text-xs text-muted font-semibold" style={{ letterSpacing: '0.05em' }}>TASK</span>
                  </div>
                  {tasks.map(task => {
                    const dl = getDeadlineLabel(task.deadline, task.status);
                    const isSelected = selected.includes(task._id);
                    return (
                      <div key={task._id} className={`task-item ${task.status === 'completed' ? 'task-done' : ''} ${isSelected ? 'task-selected' : ''}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(task._id)} className="task-check" />
                        <button className={`task-status-btn ${task.status === 'completed' ? 'done' : ''}`} onClick={() => handleStatusToggle(task)}>
                          {task.status === 'completed' && <CheckCircle2 size={14} />}
                        </button>
                        <div className="task-body" onClick={() => { setEditingTask(task); setShowForm(true); }}>
                          <div className={`task-title ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</div>
                          {task.description && <div className="task-desc">{task.description}</div>}
                          <div className="task-meta">
                            <span className={`badge ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                            {task.category && <span className="badge badge-category">{task.category}</span>}
                            {task.tags?.map(tag => <span key={tag} className="badge badge-tag">#{tag}</span>)}
                            {task.deadline && (
                              <span className="task-deadline">
                                <Clock size={12} />
                                {format(new Date(task.deadline), 'MMM d, yyyy')}
                              </span>
                            )}
                            {dl && <span className={`deadline-badge ${dl.cls}`}>{dl.text}</span>}
                            {task.subtasks?.length > 0 && (
                              <span className="subtask-count">
                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="task-actions">
                          <button className="btn btn-icon btn-ghost" onClick={() => { setEditingTask(task); setShowForm(true); }} title="Edit"><Edit2 size={15} /></button>
                          <div className="dropdown-wrap">
                            <button className="btn btn-icon btn-ghost" onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)} title="More"><MoreHorizontal size={15} /></button>
                            {openMenu === task._id && (
                              <div className="dropdown-menu" onMouseLeave={() => setOpenMenu(null)}>
                                <button onClick={() => { handleDuplicate(task._id); setOpenMenu(null); }}><Copy size={14} /> Duplicate</button>
                                <button onClick={() => { handleArchive(task._id); setOpenMenu(null); }}><Archive size={14} /> Archive</button>
                                <button className="danger" onClick={() => { handleDelete(task._id); setOpenMenu(null); }}><Trash2 size={14} /> Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
            <KanbanView tasks={tasks} loading={loading} onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
              onStatusToggle={handleStatusToggle} onDelete={handleDelete} onArchive={handleArchive} onRefresh={fetchAll} />
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => { setEditingTask(null); setShowForm(true); }} title="Add Task">
        <Plus size={24} />
      </button>

      {showForm && (
        <TaskForm task={editingTask} onClose={() => { setShowForm(false); setEditingTask(null); fetchAll(); }} />
      )}
    </div>
  );
};

/* ── Kanban View ─────────────────────────────────────────────── */
const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: '#6b7280' },
  { id: 'inprogress', label: 'In Progress',  color: '#f59e0b' },
  { id: 'done',       label: 'Done',         color: '#10b981' },
];

const KanbanView = ({ tasks, loading, onEdit, onStatusToggle, onDelete, onArchive, onRefresh }) => {
  const handleDrop = async (e, col) => {
    const id = e.dataTransfer.getData('taskId');
    try {
      const { updateTask } = await import('../services/api');
      await updateTask(id, { kanbanColumn: col });
      onRefresh();
    } catch {}
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => (t.kanbanColumn || 'todo') === col.id);
        return (
          <div key={col.id} className="kanban-col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}>
            <div className="kanban-col-header">
              <span className="kanban-dot" style={{ background: col.color }} />
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-cards">
              {loading ? Array(2).fill(0).map((_, i) => (
                <div key={i} className="kanban-card skeleton" style={{ height: 80 }} />
              )) : colTasks.map(task => (
                <div key={task._id} className="kanban-card"
                  draggable onDragStart={e => e.dataTransfer.setData('taskId', task._id)}>
                  <div className="kanban-card-title" onClick={() => onEdit(task)}>{task.title}</div>
                  <div className="kanban-card-meta">
                    <span className={`badge ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                    {task.deadline && <span className="text-xs text-muted">{format(new Date(task.deadline), 'MMM d')}</span>}
                  </div>
                  <div className="kanban-card-actions">
                    <button className="btn btn-icon btn-ghost" onClick={() => onEdit(task)}><Edit2 size={13} /></button>
                    <button className="btn btn-icon btn-ghost" onClick={() => onDelete(task._id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
