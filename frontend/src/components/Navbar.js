import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="navbar-logo">
          Todo App
        </Link>
        <div className="navbar-menu">
          <span className="navbar-user">
            <FaUser /> {user?.name}
          </span>
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link">Admin Panel</Link>
          )}
          {user?.role === 'user' && (
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          )}
          <button className="navbar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
