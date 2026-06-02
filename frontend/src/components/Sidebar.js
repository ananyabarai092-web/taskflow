import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  LayoutDashboard, CheckSquare, ListTodo, Archive, BarChart3,
  Settings, User, LogOut, ChevronLeft, ChevronRight, Timer,
  Users, Shield, Sun, Moon, Zap, Target, Calendar
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const userNav = [
    { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
    { icon: ListTodo,        label: 'My Tasks',    path: '/tasks' },
    { icon: Calendar,        label: 'Calendar',    path: '/calendar' },
    { icon: Target,          label: 'Analytics',   path: '/analytics' },
    { icon: Timer,           label: 'Pomodoro',    path: '/pomodoro' },
    { icon: Archive,         label: 'Archive',     path: '/archive' },
  ];

  const adminNav = [
    { icon: Shield,      label: 'Admin Panel', path: '/admin' },
    { icon: Users,       label: 'Users',       path: '/admin' },
    { icon: BarChart3,   label: 'Analytics',   path: '/admin' },
  ];

  const bottomNav = [
    { icon: User,     label: 'Profile',  path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : userNav;
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <CheckSquare size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-name">TaskFlow</span>
              <span className="brand-sub">Pro</span>
            </div>
          )}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="user-avatar-lg">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-role">{user?.role === 'admin' ? '⚡ Admin' : '✦ Pro User'}</div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-section-label">MAIN MENU</span>}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path + item.label} to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={collapsed ? item.label : ''}>
              <Icon size={19} />
              {!collapsed && <span>{item.label}</span>}
              {isActive(item.path) && !collapsed && <div className="nav-active-dot" />}
            </Link>
          );
        })}

        {!collapsed && <span className="nav-section-label" style={{ marginTop: '1rem' }}>ACCOUNT</span>}
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={collapsed ? item.label : ''}>
              <Icon size={19} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item theme-toggle-btn" onClick={toggleDarkMode} title="Toggle theme">
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={19} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
