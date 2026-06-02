import React, { useState, useEffect } from 'react';
import { getAllUsers, deactivateUser, activateUser, deleteUser, getAnalytics, generateReports } from '../services/api';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { Users, BarChart3, FileText, CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('completed');
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => { fetchAnalytics(); fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await getAllUsers(); setUsers(res.data.users); }
    catch { toast.error('Failed to fetch users'); }
  };

  const fetchAnalytics = async () => {
    try { const res = await getAnalytics(); setAnalytics(res.data.analytics); }
    catch { toast.error('Failed to fetch analytics'); }
  };

  const handleDeactivate = async (id) => {
    try { await deactivateUser(id); toast.success('User deactivated'); fetchUsers(); }
    catch { toast.error('Failed to deactivate user'); }
  };

  const handleActivate = async (id) => {
    try { await activateUser(id); toast.success('User activated'); fetchUsers(); }
    catch { toast.error('Failed to activate user'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user and all their tasks?')) {
      try { await deleteUser(id); toast.success('User deleted'); fetchUsers(); fetchAnalytics(); }
      catch { toast.error('Failed to delete user'); }
    }
  };

  const handleGenerateReport = async () => {
    try { const res = await generateReports(reportType); setReports(res.data.report); toast.success('Report generated'); }
    catch { toast.error('Failed to generate report'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Admin Dashboard</h1>
              <p>Manage users, view analytics and generate reports</p>
            </div>
          </div>
        </div>

        <div className="dashboard-body">
          {/* Tabs */}
          <div className="admin-tabs">
            <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={16} /> Analytics
            </button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              <Users size={16} /> Users
            </button>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
              <FileText size={16} /> Reports
            </button>
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info"><p>Total Users</p><div className="stat-number">{analytics.users.total}</div></div>
                    <div className="stat-icon blue"><Users size={24} /></div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info"><p>Total Tasks</p><div className="stat-number">{analytics.tasks.total}</div></div>
                    <div className="stat-icon blue"><ListTodo size={24} /></div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info"><p>Completed</p><div className="stat-number green">{analytics.tasks.completed}</div></div>
                    <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-info"><p>Overdue</p><div className="stat-number red">{analytics.tasks.overdue}</div></div>
                    <div className="stat-icon red"><AlertCircle size={24} /></div>
                  </div>
                </div>
              </div>

              <div className="tasks-container" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>Tasks by Priority</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="task-badge priority-high">High: {analytics.priority.high}</span>
                  <span className="task-badge priority-medium">Medium: {analytics.priority.medium}</span>
                  <span className="task-badge priority-low">Low: {analytics.priority.low}</span>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tasks-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`task-badge ${user.role === 'admin' ? 'priority-high' : 'category'}`}>{user.role}</span></td>
                      <td><span className={`task-badge ${user.isActive ? 'priority-low' : 'priority-high'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        {user.isActive
                          ? <button className="btn btn-warning" style={{ marginRight: '0.5rem' }} onClick={() => handleDeactivate(user._id)}>Deactivate</button>
                          : <button className="btn btn-success" style={{ marginRight: '0.5rem' }} onClick={() => handleActivate(user._id)}>Activate</button>
                        }
                        <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tasks-container" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Generate Reports</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field" style={{ width: 'auto' }}>
                  <option value="completed">Completed Tasks</option>
                  <option value="pending">Pending Tasks</option>
                  <option value="overdue">Overdue Tasks</option>
                </select>
                <button className="btn btn-primary" onClick={handleGenerateReport}>Generate Report</button>
              </div>
              {reports.length > 0 && (
                <table className="admin-table">
                  <thead>
                    <tr><th>Title</th><th>User</th><th>Priority</th><th>Deadline</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {reports.map(task => (
                      <tr key={task._id}>
                        <td>{task.title}</td>
                        <td>{task.userId?.name}</td>
                        <td><span className={`task-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                        <td>{new Date(task.deadline).toLocaleDateString()}</td>
                        <td>{task.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
