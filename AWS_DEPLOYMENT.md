# AWS Deployment Guide

Complete guide to deploy the To-Do List Management System on AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFront                          │
│                    (CDN + SSL/TLS)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   S3 Bucket    │      │  EC2/ECS/EB     │
│   (Frontend)   │      │   (Backend)     │
└────────────────┘      └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  MongoDB Atlas  │
                        │   (Database)    │
                        └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    AWS SES      │
                        │    (Email)      │
                        └─────────────────┘
```

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. MongoDB Atlas account
4. Domain name (optional, for custom domain)
5. GitHub account (for CI/CD)

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster
```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create a new cluster (Free tier available)
4. Choose AWS as cloud provider
5. Select region closest to your EC2 region
```

### 1.2 Configure Database Access
```bash
1. Database Access → Add New Database User
2. Username: todoapp
3. Password: Generate secure password
4. Database User Privileges: Read and write to any database
```

### 1.3 Configure Network Access
```bash
1. Network Access → Add IP Address
2. Add: 0.0.0.0/0 (Allow from anywhere)
   OR add specific EC2 IP addresses
```

### 1.4 Get Connection String
```bash
1. Clusters → Connect → Connect your application
2. Copy connection string:
   mongodb+srv://todoapp:<password>@cluster0.xxxxx.mongodb.net/todo-app
3. Replace <password> with your database password
```

## Step 2: AWS SES Configuration

### 2.1 Verify Email Address
```bash
aws ses verify-email-identity --email-address noreply@yourdomain.com --region us-east-1
```

### 2.2 Verify Domain (Optional)
```bash
1. AWS Console → SES → Verified identities
2. Create identity → Domain
3. Add DNS records to your domain provider
```

### 2.3 Request Production Access
```bash
1. SES is in sandbox mode by default
2. Request production access:
   - AWS Console → SES → Account dashboard
   - Request production access
   - Fill out the form (usually approved in 24 hours)
```

### 2.4 Create IAM User for SES
```bash
aws iam create-user --user-name ses-smtp-user

aws iam attach-user-policy \
  --user-name ses-smtp-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

aws iam create-access-key --user-name ses-smtp-user
# Save the AccessKeyId and SecretAccessKey
```

## Step 3: Backend Deployment (EC2)

### 3.1 Launch EC2 Instance
```bash
1. AWS Console → EC2 → Launch Instance
2. Name: todo-backend
3. AMI: Ubuntu Server 22.04 LTS
4. Instance type: t2.micro (free tier) or t2.small
5. Key pair: Create new or use existing
6. Security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP (5000) from anywhere
7. Storage: 8 GB (default)
8. Launch instance
```

### 3.2 Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 3.3 Install Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.4 Install PM2
```bash
sudo npm install -g pm2
```

### 3.5 Clone and Setup Application
```bash
# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/yourusername/todo-app.git
cd todo-app/backend

# Install dependencies
npm install --production
```

### 3.6 Configure Environment Variables
```bash
nano .env
```

Add the following:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://todoapp:password@cluster0.xxxxx.mongodb.net/todo-app
JWT_SECRET=your_super_secret_production_key_min_32_chars
JWT_EXPIRE=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_ses_access_key
AWS_SECRET_ACCESS_KEY=your_ses_secret_key
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3.7 Start Application with PM2
```bash
pm2 start server.js --name todo-backend
pm2 startup systemd
pm2 save
pm2 list
```

### 3.8 Setup Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/todo-backend
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/todo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.9 Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

## Step 4: Frontend Deployment (S3 + CloudFront)

### 4.1 Build Frontend
```bash
cd ../frontend

# Update API URL in .env
echo "REACT_APP_API_URL=https://api.yourdomain.com/api" > .env

# Build
npm install
npm run build
```

### 4.2 Create S3 Bucket
```bash
aws s3 mb s3://todo-app-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://todo-app-frontend \
  --index-document index.html \
  --error-document index.html
