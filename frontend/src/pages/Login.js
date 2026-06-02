import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, CheckSquare, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(formData);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo"><CheckSquare /></div>
          <h1>TaskFlow</h1>
          <p>Manage your tasks efficiently</p>
        </div>

        <div className="auth-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required className="input-field"
                  placeholder="you@example.com" />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input type={showPwd ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  required className="input-field" placeholder="••••••••" />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label><input type="checkbox" /><span>Remember me</span></label>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? <div className="spinner" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="auth-link">
            <p>Don't have an account? <Link to="/register">Sign up for free</Link></p>
          </div>
        </div>

        <p className="auth-footer">© 2024 TaskFlow. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
