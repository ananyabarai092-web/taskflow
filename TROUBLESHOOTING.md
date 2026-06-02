# Troubleshooting Guide

Common issues and their solutions for the To-Do List Management System.

## 🔴 Backend Issues

### Issue: MongoDB Connection Failed

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions:**

1. **Check if MongoDB is running:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl status mongodb
sudo systemctl start mongodb
```

2. **Verify connection string in .env:**
```env
MONGODB_URI=mongodb://localhost:27017/todo-app
```

3. **For MongoDB Atlas:**
- Check network access (whitelist IP)
- Verify username/password
- Ensure connection string format:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app
```

---

### Issue: JWT Token Invalid

**Error Message:**
```
Not authorized, token failed
```

**Solutions:**

1. **Check token in request headers:**
```javascript
Authorization: Bearer <your-token>
```

2. **Verify JWT_SECRET in .env:**
```env
JWT_SECRET=your_secret_key_min_32_characters
```

3. **Token might be expired (7 days default):**
- Login again to get new token
- Adjust JWT_EXPIRE in .env if needed

---

### Issue: Email Not Sending

**Error Message:**
```
Email could not be sent
Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**

1. **For Gmail - Enable App Password:**
```
1. Enable 2-Factor Authentication
2. Go to: https://myaccount.google.com/apppasswords
3. Generate App Password
4. Use this password in .env
```

2. **Check email configuration in .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

3. **For AWS SES:**
- Verify email/domain in SES console
- Request production access (sandbox mode limits)
- Check AWS credentials

---

### Issue: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Find and kill process (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

2. **Find and kill process (Linux/Mac):**
```bash
lsof -ti:5000 | xargs kill -9
```

3. **Change port in .env:**
```env
PORT=5001
```

---

### Issue: Dependencies Installation Failed

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
```

2. **Delete and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Use legacy peer deps:**
```bash
npm install --legacy-peer-deps
```

---

### Issue: Scheduler Not Running

**Problem:** Reminders not being sent

**Solutions:**

1. **Check if server is running:**
```bash
pm2 status
pm2 logs todo-backend
```

2. **Verify cron job is initialized:**
- Check server.js calls scheduleReminders()
- Look for "Reminder scheduler started" in logs

3. **Check task reminderTime:**
- Must be in future
- Must be within next 15 minutes for immediate trigger

---

## 🔵 Frontend Issues

### Issue: Cannot Connect to Backend

**Error Message:**
```
Network Error
ERR_CONNECTION_REFUSED
```

**Solutions:**

1. **Verify backend is running:**
```bash
curl http://localhost:5000/health
```

