import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/api';
import { toast } from 'react-toastify';
import { X, Save, Plus, Trash2, Tag, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/TaskForm.css';

const DEFAULT = {
  title: '', description: '', notes: '', priority: 'Medium',
  category: 'General', tags: [], deadline: '', reminderTime: '',
  isRecurring: false, recurringType: 'none',
  subtasks: [], timeEstimate: '', kanbanColumn: 'todo'
};

const TaskForm = ({ task, onClose }) => {
  const [form, setForm] = useState(DEFAULT);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        notes: task.notes || '',
        priority: task.priority || 'Medium',
        category: task.category || 'General',
        tags: task.tags || [],
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        reminderTime: task.reminderTime ? task.reminderTime.slice(0, 16) : '',
        isRecurring: task.isRecurring || false,
        recurringType: task.recurringType || 'none',
        subtasks: task.subtasks || [],
        timeEstimate: task.timeEstimate || '',
        kanbanColumn: task.kanbanColumn || 'todo'
      });
    }
  }, [task]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (t) { set('subtasks', [...form.subtasks, { title: t, completed: false }]); setSubtaskInput(''); }
  };

  const removeSubtask = (i) => set('subtasks', form.subtasks.filter((_, idx) => idx !== i));

  const toggleSubtask = (i) => set('subtasks', form.subtasks.map((s, idx) =>
    idx === i ? { ...s, completed: !s.completed } : s
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = { ...form, timeEstimate: form.timeEstimate ? Number(form.timeEstimate) : 0 };
      if (task) { await updateTask(task._id, payload); toast.success('Task updated'); }
      else { await createTask(payload); toast.success('Task created'); }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body task-form">
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input className="input-field" placeholder="What needs to be done?" value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea className="input-field" rows={2} placeholder="Add details..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Priority + Category */}
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="input-field" placeholder="Work, Personal..." value={form.category}
                onChange={e => set('category', e.target.value)} />
            </div>
          </div>

          {/* Deadline + Time Estimate */}
          <div className="form-row">
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" className="input-field" value={form.deadline}
                onChange={e => set('deadline', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Est. Time (min)</label>
              <div className="input-with-icon">
                <Clock className="input-icon" size={16} />
                <input type="number" className="input-field" placeholder="e.g. 30" min="0"
                  value={form.timeEstimate} onChange={e => set('timeEstimate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-wrap">
              <div className="tags-list">
                {form.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    #{tag} <button type="button" onClick={() => removeTag(tag)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="tag-input-row">
                <div className="input-with-icon" style={{ flex: 1 }}>
                  <Tag className="input-icon" size={14} />
                  <input className="input-field" placeholder="Add tag..." value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>Add</button>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label>Subtasks</label>
            <div className="subtasks-list">
              {form.subtasks.map((s, i) => (
                <div key={i} className="subtask-item">
                  <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(i)} />
                  <span className={s.completed ? 'line-through text-muted' : ''}>{s.title}</span>
                  <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeSubtask(i)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="subtask-input-row">
              <input className="input-field" placeholder="Add subtask..." value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSubtask}><Plus size={14} /></button>
            </div>
          </div>

          {/* Advanced toggle */}
          <button type="button" className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>

          {showAdvanced && (
            <>
              {/* Notes */}
              <div className="form-group">
                <label><FileText size={14} /> Notes</label>
                <textarea className="input-field" rows={3} placeholder="Private notes..."
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              {/* Reminder */}
              <div className="form-group">
                <label>Reminder</label>
                <input type="datetime-local" className="input-field" value={form.reminderTime}
                  onChange={e => set('reminderTime', e.target.value)} />
              </div>

              {/* Kanban Column */}
              <div className="form-group">
                <label>Kanban Column</label>
                <select className="input-field" value={form.kanbanColumn} onChange={e => set('kanbanColumn', e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Recurring */}
              <div className="checkbox-group">
                <input type="checkbox" id="recurring" checked={form.isRecurring}
                  onChange={e => set('isRecurring', e.target.checked)} />
                <label htmlFor="recurring">Recurring task</label>
              </div>
              {form.isRecurring && (
                <div className="form-group">
                  <select className="input-field" value={form.recurringType} onChange={e => set('recurringType', e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="modal-footer" style={{ padding: 0, paddingTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={16} /> {task ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
