import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import { getUserAnalytics, getTaskStats } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, Zap, Target, Flame, Clock, CheckCircle2 } from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/Analytics.css';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserAnalytics(), getTaskStats()])
      .then(([a, s]) => { setAnalytics(a.data.analytics); setStats(s.data.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeklyData = stats.weeklyData || Array(7).fill(0);
  const maxVal = Math.max(...weeklyData, 1);

  const categories = Object.entries(analytics?.categoryBreakdown || {});
  const totalCat = categories.reduce((s, [, v]) => s + v, 0);

  const CAT_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <h2 style={{ fontWeight: 700, color: 'var(--text)' }}>Analytics</h2>
        </header>
        <div className="page-content">
          {/* Top metric cards */}
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-icon-wrap"><Zap size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{stats.productivityScore || 0}%</div>
                <div className="stat-label">Productivity Score</div>
              </div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-icon-wrap"><Flame size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{analytics?.streak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card stat-yellow">
              <div className="stat-icon-wrap"><CheckCircle2 size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{analytics?.completedLast30Days || 0}</div>
                <div className="stat-label">Completed (30 days)</div>
              </div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-icon-wrap"><Clock size={22} /></div>
              <div className="stat-body">
                <div className="stat-value">{Math.round((analytics?.totalTimeSpent || 0) / 60)}h</div>
                <div className="stat-label">Time Tracked</div>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Weekly bar chart */}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Weekly Completions</h3>
              <div className="bar-chart">
                {weeklyData.map((val, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-wrap">
                      <div className="bar-fill" style={{ height: `${(val / maxVal) * 100}%` }}>
                        {val > 0 && <span className="bar-label">{val}</span>}
                      </div>
                    </div>
                    <span className="bar-day">{weekDays[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>By Category</h3>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8, borderRadius: 8 }} />
                ))
              ) : categories.length === 0 ? (
                <p className="text-muted text-sm">No data yet</p>
              ) : categories.map(([cat, count], i) => (
                <div key={cat} className="category-row">
                  <span className="category-dot" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                  <span className="category-name">{cat}</span>
                  <div className="category-bar-wrap">
                    <div className="category-bar-fill" style={{
                      width: `${(count / totalCat) * 100}%`,
                      background: CAT_COLORS[i % CAT_COLORS.length]
                    }} />
                  </div>
                  <span className="category-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority breakdown */}
          {stats.priorityBreakdown?.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem' }}>Priority Distribution</h3>
              <div className="priority-grid">
                {stats.priorityBreakdown.map(({ _id, count }) => (
                  <div key={_id} className="priority-stat-item">
                    <span className={`badge badge-${_id?.toLowerCase()}`}>{_id}</span>
                    <span className="font-bold" style={{ fontSize: '1.5rem' }}>{count}</span>
                    <span className="text-muted text-xs">tasks</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