```

### 4.3 Configure Bucket Policy
```bash
aws s3api put-bucket-policy --bucket todo-app-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::todo-app-frontend/*"
    }
  ]
}'
```

### 4.4 Upload Build Files
```bash
aws s3 sync build/ s3://todo-app-frontend --delete
```

### 4.5 Create CloudFront Distribution
```bash
1. AWS Console → CloudFront → Create Distribution
2. Origin domain: todo-app-frontend.s3.amazonaws.com
3. Origin access: Public
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Allowed HTTP methods: GET, HEAD, OPTIONS
6. Cache policy: CachingOptimized
7. Alternate domain name (CNAME): yourdomain.com
8. SSL certificate: Request certificate (ACM)
9. Default root object: index.html
10. Create distribution
```

### 4.6 Configure Custom Error Pages
```bash
1. CloudFront → Your distribution → Error pages
2. Create custom error response:
   - HTTP error code: 403
   - Customize error response: Yes
   - Response page path: /index.html
   - HTTP response code: 200
3. Repeat for 404 error
```

### 4.7 Update DNS Records
```bash
# Add CNAME record in your domain provider:
Type: CNAME
Name: www (or @)
Value: d1234567890.cloudfront.net (your CloudFront domain)
```

## Step 5: Alternative - Elastic Beanstalk Deployment

### 5.1 Install EB CLI
```bash
pip install awsebcli
```

### 5.2 Initialize EB Application
```bash
cd backend
eb init

# Follow prompts:
# - Select region
# - Create new application: todo-app
# - Platform: Node.js
# - Setup SSH: Yes
```

### 5.3 Create Environment
```bash
eb create todo-production

# Configure environment variables
eb setenv \
  NODE_ENV=production \
  MONGODB_URI=your_mongodb_uri \
  JWT_SECRET=your_jwt_secret \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_key \
  AWS_SECRET_ACCESS_KEY=your_secret
```

### 5.4 Deploy
```bash
eb deploy
```

### 5.5 Open Application
```bash
eb open
```

## Step 6: Docker Deployment (ECS)

### 6.1 Create ECR Repositories
```bash
aws ecr create-repository --repository-name todo-backend
aws ecr create-repository --repository-name todo-frontend
```

### 6.2 Build and Push Docker Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t todo-backend .
docker tag todo-backend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest

# Build and push frontend
cd ../frontend
docker build -t todo-frontend .
docker tag todo-frontend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/todo-frontend:latest
```

### 6.3 Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name todo-cluster
```

### 6.4 Create Task Definitions
Create `task-definition.json`:
```json
{
  "family": "todo-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "todo-backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "MONGODB_URI", "value": "your_mongodb_uri"}
      ]
    }
  ]
}
```

Register task:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 6.5 Create ECS Service
```bash
aws ecs create-service \
  --cluster todo-cluster \
  --service-name todo-backend-service \
  --task-definition todo-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## Step 7: CI/CD with GitHub Actions

Already configured in `.github/workflows/ci-cd.yml`

### 7.1 Add GitHub Secrets
```bash
1. GitHub Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - MONGODB_URI
   - JWT_SECRET
```

### 7.2 Push to Trigger Deployment
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

## Step 8: Monitoring and Logging

### 8.1 CloudWatch Logs
```bash
# View logs
aws logs tail /aws/elasticbeanstalk/todo-production/var/log/nodejs/nodejs.log --follow
```

### 8.2 Setup Alarms
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name todo-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Cost Estimation

### Free Tier (First 12 months)
- EC2 t2.micro: 750 hours/month
- S3: 5GB storage
- CloudFront: 50GB data transfer
- MongoDB Atlas: 512MB free forever

### After Free Tier (Monthly)
- EC2 t2.small: ~$17
- S3 + CloudFront: ~$5-10
- MongoDB Atlas M10: ~$57
- SES: $0.10 per 1000 emails
- **Total: ~$80-90/month**

## Backup Strategy

### Automated MongoDB Backup
```bash
# MongoDB Atlas automatic backups (included)
# Configure in Atlas Console → Clusters → Backup
```

### S3 Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket todo-app-frontend \
  --versioning-configuration Status=Enabled
```

### EC2 Snapshots
```bash
aws ec2 create-snapshot \
  --volume-id vol-1234567890abcdef0 \
  --description "Todo app backup"
```

## Troubleshooting

### Backend not accessible
```bash
# Check PM2 status
pm2 status
pm2 logs todo-backend

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Database connection issues
```bash
# Test MongoDB connection
mongo "mongodb+srv://cluster0.xxxxx.mongodb.net/test" --username todoapp
```

### Email not sending
```bash
# Check SES sending statistics
aws ses get-send-statistics --region us-east-1
```

## Security Checklist

- [ ] Enable HTTPS/SSL certificates
- [ ] Configure security groups properly
- [ ] Use IAM roles instead of access keys when possible
- [ ] Enable CloudWatch logging
- [ ] Set up AWS WAF for DDoS protection
- [ ] Enable S3 bucket encryption
- [ ] Use secrets manager for sensitive data
- [ ] Enable MFA for AWS account
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

**Deployment Complete! 🚀**

Your application should now be live at:
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com
