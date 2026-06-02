# To-Do List Management System

A full-stack production-ready task management application with user authentication, admin panel, email notifications, and comprehensive task management features.

## 🚀 Features

### User Features
- User registration and login with JWT authentication
- Create, read, update, and delete tasks
- Set task priority (High, Medium, Low)
- Categorize tasks
- Set deadlines and reminders
- Mark tasks as completed/pending
- Filter and sort tasks by priority, deadline, category
- Duplicate task prevention
- Task statistics dashboard
- Recurring tasks (daily/weekly)
- Email notifications for task reminders

### Admin Features
- Admin dashboard with analytics
- User management (view, activate, deactivate, delete)
- View all system tasks
- Generate reports (completed, pending, overdue tasks)
- System-wide statistics

## 🛠️ Tech Stack

**Frontend:**
- React.js 18
- React Router v6
- Axios
- React Toastify
- React Icons
- Date-fns

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for email notifications
- Node-cron for scheduled tasks
- Helmet for security
- Express Rate Limit
- Mongo Sanitize

## 📁 Project Structure

```
to-do-list/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── services/
│   │       ├── emailService.js
│   │       └── schedulerService.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── AdminPanel.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── TaskList.css
│   │   │   ├── TaskForm.css
│   │   │   ├── Navbar.css
│   │   │   └── Admin.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd to-do-list
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Backend Environment**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@todoapp.com
FRONTEND_URL=http://localhost:3000
```

4. **Start Backend Server**
```bash
npm run dev
```
Backend will run on http://localhost:5000

5. **Frontend Setup**
```bash
cd ../frontend
npm install
```

6. **Start Frontend**
```bash
npm start
```
Frontend will run on http://localhost:3000

### Using Docker

1. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- MongoDB on port 27017
- Backend on port 5000
- Frontend on port 80

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication in Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use the generated password in EMAIL_PASSWORD

### AWS SES Setup (Production)
1. Verify your domain in AWS SES
2. Configure AWS credentials in .env
3. Update emailService.js to use SES

## 🔐 Default Admin Account

Create admin user manually in MongoDB:
```javascript
{
  name: "Admin",
  email: "admin@todoapp.com",
  password: "$2a$10$...", // Hash of "Admin@123"
  role: "admin",
  isVerified: true,
  isActive: true
}
```

Or register normally and update role to "admin" in database.

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Tasks
- GET `/api/tasks` - Get all user tasks (with filters)
- POST `/api/tasks` - Create new task
- GET `/api/tasks/:id` - Get single task
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task
- GET `/api/tasks/stats/overview` - Get task statistics

### Admin
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/deactivate` - Deactivate user
- PUT `/api/admin/users/:id/activate` - Activate user
- DELETE `/api/admin/users/:id` - Delete user
- GET `/api/admin/tasks` - Get all tasks
- GET `/api/admin/analytics` - Get system analytics
- GET `/api/admin/reports?type=completed|pending|overdue` - Generate reports

## 🚀 AWS Deployment

### Prerequisites
- AWS Account
- AWS CLI configured
- MongoDB Atlas account

### Step 1: Setup MongoDB Atlas
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string

### Step 2: Setup AWS SES
1. Verify email/domain in AWS SES
2. Request production access
3. Configure credentials

### Step 3: Deploy Backend to EC2

```bash
# Launch EC2 instance (Ubuntu)
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd to-do-list/backend
npm install --production

# Configure environment
nano .env
# Add production values

# Start with PM2
pm2 start server.js --name todo-backend
pm2 startup
pm2 save
```

### Step 4: Deploy Frontend to S3 + CloudFront

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Configure CloudFront distribution
# Point to S3 bucket
# Add custom domain (optional)
```

### Step 5: Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd backend
eb init

# Create environment
eb create todo-production

# Deploy
eb deploy
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Helmet.js for HTTP headers security
- Rate limiting (100 requests per 10 minutes)
- MongoDB injection prevention
- XSS protection
- CORS configuration
- Input validation

## 📊 Algorithms Implemented

1. **Task Sorting Algorithm**: Multi-criteria sorting (priority, deadline, date)
2. **Duplicate Detection**: Same title + same day check
3. **Notification Scheduler**: Cron-based reminder system (every 15 minutes)
4. **Overdue Detection**: Real-time deadline comparison
5. **Recurring Task Handler**: Daily cron job for task regeneration

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Performance Optimizations

- Database indexing on userId, status, deadline
- Pagination for task lists
- Efficient MongoDB queries
- React component optimization
- Lazy loading routes
- Image optimization
- Gzip compression

## 🔄 Backup Strategy

### Automated MongoDB Backup (Daily)

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/todo-app" --out="/backups/backup_$DATE"

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### AWS Backup
- Use MongoDB Atlas automated backups
- Configure S3 versioning for frontend assets
- EC2 snapshots for server state

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in .env

**Email Not Sending:**
- Check Gmail app password
- Verify EMAIL_HOST and EMAIL_PORT
- Check firewall settings

**CORS Error:**
- Verify FRONTEND_URL in backend .env
- Check REACT_APP_API_URL in frontend .env

## 📝 Sample Test Data

```javascript
// Sample User
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Sample Task
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "priority": "High",
  "category": "Work",
  "deadline": "2024-12-31",
  "reminderTime": "2024-12-30T10:00:00"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, email support@todoapp.com or open an issue.

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Task sharing and collaboration
- [ ] Calendar integration
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Task templates
- [ ] File attachments
- [ ] Advanced analytics
- [ ] Export to PDF/CSV

---

**Built with ❤️ using MERN Stack**
