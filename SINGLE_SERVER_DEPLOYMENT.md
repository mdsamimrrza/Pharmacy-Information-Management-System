# PIMS Single-Server Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Single Node.js Server              │
│  ┌─────────────────────────────────────┐   │
│  │   Backend API (/api/*)              │   │
│  │   + Express Server                  │   │
│  │   + MongoDB Client                  │   │
│  │   + Background Jobs                 │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │   Frontend SPA (/)                  │   │
│  │   + React/Vite (dist/)              │   │
│  │   + Static files serving            │   │
│  │   + SPA routing fallback            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         │
         ├─→ MongoDB Atlas (Cloud)
         ├─→ Email Outbox (File)
         └─→ Background Jobs
```

---

## How It Works

1. **Frontend Build**: React + Vite builds to `Frontend/dist/`
2. **Backend Serves Frontend**: Express serves static files from `dist/`
3. **API Routes**: All requests to `/api/*` handled by Express router
4. **SPA Fallback**: All other routes redirected to `index.html` for client-side routing
5. **Single Port**: Everything on one port (default: 5000)

---

## Local Development Setup

### 1. Build Frontend
```bash
cd Frontend
npm install
npm run build
```
This creates `Frontend/dist/` folder with all static files.

### 2. Run Backend (Serves both API + Frontend)
```bash
cd Backend
npm install
npm run dev
```

### 3. Access Application
Open browser: `http://localhost:5000`

- Frontend served from `localhost:5000/`
- API at `localhost:5000/api/`
- No CORS issues (same origin)

---

## Production Deployment (Railway/Vercel)

### Prerequisites
- MongoDB Atlas account (free tier)
- Railway account (or Render/Heroku)
- GitHub repository with code

### Step 1: Create MongoDB Database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free tier cluster
3. Create database user
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/pims`

### Step 2: Deploy to Railway

1. **Sign up**: [railway.app](https://railway.app)
2. **Create New Project** → **Deploy from GitHub**
3. **Select Repository**: Choose your PIMS repository
4. **Build Command**: Leave default (Railway auto-detects)
5. **Start Command**: `npm run start` (from Backend)
6. **Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pims
   JWT_SECRET=your_very_secret_key_here_minimum_32_chars
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-railway-app.railway.app
   ADMIN_SETUP_TOKEN=your_admin_token_here
   ENABLE_BACKGROUND_JOBS=true
   ```

7. **Deploy**: Railway will:
   - Install dependencies
   - Build frontend automatically
   - Start the server
   - Serve everything from the backend

### Step 3: Post-Deployment

1. **Test the app**: Visit `https://your-railway-app.railway.app`
2. **Check logs**: Railway dashboard shows real-time logs
3. **Seed data** (first time only):
   - Use admin setup endpoint: POST `/api/auth/setup-admin`
   - Or run seed scripts locally, upload data

---

## Key Files Modified for Single-Server Setup

### Backend (`Backend/src/app.js`)
```javascript
// Serves static files
app.use(express.static(frontendDistPath))

// SPA fallback routing
app.get('*', (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'))
})
```

### Frontend API Client (`Frontend/src/api/pimsApi.js`)
```javascript
// Uses relative URL instead of hardcoded backend URL
baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
```

### Frontend Vite Config (`Frontend/vite.config.js`)
```javascript
// Dev proxy for local development
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## Build & Deployment Script

```bash
#!/bin/bash

# 1. Build Frontend
cd Frontend
npm install
npm run build
cd ..

# 2. Install Backend Dependencies
cd Backend
npm install

# 3. Start Production Server
npm run start
```

Or in package.json (added):
```json
"scripts": {
  "build": "cd ../Frontend && npm install && npm run build"
}
```

Railway will run `npm install && npm run build` automatically.

---

## Environment Variables Checklist

| Variable | Example | Required | Where |
|----------|---------|----------|-------|
| `PORT` | `5000` | ✅ | Backend |
| `NODE_ENV` | `production` | ✅ | Backend |
| `MONGO_URI` | `mongodb+srv://...` | ✅ | Backend |
| `JWT_SECRET` | Random 32+ chars | ✅ | Backend |
| `JWT_EXPIRES_IN` | `7d` | ✅ | Backend |
| `CLIENT_URL` | App URL | ✅ | Backend (CORS) |
| `ADMIN_SETUP_TOKEN` | Random token | ✅ | Backend |
| `ENABLE_BACKGROUND_JOBS` | `true` | ❌ | Backend (default: true) |
| `VITE_API_BASE_URL` | `/api` (relative) | ❌ | Frontend |

---

## Advantages of This Approach

✅ **Single Deployment**: One server, one deployment process  
✅ **No CORS Issues**: Same origin (no cross-origin requests)  
✅ **Simpler**: No need to manage 2 separate deployments  
✅ **Better Performance**: No network latency between frontend & API  
✅ **Lower Cost**: One dyno/server instead of two  
✅ **Easier Debugging**: Single set of logs  
✅ **Monorepo Aligned**: Fits the project structure  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on refresh | Check SPA fallback in app.js |
| API calls fail | Verify BASE_URL is `/api` or relative URL |
| Blank page | Check browser console for errors, verify dist folder exists |
| Port already in use | Change PORT env var or kill process on port 5000 |
| MongoDB connection fails | Check MONGO_URI, IP whitelist in Atlas (allow 0.0.0.0/0) |

---

## Next Steps

1. ✅ Frontend built to `Frontend/dist/`
2. ✅ Backend configured to serve frontend
3. ✅ API client uses relative URLs
4. 🔜 Deploy to Railway/Render
5. 🔜 Configure MongoDB Atlas
6. 🔜 Set environment variables
7. 🔜 Test application
8. 🔜 Custom domain (optional)

---

## Quick Start Command (Local)

```bash
# Terminal 1: Build and start backend  
cd Backend
npm install
npm run build  # This builds frontend too
npm run dev    # Starts on localhost:5000

# Then just visit: http://localhost:5000
```

All done! Single server handles everything. 🚀
