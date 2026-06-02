# Quick Reference Commands

## 🚀 Getting Started (5 Minutes)

```bash
# 1. Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
node seed.js
npm run dev

# 2. Frontend Setup (new terminal)
cd frontend
npm install
npm start

# 3. Access Application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Login: admin@todoapp.com / Admin@123
```

## 📦 Installation Commands

### Backend
```bash
cd backend
npm install                    # Install dependencies
npm install --production       # Production only
npm audit fix                  # Fix vulnerabilities
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm install --production       # Production only
npm audit fix                  # Fix vulnerabilities
```

## 🏃 Running Commands

### Development
```bash
# Backend
npm run dev                    # Start with nodemon (auto-reload)
npm start                      # Start production mode

# Frontend
npm start                      # Start development server
PORT=3001 npm start           # Start on different port
```

### Production
```bash
# Backend
NODE_ENV=production npm start
pm2 start server.js --name todo-backend
pm2 restart todo-backend
pm2 stop todo-backend
pm2 logs todo-backend

# Frontend
npm run build                  # Build for production
serve -s build                 # Serve build locally
```

## 🗄️ Database Commands

### MongoDB Local
```bash
# Start MongoDB
mongod                         # Start server
mongo                          # Connect to shell

# Windows
net start MongoDB              # Start service
net stop MongoDB               # Stop service

# Linux/Mac
sudo systemctl start mongodb
sudo systemctl stop mongodb
sudo systemctl status mongodb
```

### Database Operations
```bash
# Seed database
node seed.js

# Backup database
mongodump --uri="mongodb://localhost:27017/todo-app" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/todo-app" ./backup/todo-app

# Drop database
mongo todo-app --eval "db.dropDatabase()"
```

## 🐳 Docker Commands

### Build and Run
```bash
# Build images
docker-compose build

# Start all services
docker-compose up
docker-compose up -d           # Detached mode

# Stop all services
docker-compose down
docker-compose down -v         # Remove volumes

# View logs
docker-compose logs
docker-compose logs -f backend # Follow backend logs
```

### Individual Services
```bash
# Backend only
docker build -t todo-backend ./backend
docker run -p 5000:5000 --env-file ./backend/.env todo-backend

# Frontend only
docker build -t todo-frontend ./frontend
docker run -p 80:80 todo-frontend
```

## 🧪 Testing Commands

```bash
# Backend tests
cd backend
npm test
npm test -- --coverage        # With coverage

# Frontend tests
cd frontend
npm test
npm test -- --coverage        # With coverage
npm test -- --watchAll=false  # Run once
```

## 🔍 Debugging Commands

### Check Ports
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000
```

### Kill Process
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
lsof -ti:5000 | xargs kill -9
```

### View Logs
```bash
# PM2 logs
pm2 logs
pm2 logs todo-backend
pm2 logs --lines 100

# Docker logs
docker logs <container-id>
docker logs -f <container-id>  # Follow
```

## 🌐 Git Commands

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <url>
git push -u origin main

# Daily workflow
git status
git add .
git commit -m "Your message"
git push

# Branching
git checkout -b feature/new-feature
git checkout main
git merge feature/new-feature
git branch -d feature/new-feature
```

## ☁️ AWS Deployment Commands

### EC2 Deployment
```bash
# Connect to EC2
ssh -i "key.pem" ubuntu@ec2-ip

# Deploy backend
cd /var/www/todo-app/backend
git pull origin main
npm install --production
pm2 restart todo-backend

# Deploy frontend to S3
cd frontend
npm run build
aws s3 sync build/ s3://bucket-name --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Elastic Beanstalk
```bash
# Initialize
eb init

# Create environment
eb create todo-production

# Deploy
eb deploy

# View logs
eb logs

# SSH into instance
eb ssh

# Terminate environment
eb terminate todo-production
```

### Docker on AWS
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t todo-backend ./backend
docker tag todo-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
```

## 🔐 Security Commands

### Generate JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Renew certificate
sudo certbot renew
sudo certbot renew --dry-run  # Test renewal
```

## 📊 Monitoring Commands

### System Resources
```bash
# CPU and Memory
top
htop

# Disk usage
df -h
du -sh *

# Network
netstat -tuln
ss -tuln
```

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit
pm2 status
pm2 info todo-backend

# Docker stats
docker stats
docker stats <container-id>
```

## 🛠️ Maintenance Commands

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update <package-name>

# Update to latest (breaking changes)
npm install <package-name>@latest
```

### Clean Up
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Docker
docker system prune -a
docker volume prune
```

## 📧 Email Testing

### Test Email Configuration
```bash
# Using Node.js
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'your-email', pass: 'your-password' }
});
transporter.sendMail({
  from: 'your-email',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test email'
}).then(() => console.log('Sent')).catch(console.error);
"
```

## 🔄 Backup Commands

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/todo-app" --out="/backups/backup_$DATE"
find /backups -type d -mtime +30 -exec rm -rf {} +
```

### Run Backup
```bash
chmod +x backup.sh
./backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 🚨 Emergency Commands

### Service Down
```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mongodb

# Check status
pm2 status
sudo systemctl status nginx
sudo systemctl status mongodb
```

### High CPU/Memory
```bash
# Find process
top
ps aux | grep node

# Kill process
pm2 delete todo-backend
pm2 start server.js --name todo-backend
```

### Database Issues
```bash
# Repair database
mongod --repair

# Check connections
mongo --eval "db.serverStatus().connections"

# Kill long-running queries
mongo todo-app --eval "db.currentOp()"
```

## 📱 Quick API Tests

### Using curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get tasks (replace TOKEN)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"High","deadline":"2024-12-31"}'
```

## 💡 Useful Aliases

Add to ~/.bashrc or ~/.zshrc:
```bash
alias todo-backend="cd ~/todo-app/backend && npm run dev"
alias todo-frontend="cd ~/todo-app/frontend && npm start"
alias todo-logs="pm2 logs todo-backend"
alias todo-restart="pm2 restart todo-backend"
alias todo-backup="mongodump --uri='mongodb://localhost:27017/todo-app' --out=./backup"
```

---

**Pro Tip:** Bookmark this file for quick access to common commands!
