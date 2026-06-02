# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": true,
    "isActive": true
  }
}
```

---

## Task Endpoints

### Get All Tasks
**GET** `/tasks`

**Headers:** Authorization required

**Query Parameters:**
- `status` (optional): pending | completed
- `priority` (optional): High | Medium | Low
- `category` (optional): string
- `sortBy` (optional): createdAt | deadline | priority
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Example:**
```
GET /tasks?status=pending&priority=High&sortBy=deadline&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 3,
  "tasks": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "userId": "64f5a1b2c3d4e5f6g7h8i9j1",
      "title": "Complete project",
      "description": "Finish the todo app",
      "priority": "High",
      "category": "Work",
      "deadline": "2024-12-31T00:00:00.000Z",
      "status": "pending",
      "reminderTime": "2024-12-30T10:00:00.000Z",
      "isRecurring": false,
      "recurringType": "none",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Task
**POST** `/tasks`

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the todo app",
  "priority": "High",
  "category": "Work",
  "deadline": "2024-12-31",
  "reminderTime": "2024-12-30T10:00:00",
  "isRecurring": false,
  "recurringType": "none"
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "userId": "64f5a1b2c3d4e5f6g7h8i9j1",
    "title": "Complete project",
    "description": "Finish the todo app",
    "priority": "High",
    "category": "Work",
    "deadline": "2024-12-31T00:00:00.000Z",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Single Task
**GET** `/tasks/:id`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "title": "Complete project",
    "description": "Finish the todo app",
    "priority": "High",
    "status": "pending"
  }
}
```

### Update Task
**PUT** `/tasks/:id`

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "completed",
  "priority": "Medium"
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "title": "Updated title",
    "status": "completed",
    "priority": "Medium"
  }
}
```

### Delete Task
**DELETE** `/tasks/:id`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

### Get Task Statistics
**GET** `/tasks/stats/overview`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 50,
    "completed": 30,
    "pending": 15,
    "overdue": 5
  }
}
```

---

## Admin Endpoints

### Get All Users
**GET** `/admin/users`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "users": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Deactivate User
**PUT** `/admin/users/:id/deactivate`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "User deactivated",
  "user": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "isActive": false
  }
}
```

### Activate User
**PUT** `/admin/users/:id/activate`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "User activated",
  "user": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "isActive": true
  }
}
```

### Delete User
**DELETE** `/admin/users/:id`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "User and associated tasks deleted"
}
```

### Get All Tasks (Admin)
**GET** `/admin/tasks`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "count": 100,
  "tasks": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "userId": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "title": "Complete project",
      "priority": "High",
      "status": "pending"
    }
  ]
}
```

### Get Analytics
**GET** `/admin/analytics`

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "users": {
      "total": 100,
      "active": 85
    },
    "tasks": {
      "total": 500,
      "completed": 300,
      "pending": 150,
      "overdue": 50
    },
    "priority": {
      "high": 100,
      "medium": 250,
      "low": 150
    }
  }
}
```

### Generate Reports
**GET** `/admin/reports?type=completed`

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `type` (required): completed | pending | overdue

**Response:**
```json
{
  "success": true,
  "type": "completed",
  "count": 300,
  "report": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "title": "Complete project",
      "priority": "High",
      "deadline": "2024-12-31T00:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Rate Limiting

- 100 requests per 10 minutes per IP
- Applies to all `/api/*` routes

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Notes

1. All timestamps are in ISO 8601 format
2. All dates should be sent in YYYY-MM-DD format
3. JWT tokens expire after 7 days (configurable)
4. Passwords must be at least 6 characters
5. Email must be unique
6. Task titles cannot be duplicated on the same day
