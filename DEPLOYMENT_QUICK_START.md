# PIMS Project - Quick Deployment Checklist

## 📋 Before You Start
- [ ] Project is pushed to GitHub
- [ ] You have Vercel, Railway/Render, and MongoDB Atlas accounts (free)

## 🚀 Quick Steps

### 1️⃣ **MongoDB Setup (5 min)**
- Go to https://mongodb.com/cloud/atlas
- Create free cluster
- Create database user
- Copy connection string → Save it

### 2️⃣ **Deploy Backend to Railway (2 min)**
```
1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select PIMS repo → Choose "Backend" folder
4. Add Environment Variables:
   - MONGO_URI: (from MongoDB Atlas)
   - JWT_SECRET: (generate a random string)
   - JWT_EXPIRES_IN: 7d
   - CLIENT_URL: (your Vercel frontend URL)
   - ADMIN_SETUP_TOKEN: (any random string)
   - NODE_ENV: production
   - PORT: 5000
5. Deploy → Copy the Railway domain
```

### 3️⃣ **Deploy Frontend to Vercel (2 min)**
```
1. Go to vercel.com
2. Click "Add New..." → "Project"
3. Select PIMS repository
4. Vercel auto-detects monorepo ✓
5. Add Environment Variables:
   - VITE_API_BASE_URL: https://your-railway-domain.railway.app/api
6. Deploy ✓
```

### 4️⃣ **Test Everything**
- Open your Vercel frontend URL
- Try login
- Check browser console for errors
- Check Vercel/Railway logs if issues

## 📁 Files Created
- `vercel.json` - Vercel build configuration
- `.vercelignore` - Files to exclude from Vercel
- `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed guide

## 🔗 Important Domains (Save These!)
```
Backend API: https://your-railway-app.railway.app
Frontend: https://your-app.vercel.app
MongoDB: (from Atlas)
```

## ⚡ Commands
```
# Test backend locally
cd Backend && npm install && npm run dev

# Test frontend locally
cd Frontend && npm install && npm run dev

# Build for production
cd Frontend && npm run build
```

## 🆘 Troubleshooting
| Issue | Solution |
|-------|----------|
| Frontend can't reach backend | Check VITE_API_BASE_URL in Vercel env vars |
| MongoDB connection fails | Check MONGO_URI, allow 0.0.0.0/0 in Atlas whitelist |
| Build fails on Vercel | Check build command in vercel.json |
| CORS errors | Check backend CORS settings |

## 📞 Support Resources
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com

Good luck! 🎉
