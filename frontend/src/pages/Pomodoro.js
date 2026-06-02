import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Play, Pause, RotateCcw, Coffee, Brain, Target } from 'lucide-react';
import '../styles/Pomodoro.css';

const MODES = {
  work:       { label: 'Focus',       duration: 25 * 60, color: '#3b82f6' },
  shortBreak: { label: 'Short Break', duration: 5  * 60, color: '#10b981' },
  longBreak:  { label: 'Long Break',  duration: 15 * 60, color: '#8b5cf6' },
};

const Pomodoro = () => {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const progress = ((current.duration - timeLeft) / current.duration) * 100;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'work') {
              setSessions(s => s + 1);
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro', { body: 'Break time! Take a rest.' });
              }
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m); setTimeLeft(MODES[m].duration); setRunning(false);
  };

  const reset = () => { setTimeLeft(current.duration); setRunning(false); };

  const circumference = 2 * Math.PI * 110;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <h2 style={{ fontWeight: 700 }}>Pomodoro Timer</h2>
        </header>
        <div className="page-content">
          <div className="pomodoro-container">
            {/* Mode tabs */}
            <div className="tabs" style={{ width: 'fit-content', margin: '0 auto' }}>
              {Object.entries(MODES).map(([key, val]) => (
                <button key={key} className={`tab-btn ${mode === key ? 'active' : ''}`} onClick={() => switchMode(key)}>
                  {key === 'work' ? <Brain size={15} /> : <Coffee size={15} />}
                  {val.label}
                </button>
              ))}
            </div>

            {/* Timer circle */}
            <div className="timer-circle-wrap">
              <svg width="280" height="280" viewBox="0 0 280 280">
                <circle cx="140" cy="140" r="110" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="140" cy="140" r="110" fill="none"
                  stroke={current.color} strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="timer-time">
                <span className="timer-digits">{mins}:{secs}</span>
                <span className="timer-mode-label">{current.label}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="timer-controls">
              <button className="btn btn-secondary btn-icon" onClick={reset} title="Reset"><RotateCcw size={20} /></button>
              <button className="timer-play-btn" onClick={() => setRunning(!running)}
                style={{ background: current.color }}>
                {running ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <div className="sessions-count" title="Sessions completed">
                <Target size={18} />
                <span>{sessions}</span>
              </div>
            </div>

            {/* Session dots */}
            <div className="session-dots">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className={`session-dot ${i < (sessions % 4) ? 'filled' : ''}`}
                  style={i < (sessions % 4) ? { background: current.color } : {}} />
              ))}
            </div>

            {/* Tips */}
            <div className="card pomodoro-tip">
              <p className="text-sm text-secondary text-center">
                {mode === 'work'
                  ? '💡 Stay focused. Avoid distractions for the next 25 minutes.'
                  : mode === 'shortBreak'
                  ? '☕ Take a short break. Stretch or grab a drink.'
                  : '🌿 Long break! Rest well before the next session.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
