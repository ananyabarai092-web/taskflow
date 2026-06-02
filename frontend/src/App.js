import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Archive from './pages/Archive';
import Pomodoro from './pages/Pomodoro';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import PrivateRoute from './components/PrivateRoute';

const AppRoutes = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
        <Route path="/archive" element={<PrivateRoute><Archive /></PrivateRoute>} />
        <Route path="/pomodoro" element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <ToastContainer
        position="top-right" autoClose={3000}
        hideProgressBar={false} newestOnTop closeOnClick
        pauseOnFocusLoss draggable pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
