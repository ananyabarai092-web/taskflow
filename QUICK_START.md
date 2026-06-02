# ⚡ Quick Start Guide

## 🚀 Run the Application

**Option 1: Double-click `start.bat`**

**Option 2: Manual**
```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start
```

## 🌐 Access URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎨 New Features

### Dark Mode
- Click the **moon/sun icon** at bottom-right corner
- Theme preference is saved automatically

### Enhanced UI
- **Login Page:** Animated gradient background with glassmorphism
- **Dashboard:** Professional stats cards with hover effects
- **Tasks:** Color-coded priorities and smooth animations

## 📝 Quick Actions

### Register
1. Go to http://localhost:3000/register
2. Enter name, email, password
3. Click "Create Account"

### Login
1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"

### Create Task
1. Click "+ Add Task" button
2. Fill in task details
3. Click "Create Task"

### Toggle Dark Mode
- Click moon/sun icon (bottom-right)

## 🎯 Features Available

✅ User Authentication
✅ Task Management (CRUD)
✅ Priority Levels
✅ Categories
✅ Deadlines
✅ Filters & Sorting
✅ Statistics Dashboard
✅ Admin Panel
✅ Dark Mode ⭐ NEW
✅ Enhanced UI ⭐ NEW

## 📚 Documentation

- **FEATURES_LIST.md** - All 35+ features
- **IMPLEMENTATION_SUMMARY.md** - Complete overview
- **README.md** - Full documentation
- **API_DOCUMENTATION.md** - API reference

## 🆘 Troubleshooting

**Port in use?**
```bash
# Kill processes
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Database issues?**
```bash
cd backend
node clear-db.js
```

**Fresh start?**
1. Clear database
2. Restart servers
3. Register new account

---

**Enjoy TaskFlow! 🎉**
