import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getTasks } from '../services/api';
import { toast } from 'react-toastify';
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, isPast } from 'date-fns';
import '../styles/Calendar.css';

const PRIORITY_DOT = { Critical: '#ec4899', High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks({ limit: 200 })
      .then(res => setTasks(res.data.tasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  // Build calendar grid
  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);
  const calStart    = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd      = endOfWeek(monthEnd,   { weekStartsOn: 1 });

  const days = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  const getTasksForDay = (day) =>
    tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day));

  const selectedTasks = getTasksForDay(selectedDay);

  const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <CalIcon size={20} style={{ color: 'var(--text-2)' }} />
            <h2 style={{ fontWeight: 700 }}>Calendar</h2>
          </div>
        </header>

        <div className="page-content">
          <div className="calendar-layout">
            {/* Left — Calendar grid */}
            <div className="card calendar-card">
              {/* Month navigation */}
              <div className="cal-nav">
                <button className="btn btn-icon btn-ghost" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft size={20} />
                </button>
                <h3 className="cal-month-title">
                  {format(currentDate, 'MMMM yyyy')}
                </h3>
                <button className="btn btn-icon btn-ghost" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight size={20} />
                </button>
                <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}
                  onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date()); }}>
                  Today
                </button>
              </div>

              {/* Week day headers */}
              <div className="cal-grid-header">
                {WEEK_DAYS.map(w => (
                  <div key={w} className="cal-week-day">{w}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="cal-grid">
                {days.map((day, i) => {
                  const dayTasks = getTasksForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDay);
                  const isTodayDate = isToday(day);
                  const hasOverdue = dayTasks.some(t =>
                    t.status === 'pending' && isPast(new Date(t.deadline)) && !isToday(day)
                  );

                  return (
                    <div key={i}
                      className={`cal-day
                        ${!isCurrentMonth ? 'other-month' : ''}
                        ${isSelected ? 'selected' : ''}
                        ${isTodayDate ? 'today' : ''}
                        ${hasOverdue ? 'has-overdue' : ''}
                      `}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="cal-day-num">{format(day, 'd')}</span>
                      <div className="cal-day-dots">
                        {dayTasks.slice(0, 3).map((t, ti) => (
                          <span key={ti} className="cal-dot"
                            style={{ background: PRIORITY_DOT[t.priority] || '#6b7280' }}
                            title={t.title}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="cal-dot-more">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Selected day tasks */}
            <div className="calendar-sidebar">
              <div className="card">
                <div className="cal-detail-header">
                  <div>
                    <div className="cal-detail-date">{format(selectedDay, 'EEEE')}</div>
                    <div className="cal-detail-num">{format(selectedDay, 'MMMM d, yyyy')}</div>
                  </div>
                  <span className="badge badge-category">{selectedTasks.length} tasks</span>
                </div>

                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />
                  ))
                ) : selectedTasks.length === 0 ? (
                  <div className="cal-empty">
                    <CalIcon size={36} />
                    <p>No tasks due this day</p>
                  </div>
                ) : (
                  <div className="cal-task-list">
                    {selectedTasks.map(task => {
                      const overdue = task.status === 'pending' && isPast(new Date(task.deadline)) && !isToday(selectedDay);
                      return (
                        <div key={task._id} className={`cal-task-item ${overdue ? 'overdue' : ''} ${task.status === 'completed' ? 'done' : ''}`}>
                          <div className="cal-task-priority-bar"
                            style={{ background: PRIORITY_DOT[task.priority] }} />
                          <div className="cal-task-body">
                            <div className={`cal-task-title ${task.status === 'completed' ? 'line-through' : ''}`}>
                              {task.title}
                            </div>
                            <div className="cal-task-meta">
                              <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                                {task.priority}
                              </span>
                              <span className="badge badge-category">{task.category}</span>
                              {overdue && (
                                <span className="flex items-center gap-1" style={{ color: 'var(--red-600)', fontSize: '0.75rem', fontWeight: 600 }}>
                                  <AlertCircle size={12} /> Overdue
                                </span>
                              )}
                              {task.status === 'completed' && (
                                <span style={{ color: 'var(--green-600)', fontSize: '0.75rem', fontWeight: 600 }}>
                                  ✓ Done
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="card cal-legend">
                <p className="font-semibold text-sm" style={{ marginBottom: '0.75rem' }}>Priority Legend</p>
                {Object.entries(PRIORITY_DOT).map(([p, color]) => (
                  <div key={p} className="cal-legend-row">
                    <span className="cal-dot" style={{ background: color, width: 10, height: 10 }} />
                    <span className="text-sm text-secondary">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
