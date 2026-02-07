# ⚡ Quick Reference - Railway Deployment
## Church Attendance System

---

## 🎯 What Was Fixed

### ❌ Before (Issues)

```javascript
// Hardcoded localhost defaults
host: process.env.DB_HOST || 'localhost'
port: process.env.DB_PORT || 3306

// Wrong frontend URL
FRONTEND_ORIGIN=http://localhost:3000

// No SSL configuration
// No environment validation
// No connection testing
```

**Result:** `ECONNREFUSED 127.0.0.1:3306` ❌

### ✅ After (Fixed)

```javascript
// Only environment variables (no defaults)
host: process.env.DB_HOST
port: parseInt(process.env.DB_PORT, 10)

// Correct frontend URL
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com

// SSL for Railway
ssl: { rejectUnauthorized: false }

// Environment validation on startup
// Connection testing with detailed logging
```

**Result:** Successful Railway deployment ✅

---

## 📋 Railway Environment Variables

Set these in **Railway Dashboard → Variables**:

```env
# Database (Reference MySQL addon)
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}

# Application
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com
NODE_ENV=production
```

---

## 🚀 Deployment Steps (Quick)

### 1. Commit Changes

```bash
git add src/config/db.js .gitignore .env.example
git commit -m "fix: Update MySQL connection for Railway"
git push origin main
```

### 2. Configure Railway

Railway Dashboard → Variables → Add all variables above

### 3. Deploy

Railway auto-deploys on push

### 4. Verify

```bash
curl https://your-backend.railway.app/api/health
# Expected: {"status":"ok","db":"connected"}
```

### 5. Update Frontend

Update API URL to Railway backend, then redeploy on Render

---

## ✅ Success Indicators

### Railway Logs Should Show:

```
✅ Database connected successfully
Host: mysql.railway.internal
SSL/TLS: Enabled
Status: Connected & Ready
```

### Health Check Should Return:

```json
{"status":"ok","db":"connected"}
```

### No These Errors:

```
❌ ECONNREFUSED 127.0.0.1:3306
❌ ER_ACCESS_DENIED_ERROR
❌ Missing environment variables
```

---

## 🔧 Files Changed

1. **src/config/db.js** - Professional connection pool
2. **.env** - Railway MySQL credentials (local reference only)
3. **.env.example** - Template for others
4. **.gitignore** - Protects .env file

---

## 📞 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| `ECONNREFUSED 127.0.0.1` | Check Railway Variables are set |
| `ER_ACCESS_DENIED` | Verify DB_PASSWORD is correct |
| `CORS error` | Check FRONTEND_ORIGIN matches exactly |
| `ETIMEDOUT` | Verify MySQL service is running |

---

## 🎯 Critical Reminders

⚠️ **Never commit `.env` to Git** - It's in `.gitignore`

⚠️ **Use Railway Variables** - Not .env file in production

⚠️ **Match FRONTEND_ORIGIN exactly** - Include https://, no trailing slash

⚠️ **Use mysql.railway.internal** - Not public MySQL host

---

## 📚 Full Documentation

- `DEPLOYMENT_CHECKLIST.md` - Complete step-by-step guide
- `src/config/db.js` - Full code with comments
- `.env.example` - Environment template

---

**Ready to deploy!** 🚀
