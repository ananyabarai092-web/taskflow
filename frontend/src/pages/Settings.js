import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';
import { updateSettings, getProfile } from '../services/api';
import { toast } from 'react-toastify';
import { Sun, Moon, Bell, Layout, Target, Save } from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reminderNotifications: true,
    defaultView: 'list',
    dailyGoal: 5,
    weeklyGoal: 20,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(r => {
      const u = r.data.user;
      setSettings({
        emailNotifications: u.settings?.emailNotifications ?? true,
        reminderNotifications: u.settings?.reminderNotifications ?? true,
        defaultView: u.settings?.defaultView || 'list',
        dailyGoal: u.dailyGoal || 5,
        weeklyGoal: u.weeklyGoal || 20,
      });
    });
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <h2 style={{ fontWeight: 700 }}>Settings</h2>
        </header>
        <div className="page-content">
          <div className="settings-container">
            {/* Appearance */}
            <div className="card settings-section">
              <h3 className="settings-section-title"><Layout size={18} /> Appearance</h3>
              <div className="setting-row">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-secondary">Choose your preferred color theme</div>
                </div>
                <div className="theme-switch-wrap">
                  <button className={`theme-option ${!darkMode ? 'active' : ''}`} onClick={() => darkMode && toggleDarkMode()}>
                    <Sun size={16} /> Light
                  </button>
                  <button className={`theme-option ${darkMode ? 'active' : ''}`} onClick={() => !darkMode && toggleDarkMode()}>
                    <Moon size={16} /> Dark
                  </button>
                </div>
              </div>
              <div className="setting-row">
                <div>
                  <div className="font-medium">Default View</div>
                  <div className="text-sm text-secondary">Default task display mode</div>
                </div>
                <select className="input-field" style={{ width: 160 }} value={settings.defaultView}
                  onChange={e => set('defaultView', e.target.value)}>
                  <option value="list">List</option>
                  <option value="kanban">Kanban</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>
            </div>

            {/* Notifications */}
            <div className="card settings-section">
              <h3 className="settings-section-title"><Bell size={18} /> Notifications</h3>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive task reminders via email' },
                { key: 'reminderNotifications', label: 'In-App Reminders', desc: 'Get notified before deadlines' },
              ].map(({ key, label, desc }) => (
                <div className="setting-row" key={key}>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-secondary">{desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>

            {/* Goals */}
            <div className="card settings-section">
              <h3 className="settings-section-title"><Target size={18} /> Productivity Goals</h3>
              <div className="setting-row">
                <div>
                  <div className="font-medium">Daily Goal</div>
                  <div className="text-sm text-secondary">Tasks to complete per day</div>
                </div>
                <input type="number" className="input-field" style={{ width: 100 }} min={1} max={50}
                  value={settings.dailyGoal} onChange={e => set('dailyGoal', Number(e.target.value))} />
              </div>
              <div className="setting-row">
                <div>
                  <div className="font-medium">Weekly Goal</div>
                  <div className="text-sm text-secondary">Tasks to complete per week</div>
                </div>
                <input type="number" className="input-field" style={{ width: 100 }} min={1} max={200}
                  value={settings.weeklyGoal} onChange={e => set('weeklyGoal', Number(e.target.value))} />
              </div>
            </div>

            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={16} /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