2. **Check REACT_APP_API_URL in .env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Check CORS configuration in backend:**
```javascript
// server.js
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

---

### Issue: White Screen / Blank Page

**Problem:** Frontend shows blank page

**Solutions:**

1. **Check browser console for errors:**
- Press F12 → Console tab
- Look for JavaScript errors

2. **Clear browser cache:**
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

3. **Rebuild application:**
```bash
rm -rf node_modules build
npm install
npm start
```

---

### Issue: Login Not Working

**Problem:** Login button does nothing or shows error

**Solutions:**

1. **Check network tab in browser:**
- F12 → Network tab
- Look for failed requests
- Check response status and message

2. **Verify credentials:**
- Email format correct
- Password minimum 6 characters
- User exists in database

3. **Check AuthContext:**
- Token being saved to localStorage
- User state being updated

---

### Issue: Tasks Not Displaying

**Problem:** Dashboard shows no tasks

**Solutions:**

1. **Check if tasks exist:**
```bash
# In MongoDB shell
use todo-app
db.tasks.find()
```

2. **Verify API call:**
- Check Network tab for /api/tasks request
- Check response data
- Verify Authorization header present

3. **Check filters:**
- Clear all filters
- Try different filter combinations

---

## 🟡 Docker Issues

### Issue: Docker Build Failed

**Error Message:**
```
ERROR [internal] load metadata for docker.io/library/node:18-alpine
```

**Solutions:**

1. **Check Docker is running:**
```bash
docker --version
docker ps
```

2. **Pull base image manually:**
```bash
docker pull node:18-alpine
```

3. **Check Dockerfile syntax:**
- Verify all paths are correct
- Check for typos

---

### Issue: Container Exits Immediately

**Problem:** Container starts then stops

**Solutions:**

1. **Check container logs:**
```bash
docker logs <container-id>
docker-compose logs backend
```

2. **Verify environment variables:**
```bash
docker-compose config
```

3. **Check if port is available:**
```bash
docker ps -a
```

---

### Issue: Cannot Connect Between Containers

**Problem:** Backend can't connect to MongoDB container

**Solutions:**

1. **Use service name as hostname:**
```env
MONGODB_URI=mongodb://mongodb:27017/todo-app
```

2. **Check network:**
```bash
docker network ls
docker network inspect <network-name>
```

3. **Verify docker-compose.yml:**
- All services in same network
- Depends_on configured correctly

---

## 🟢 Database Issues

### Issue: Duplicate Key Error

**Error Message:**
```
E11000 duplicate key error collection
```

**Solutions:**

1. **For email duplicates:**
- User already exists
- Use different email
- Or delete existing user

2. **For task duplicates:**
- Same title on same day
- Change title or date
- This is by design (duplicate prevention)

---

### Issue: Validation Error

**Error Message:**
```
ValidationError: Path `field` is required
```

**Solutions:**

1. **Check required fields:**
- User: name, email, password
- Task: title, deadline, userId

2. **Verify data types:**
- Dates in correct format
- Enums match schema values

---

### Issue: Database Connection Timeout

**Error Message:**
```
MongooseServerSelectionError: connection timed out
```

**Solutions:**

1. **For MongoDB Atlas:**
- Check network access whitelist
- Verify cluster is running
- Check connection string

2. **For local MongoDB:**
- Increase timeout in connection options
- Check firewall settings

---

## 🟣 Deployment Issues

### Issue: EC2 Connection Refused

**Problem:** Cannot SSH into EC2 instance

**Solutions:**

1. **Check security group:**
- Port 22 open for SSH
- Your IP whitelisted

2. **Verify key permissions:**
```bash
chmod 400 your-key.pem
```

3. **Use correct username:**
```bash
ssh -i key.pem ubuntu@ec2-ip  # Ubuntu
ssh -i key.pem ec2-user@ec2-ip  # Amazon Linux
```

---

### Issue: PM2 Process Crashes

**Problem:** Application keeps restarting

**Solutions:**

1. **Check logs:**
```bash
pm2 logs todo-backend --lines 100
```

2. **Check memory usage:**
```bash
pm2 monit
```

3. **Increase memory limit:**
```bash
pm2 start server.js --name todo-backend --max-memory-restart 500M
```

---

### Issue: Nginx 502 Bad Gateway

**Problem:** Nginx can't connect to backend

**Solutions:**

1. **Check backend is running:**
```bash
pm2 status
curl http://localhost:5000/health
```

2. **Verify Nginx configuration:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

3. **Check proxy_pass URL:**
```nginx
proxy_pass http://localhost:5000;
```

---

### Issue: SSL Certificate Error

**Problem:** HTTPS not working

**Solutions:**

1. **Renew certificate:**
```bash
sudo certbot renew
```

2. **Check certificate status:**
```bash
sudo certbot certificates
```

3. **Reinstall certificate:**
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Performance Issues

### Issue: Slow API Response

**Problem:** Requests taking too long

**Solutions:**

1. **Add database indexes:**
```javascript
// Already implemented in models
taskSchema.index({ userId: 1, status: 1 });
```

2. **Enable pagination:**
```javascript
// Use limit and skip in queries
?page=1&limit=10
```

3. **Check database query performance:**
```javascript
// In MongoDB shell
db.tasks.find().explain("executionStats")
```

---

### Issue: High Memory Usage

**Problem:** Server running out of memory

**Solutions:**

1. **Check for memory leaks:**
```bash
pm2 monit
```

2. **Restart application:**
```bash
pm2 restart todo-backend
```

3. **Increase server resources:**
- Upgrade EC2 instance type
- Add swap space

---

## 📱 Common User Errors

### Issue: "Invalid credentials"

**Solutions:**
- Check email spelling
- Verify password (case-sensitive)
- Ensure account is active
- Try password reset

---

### Issue: "Task with same title already exists"

**Solutions:**
- This is duplicate prevention feature
- Change task title slightly
- Or schedule for different day

---

### Issue: "Not authorized"

**Solutions:**
- Login again (token expired)
- Check if account is active
- Verify admin access for admin routes

---

## 🆘 Emergency Recovery

### Complete System Reset

```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx
sudo systemctl stop mongodb

# Backup data
mongodump --uri="mongodb://localhost:27017/todo-app" --out=./emergency-backup

# Clear and restart
pm2 delete all
pm2 flush

# Restart services
sudo systemctl start mongodb
cd /path/to/backend
pm2 start server.js --name todo-backend
sudo systemctl start nginx
```

---

## 📞 Getting Help

If issues persist:

1. **Check logs:**
```bash
# Backend
pm2 logs todo-backend
tail -f /var/log/nginx/error.log

# Frontend
Browser Console (F12)
```

2. **Enable debug mode:**
```env
NODE_ENV=development
DEBUG=*
```

3. **Test API directly:**
```bash
curl -v http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

4. **Check system resources:**
```bash
top
df -h
free -m
```

---

## 📝 Reporting Issues

When reporting issues, include:

1. Error message (full stack trace)
2. Steps to reproduce
3. Environment (OS, Node version, etc.)
4. Relevant logs
5. What you've already tried

---

**Remember:** Most issues are configuration-related. Double-check your .env files!
