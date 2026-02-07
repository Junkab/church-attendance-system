# Church Attendance System - Backend API

**Production-ready Node.js + Express + MySQL backend deployed on Railway**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Backend API for the Church Attendance System. Manages members, attendance tracking, visitor registration, and historical data with MySQL database on Railway.

**Tech Stack:**
- Node.js 16+
- Express.js 4.x
- MySQL 8.0 (via Railway addon)
- mysql2 (connection pooling)
- CORS enabled for Render frontend

---

## ✨ Features

- ✅ **Professional MySQL Connection Pool** - 10 concurrent connections with auto-retry
- ✅ **Railway MySQL Integration** - SSL/TLS enabled, mysql.railway.internal
- ✅ **Environment Validation** - Fails fast if configuration missing
- ✅ **Comprehensive Error Handling** - Specific solutions for each error type
- ✅ **CORS Configured** - Works with Render frontend
- ✅ **Health Monitoring** - `/api/health` endpoint
- ✅ **Graceful Shutdown** - Proper connection cleanup
- ✅ **Diagnostic Tool** - `npm run diagnose` for troubleshooting

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MySQL connection pool (Railway SSL enabled)
│   ├── middleware/
│   │   └── validation.js      # Input validation middleware
│   ├── routes/
│   │   ├── members.js         # Member management endpoints
│   │   ├── attendance.js      # Attendance tracking endpoints
│   │   ├── visitors.js        # Visitor registration endpoints
│   │   └── history.js         # Historical data endpoints
│   ├── diagnose.js            # MySQL diagnostic tool
│   └── server.js              # Express application entry point
├── .env                       # Environment variables (not in Git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 🔧 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **MySQL** 8.0+ (Railway provides this)
- **Git** for version control

---

## 📥 Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/church-attendance-backend.git
cd church-attendance-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in root directory:

```env
# Database (Railway MySQL)
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_railway_mysql_password
DB_NAME=railway

# Server
PORT=3001
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com

# Environment
NODE_ENV=production
```

### Railway Configuration

For production on Railway, set variables in **Railway Dashboard → Variables**:

```env
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com
NODE_ENV=production
```

---

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

Starts server with nodemon (auto-restart on file changes).

### Production Mode

```bash
npm start
```

Starts server with Node.js (used by Railway).

### Run Diagnostics

```bash
npm run diagnose
```

Tests MySQL connection and configuration.

### Expected Output

```
╔══════════════════════════════════════════════════════════╗
║  🗄️  MySQL Connection Pool Initialization               ║
╚══════════════════════════════════════════════════════════╝

📍 Environment:  PRODUCTION
🔐 SSL Required: YES (Railway MySQL)
🌐 Host:         mysql.railway.internal
🔢 Port:         3306
💾 Database:     railway

✅ Database connected successfully
```

---

## 🛣️ API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2026-02-07T08:30:00.000Z"
}
```

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | List all members |
| POST | `/api/members` | Create new member |
| GET | `/api/members/:id` | Get member by ID |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/:id` | Get attendance by ID |
| DELETE | `/api/attendance/:id` | Delete attendance record |

### Visitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitors` | List all visitors |
| POST | `/api/visitors` | Register new visitor |
| GET | `/api/visitors/:id` | Get visitor by ID |
| DELETE | `/api/visitors/:id` | Delete visitor |

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get attendance history |

---

## 🚢 Deployment

### Deploy to Railway

1. **Push to Git**

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

2. **Configure Railway Variables**

Railway Dashboard → Your Project → Variables:

```env
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com
NODE_ENV=production
```

3. **Deploy**

Railway auto-deploys on Git push.

4. **Verify**

```bash
curl https://your-backend.railway.app/api/health
```

### Update Frontend

Update frontend to use Railway backend URL:

```javascript
const API_URL = 'https://your-backend.railway.app';
```

---

## 🐛 Troubleshooting

### Issue: `ECONNREFUSED 127.0.0.1:3306`

**Cause:** Environment variables not set

**Solution:**
1. Check Railway Variables are configured
2. Verify `DB_HOST=mysql.railway.internal`
3. Redeploy

### Issue: `ER_ACCESS_DENIED_ERROR`

**Cause:** Wrong password

**Solution:**
1. Railway Dashboard → MySQL → Connect
2. Copy password exactly
3. Update `DB_PASSWORD`

### Issue: CORS errors

**Cause:** Wrong frontend URL

**Solution:**
1. Verify `FRONTEND_ORIGIN` matches Render URL exactly
2. Include `https://`, no trailing slash
3. Redeploy backend

### Run Diagnostics

```bash
npm run diagnose
```

This will test:
- Environment variables
- MySQL connection
- SSL configuration
- Connection pooling

---

## 📊 Database Schema

### Members Table

```sql
CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  gender ENUM('Male', 'Female'),
  member_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT,
  service_date DATE NOT NULL,
  service_type VARCHAR(50),
  present BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

### Visitors Table

```sql
CREATE TABLE visitors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  visit_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Security

- ✅ Environment variables (no hardcoded credentials)
- ✅ SSL/TLS encryption for database
- ✅ CORS protection (whitelist frontend)
- ✅ Input validation middleware
- ✅ Parameterized SQL queries (prevent injection)
- ✅ `.env` in `.gitignore`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

---

## 📝 License

ISC License

---

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Run `npm run diagnose`
3. Check Railway logs
4. Review `.env` configuration

---

## 🎉 Acknowledgments

- Built for Church Attendance Management
- Deployed on Railway (backend) + Render (frontend)
- MySQL database with connection pooling
- Production-ready error handling

---

**Version:** 2.0.0  
**Last Updated:** February 2026  
**Status:** Production Ready ✅
