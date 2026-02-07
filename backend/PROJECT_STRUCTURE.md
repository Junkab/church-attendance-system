# 📂 Project Structure Documentation
## Church Attendance System - Backend

---

## 🏗️ Complete Directory Structure

```
backend/
│
├── 📄 .env                          # Environment variables (Railway MySQL config)
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules (.env protected)
├── 📄 package.json                  # Dependencies & npm scripts
├── 📄 README.md                     # Complete documentation
│
└── 📁 src/
    │
    ├── 📄 server.js                 # Express application entry point
    ├── 📄 diagnose.js               # MySQL diagnostic tool
    │
    ├── 📁 config/
    │   └── 📄 db.js                 # MySQL connection pool (Railway SSL)
    │
    ├── 📁 middleware/
    │   └── 📄 validation.js         # Input validation middleware
    │
    └── 📁 routes/
        ├── 📄 members.js            # Member management API
        ├── 📄 attendance.js         # Attendance tracking API
        ├── 📄 visitors.js           # Visitor registration API
        └── 📄 history.js            # Historical data API
```

---

## 📝 File Descriptions

### Root Level Files

| File | Purpose | Critical |
|------|---------|----------|
| `.env` | Environment variables (DB credentials, frontend URL) | ✅ Yes |
| `.env.example` | Template for environment setup | ✅ Yes |
| `.gitignore` | Prevents committing sensitive files (.env) | ✅ Yes |
| `package.json` | NPM configuration, dependencies, scripts | ✅ Yes |
| `README.md` | Complete documentation and setup guide | ✅ Yes |

### src/ Directory

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `server.js` | Express app entry point | ~150 | CORS, routes, error handling |
| `diagnose.js` | Connection diagnostic tool | ~300 | Tests DB, SSL, pool |

### src/config/

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `db.js` | MySQL connection pool | ~300 | Railway SSL, retry logic, validation |

### src/middleware/

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `validation.js` | Input validation | ~100 | Request sanitization |

### src/routes/

| File | Purpose | Endpoints | Description |
|------|---------|-----------|-------------|
| `members.js` | Member management | 5 | CRUD operations for church members |
| `attendance.js` | Attendance tracking | 4 | Mark and view attendance records |
| `visitors.js` | Visitor registration | 4 | Register and manage visitors |
| `history.js` | Historical data | 1 | Attendance history and reports |

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                       │
│              https://church-frontend.onrender.com           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  BACKEND (Railway)                          │
│           https://backend.railway.app                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.js (Express App)                             │  │
│  │  • CORS Check (validates frontend origin)            │  │
│  │  • Route Handler                                     │  │
│  └─────────────────┬────────────────────────────────────┘  │
│                    │                                        │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  Routes (members | attendance | visitors | history)  │  │
│  │  • Input Validation                                  │  │
│  │  • Business Logic                                    │  │
│  └─────────────────┬────────────────────────────────────┘  │
│                    │                                        │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  config/db.js (Connection Pool)                      │  │
│  │  • 10 connections ready                              │  │
│  │  • SSL/TLS enabled                                   │  │
│  │  • Auto-reconnect                                    │  │
│  └─────────────────┬────────────────────────────────────┘  │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ SSL/TLS Encrypted
                     │
┌────────────────────▼────────────────────────────────────────┐
│              RAILWAY MySQL DATABASE                         │
│           mysql.railway.internal:3306                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                             │  │
│  │  • members (church members)                          │  │
│  │  • attendance (attendance records)                   │  │
│  │  • visitors (guest visitors)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Execution Flow

### 1. Application Startup

```
npm start
    │
    ├─→ Load .env (dotenv.config())
    │
    ├─→ Initialize src/config/db.js
    │   ├─ Validate environment variables
    │   ├─ Create connection pool (10 connections)
    │   ├─ Enable SSL for Railway
    │   └─ Test connection
    │
    ├─→ Initialize src/server.js
    │   ├─ Configure CORS
    │   ├─ Load routes
    │   └─ Start Express server
    │
    └─→ Listen on PORT
        └─ Ready to accept requests
```

### 2. Request Handling

```
HTTP Request → server.js
    │
    ├─→ CORS Check
    │   └─ Validate origin = FRONTEND_ORIGIN
    │
    ├─→ Route Matching
    │   └─ /api/members → routes/members.js
    │   └─ /api/attendance → routes/attendance.js
    │   └─ /api/visitors → routes/visitors.js
    │   └─ /api/history → routes/history.js
    │
    ├─→ Middleware
    │   └─ validation.js (input sanitization)
    │
    ├─→ Database Query
    │   └─ config/db.js (pool.query)
    │       └─ MySQL (Railway)
    │
    └─→ Response
        └─ JSON data back to client
```

---

## 🔧 Configuration Files

### package.json Scripts

```json
{
  "start": "node src/server.js",      // Production
  "dev": "nodemon src/server.js",     // Development (auto-restart)
  "diagnose": "node src/diagnose.js"  // Troubleshooting
}
```

### Environment Variables (.env)

```env
DB_HOST=mysql.railway.internal        # Railway MySQL hostname
DB_PORT=3306                          # MySQL port
DB_USER=root                          # Database user
DB_PASSWORD=***                       # Railway MySQL password
DB_NAME=railway                       # Database name
PORT=3001                             # Server port
FRONTEND_ORIGIN=https://frontend.com  # CORS whitelist
NODE_ENV=production                   # Environment type
```

---

## 🔒 Security Layers

### Layer 1: Environment Protection
- `.env` in `.gitignore` (never committed)
- Railway Variables (production secrets)

### Layer 2: Network Security
- SSL/TLS for database connection
- CORS whitelist (only Render frontend)

### Layer 3: Application Security
- Input validation middleware
- Parameterized SQL queries
- Error handling (no stack traces to client)

### Layer 4: Database Security
- Connection pooling (prevents exhaustion)
- Graceful shutdown (no connection leaks)

---

## 📊 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Files | 13 | Excluding node_modules |
| Total Lines | ~1,200 | Well-documented code |
| Connection Pool | 10 | Concurrent connections |
| Request Timeout | 10s | Connect timeout |
| Query Timeout | 60s | Max query time |
| SSL/TLS | Enabled | Railway MySQL |

---

## 🎯 Best Practices Implemented

✅ **Separation of Concerns**
- Configuration (`config/`)
- Business Logic (`routes/`)
- Middleware (`middleware/`)

✅ **Environment-based Config**
- No hardcoded credentials
- Development vs Production

✅ **Error Handling**
- Try-catch blocks
- Specific error messages
- Graceful degradation

✅ **Database Best Practices**
- Connection pooling
- Parameterized queries
- SSL/TLS encryption

✅ **Code Organization**
- Modular structure
- Clear naming conventions
- Comprehensive comments

✅ **Documentation**
- Inline code comments
- README.md
- API documentation

---

## 🚦 Deployment Checklist

### Pre-Deployment

- [x] All environment variables documented
- [x] `.gitignore` includes `.env`
- [x] Code reviewed and tested
- [x] Dependencies up to date
- [x] README.md complete

### Railway Setup

- [ ] Repository connected
- [ ] MySQL addon linked
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passes

### Post-Deployment

- [ ] `/api/health` returns 200 OK
- [ ] Database connection successful
- [ ] CORS working with frontend
- [ ] All endpoints functional
- [ ] Error handling working

---

## 📚 Related Documentation

- [README.md](./README.md) - Complete setup guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick commands

---

**Version:** 2.0.0  
**Structure:** Production-Ready  
**Last Updated:** February 2026
