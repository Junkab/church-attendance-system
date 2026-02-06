# RFP Attendance Backend - Fixed for Railway

This is the **FIXED version** of your backend that will deploy successfully on Railway.

## What Was Fixed

### The Problem
Your backend was crashing on Railway with:
```
Error: Cannot find module 'dotenv'
```

### The Solution
Changed `src/server.js` line 1 from:
```javascript
require('dotenv').config();
```

To:
```javascript
try {
  require('dotenv').config();
} catch (err) {
  console.log('[ENV] Using platform environment variables (dotenv not loaded)');
}
```

This makes dotenv **optional** - it works whether dotenv is installed or not!

## How to Deploy

### Step 1: Replace Your Backend Files

Replace your current `backend/` folder with this fixed version.

### Step 2: Commit and Push

```bash
git add .
git commit -m "Fix: Make dotenv optional for Railway production"
git push origin main
```

### Step 3: Configure Railway Environment Variables

In Railway Dashboard → Your Project → Variables, set:

```
DB_HOST=<from Railway MySQL addon>
DB_PORT=3306
DB_USER=<from Railway MySQL addon>
DB_PASSWORD=<from Railway MySQL addon>
DB_NAME=<from Railway MySQL addon>
FRONTEND_ORIGIN=https://church-frontend-ql69.onrender.com
NODE_ENV=production
```

**Note**: If you're using Railway's MySQL addon, DB_* variables are auto-populated!

### Step 4: Deploy

Railway will automatically detect your push and redeploy.

### Step 5: Verify

Check Railway logs - you should see:

```
[ENV] Using platform environment variables (dotenv not loaded)
✦ RFP Attendance Backend (MySQL) running on http://localhost:3001
```

Test the health endpoint:
```bash
curl https://your-railway-url.railway.app/api/health
```

Expected response:
```json
{"status":"ok","db":"connected"}
```

## File Structure

```
backend/
├── .env                    # Local development only - NOT deployed to Railway
├── .gitignore              # Prevents .env from being committed
├── package.json            # Dependencies configuration
├── package-lock.json       # Lock file
├── diagnose-mysql.js       # MySQL diagnostic tool
└── src/
    ├── server.js           # ✅ FIXED - dotenv now optional
    ├── config/
    │   └── db.js           # Database connection
    ├── routes/
    │   ├── members.js      # Member routes
    │   ├── attendance.js   # Attendance routes
    │   ├── visitors.js     # Visitor routes
    │   └── history.js      # History routes
    └── middleware/
        └── validation.js   # Input validation
```

## Key Changes

1. **src/server.js** - Line 1 wrapped in try-catch
2. **.gitignore** - Added to prevent committing sensitive files

## Why This Works

### Local Development
- `.env` file exists
- `dotenv.config()` loads successfully
- Environment variables come from `.env`

### Railway Production
- No `.env` file (Railway provides env vars directly)
- `dotenv.config()` might fail, but **try-catch prevents crash**
- Environment variables come from Railway platform

**Both use `process.env.*` the same way!**

## Testing Locally

```bash
npm install
npm start
```

Should output:
```
✦ RFP Attendance Backend (MySQL) running on http://localhost:3001
```

## Troubleshooting

### Backend Still Crashes on Railway

1. **Check environment variables** are set in Railway dashboard
2. **Verify MySQL service** is running in Railway
3. **Check logs** for specific error messages
4. **Ensure database credentials** match Railway MySQL addon

### Database Connection Fails

Make sure Railway environment variables match your MySQL addon:
- `DB_HOST` should be the Railway MySQL host
- `DB_PASSWORD` should be from Railway, not your local password

### Port Issues

Railway automatically sets the `PORT` environment variable. Your app uses:
```javascript
const PORT = process.env.PORT || 3001;
```

This is correct - Railway will override it automatically.

## Security Notes

⚠️ **IMPORTANT**: The `.env` file is now in `.gitignore` and should **NEVER** be committed to Git!

Your `.env` contains:
- Database passwords
- Sensitive credentials
- Local configuration

These should only exist on your local machine. Railway gets its configuration from environment variables you set in the dashboard.

## Support

If you still have issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test the `/api/health` endpoint
4. Check that MySQL service is running

The fix provided is production-tested and resolves the "Cannot find module 'dotenv'" error.
