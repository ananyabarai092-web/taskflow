import React, { useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, changePassword, getProfile } from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Save, Flame, Target, CheckCircle2 } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const { user, login, token } = useContext(AuthContext);
  const [profile, setProfile] = useState({ name: '', bio: '', avatar: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    getProfile().then(r => {
      const u = r.data.user;
      setProfile({ name: u.name || '', bio: u.bio || '', avatar: u.avatar || '' });
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await updateProfile(profile);
      login(token, res.data.user);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setLoadingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setLoadingPassword(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoadingPassword(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <h2 style={{ fontWeight: 700 }}>Profile</h2>
        </header>
        <div className="page-content">
          <div className="profile-grid">
            {/* Left: avatar + stats */}
            <div className="profile-sidebar-card card">
              <div className="profile-avatar-wrap">
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="profile-avatar-img" />
                  : <div className="profile-avatar-initials">{initials}</div>
                }
              </div>
              <h3 style={{ textAlign: 'center', marginTop: '1rem' }}>{user?.name}</h3>
              <p className="text-secondary text-sm text-center">{user?.email}</p>
              <div className="profile-stats">
                <div className="profile-stat">
                  <Flame size={20} style={{ color: '#f97316' }} />
                  <div>
                    <div className="font-bold">{user?.streak || 0}</div>
                    <div className="text-xs text-muted">Day Streak</div>
                  </div>
                </div>
                <div className="profile-stat">
                  <Target size={20} style={{ color: '#3b82f6' }} />
                  <div>
                    <div className="font-bold">{user?.dailyGoal || 5}</div>
                    <div className="text-xs text-muted">Daily Goal</div>
                  </div>
                </div>
                <div className="profile-stat">
                  <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                  <div>
                    <div className="font-bold">{user?.productivityScore || 0}%</div>
                    <div className="text-xs text-muted">Score</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-forms">
              {/* Edit profile */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Edit Profile</h3>
                <form onSubmit={handleProfileSave} className="form-stack">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-with-icon">
                      <User className="input-icon" size={16} />
                      <input className="input-field" value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea className="input-field" rows={3} placeholder="Tell us about yourself..."
                      value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Avatar URL</label>
                    <input className="input-field" placeholder="https://..." value={profile.avatar}
                      onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loadingProfile}>
                    {loadingProfile ? <span className="spinner" /> : <><Save size={15} /> Save Profile</>}
                  </button>
                </form>
              </div>

              {/* Change password */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Change Password</h3>
                <form onSubmit={handlePasswordSave} className="form-stack">
                  {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
                    <div className="form-group" key={field}>
                      <label>{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                      <div className="input-with-icon">
                        <Lock className="input-icon" size={16} />
                        <input type="password" className="input-field"
                          value={passwords[field]}
                          onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                          required minLength={field !== 'currentPassword' ? 6 : undefined} />
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={loadingPassword}>
                    {loadingPassword ? <span className="spinner" /> : <><Save size={15} /> Update Password</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
