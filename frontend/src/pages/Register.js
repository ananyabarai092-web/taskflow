import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register as registerApi } from '../services/api';
import { toast } from 'react-toastify';
import { Mail, Lock, User, UserPlus, CheckSquare } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerApi(formData);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <CheckSquare />
          </div>
          <h1>TaskFlow</h1>
          <p>Start managing your tasks today</p>
        </div>

        <div className="auth-card">
          <h2>Create Account</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Must be at least 6 characters</p>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <UserPlus />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-link">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="auth-footer">
          © 2024 TaskFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
