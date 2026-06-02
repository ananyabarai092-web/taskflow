# Quick Setup Guide

## Prerequisites
- Node.js v18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

## Step-by-Step Setup

### 1. Install MongoDB (Local Development)

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env file with your configuration
# Minimum required:
# - MONGODB_URI (use local: mongodb://localhost:27017/todo-app)
# - JWT_SECRET (any random string, min 32 chars)
# - EMAIL_USER and EMAIL_PASSWORD (for Gmail)

# Seed database with sample data (optional)
node seed.js

# Start backend server
npm run dev
```

Backend will run on: http://localhost:5000

### 3. Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend will run on: http://localhost:3000

### 4. Test the Application

**Login Credentials (if you ran seed.js):**

Admin Account:
- Email: admin@todoapp.com
- Password: Admin@123

User Account:
- Email: john@example.com
- Password: User@123

Or register a new account at: http://localhost:3000/register

## Gmail Configuration for Email Notifications

1. Enable 2-Factor Authentication in your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an App Password
4. Use this password in .env file for EMAIL_PASSWORD

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl status mongodb
```

### Port Already in Use
```bash
# Backend (port 5000)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
# Change port in package.json or set PORT environment variable
```

### Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Project Structure

```
to-do-list/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Auth & error handling
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   └── services/    # Email & scheduler services
│   ├── server.js        # Entry point
│   ├── seed.js          # Database seeder
│   └── package.json
├── frontend/            # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
node seed.js       # Seed database with sample data
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## API Testing

Use Postman or curl to test API endpoints:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get tasks (replace TOKEN with actual JWT token)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

## Next Steps

1. ✅ Application is running locally
2. 📧 Configure email notifications (optional)
3. 🎨 Customize the UI/styling
4. 🚀 Deploy to production (see AWS_DEPLOYMENT.md)
5. 📊 Monitor and maintain

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review API_DOCUMENTATION.md for API details
3. See AWS_DEPLOYMENT.md for deployment guide

## Development Tips

- Use `npm run dev` for auto-restart on file changes
- Check browser console for frontend errors
- Check terminal for backend errors
- Use MongoDB Compass to view database
- Use React DevTools for debugging React components

---

**Happy Coding! 🎉**
