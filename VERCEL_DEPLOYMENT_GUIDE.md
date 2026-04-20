# PIMS Project Deployment Guide

## Overview
This project has a monorepo structure:
- **Frontend**: React + Vite (Deploy to Vercel)
- **Backend**: Express.js API (Deploy to Railway or Render)

---

## Part 1: Frontend Deployment on Vercel

### Step 1: Prepare Repository
1. Ensure your code is pushed to GitHub
2. The `vercel.json` file is already configured

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Vercel will auto-detect the monorepo structure

### Step 3: Configure Build Settings
- **Root Directory**: Leave empty (Vercel will detect it)
- **Framework**: Vite
- **Build Command**: `cd Frontend && npm install && npm run build`
- **Output Directory**: `Frontend/dist`

### Step 4: Environment Variables (Frontend)
Add these in Vercel project settings under "Environment Variables":

```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Step 5: Deploy
Click "Deploy" and wait for the build to complete.

---

## Part 2: Backend Deployment (Choose One)

### Option A: Deploy to Railway (Recommended)

1. **Sign Up**: Go to [railway.app](https://railway.app)
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**:
   - Connect your GitHub account
   - Select the PIMS repository
   - Choose "Backend" as the root directory
4. **Set Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pims
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-vercel-domain.com
   ADMIN_SETUP_TOKEN=your_admin_token_here
   ```
5. **Deploy**: Railway will auto-deploy on push to main branch

### Option B: Deploy to Render

1. **Sign Up**: Go to [render.com](https://render.com)
2. **Create New Web Service**:
   - Connect your GitHub repo
   - Set root directory to `Backend`
3. **Configure**:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (same as above)
5. **Deploy**

### Option C: Deploy to Heroku (Free tier discontinued, paid only)

---

## Step 3: Update Frontend API Configuration

After deploying the backend, update the API base URL in your frontend:

1. **In Vercel Settings**, update the environment variable:
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   ```
   (or whatever domain your backend is deployed to)

2. **Redeploy frontend** to use the new API URL

---

## MongoDB Setup (Required)

You need a MongoDB database:

1. **Go to**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Free Cluster**:
   - Sign up for MongoDB Atlas
   - Create a free tier cluster
   - Create a database user
   - Get your connection string
3. **Use the connection string** as `MONGO_URI` in your backend environment variables

---

## Environment Variables Summary

### Backend (.env or Vercel/Railway/Render settings):
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/pims
JWT_SECRET=your_super_secret_key_1234567890
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
ADMIN_SETUP_TOKEN=admin_token_12345
```

### Frontend (Vercel Environment Variables):
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in both services
- [ ] Frontend can reach backend API
- [ ] Test login functionality
- [ ] Test API endpoints (use browser DevTools Network tab)
- [ ] Check logs for any errors

---

## Troubleshooting

### Frontend → Backend Connection Issues
- Check `VITE_API_BASE_URL` is correct
- Verify CORS is enabled in backend
- Check browser console for errors
- Use browser DevTools Network tab to inspect API calls

### Backend Can't Connect to MongoDB
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (allow all IPs for testing: `0.0.0.0/0`)
- Verify database user credentials

### Deployment Build Failures
- Check build logs in Vercel/Railway dashboard
- Ensure `package.json` has all dependencies
- Verify Node version compatibility

---

## Monitoring and Logs

- **Vercel**: Check logs in project dashboard
- **Railway**: Real-time logs in the deployment view
- **MongoDB Atlas**: Monitor in the Atlas dashboard

---

## Next Steps (Optional)

- Set up custom domain
- Configure CI/CD for automatic deploys
- Set up monitoring and alerts
- Configure backup strategies for MongoDB
