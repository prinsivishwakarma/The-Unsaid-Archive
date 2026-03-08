# 🚀 GitHub Deployment Guide - The Unsaid Archive

## 📋 Overview

This guide helps you deploy The Unsaid Archive using GitHub Actions with automatic CI/CD pipeline.

---

## 🔧 Prerequisites

### **Required Accounts**
- **GitHub**: Repository with your code
- **MongoDB Atlas**: Cloud database (see MONGODB_GITHUB_SETUP.md)
- **Vercel/Railway**: Deployment platform (choose one)

### **Repository Structure**
```
The Unsaid Archive/
├── .github/workflows/deploy.yml
├── backend/
├── frontend/
├── test-mongo-atlas.js
└── MONGODB_GITHUB_SETUP.md
```

---

## 🔐 Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

### **Required Secrets:**

#### **1. MONGODB_URI**
```
mongodb+srv://username:password@cluster.mongodb.net/unsaid-archive?retryWrites=true&w=majority
```

#### **2. ALLOWED_ORIGINS**
```
https://your-domain.vercel.app
```

#### **3. SESSION_SECRET**
```
your-super-secret-session-key-here
```

#### **4. Deployment Platform Secrets**

**For Vercel:**
- `VERCEL_TOKEN`: Get from Vercel → Account Settings → Tokens

**For Railway:**
- `RAILWAY_TOKEN`: Get from Railway → Account Settings → API Tokens

---

## 🚀 Step 2: Test MongoDB Connection

### **Option 1: Test Locally**
```bash
# Set your Atlas connection string
export MONGODB_URI="mongodb+srv://..."

# Test connection
node test-mongo-atlas.js
```

### **Option 2: Test via GitHub Actions**
1. Push your code to GitHub
2. Go to **Actions** tab
3. Click on "Deploy The Unsaid Archive" workflow
4. Check if MongoDB test passes

---

## 🚀 Step 3: Deploy to Platform

### **Option 1: Vercel Deployment**

#### **Setup Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`

#### **Get Vercel Token:**
1. Vercel → Account Settings → Tokens
2. Create new token
3. Add to GitHub secrets as `VERCEL_TOKEN`

#### **Deploy:**
```bash
git push origin main
```
GitHub Actions will automatically deploy to Vercel!

### **Option 2: Railway Deployment**

#### **Setup Railway:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select your repository
4. Configure environment variables in Railway dashboard

#### **Get Railway Token:**
1. Railway → Account Settings → API Tokens
2. Create new token
3. Add to GitHub secrets as `RAILWAY_TOKEN`

#### **Deploy:**
```bash
git push origin main
```
GitHub Actions will automatically deploy to Railway!

---

## 📊 Step 4: Monitor Deployment

### **GitHub Actions Dashboard:**
1. Go to your repository → **Actions**
2. Click on workflow runs
3. View logs for each step:
   - ✅ Test MongoDB connection
   - ✅ Build frontend
   - ✅ Deploy to platform

### **Platform Dashboard:**
- **Vercel**: View deployment logs and metrics
- **Railway**: Monitor server performance and logs

---

## 🔍 Step 5: Verify Deployment

### **Health Check:**
```bash
curl https://your-domain.com/health
```

### **Manual Testing:**
1. Visit your deployed URL
2. Submit a test whisper
3. Check if it appears in real-time
4. Verify data in MongoDB Atlas

### **Check MongoDB Atlas:**
1. Go to your Atlas cluster
2. Click **Collections** → **whispers**
3. Verify new data appears

---

## 🔄 Step 6: Automatic Updates

### **How It Works:**
1. Push changes to `main` branch
2. GitHub Actions automatically:
   - Runs tests
   - Builds frontend
   - Deploys to production
   - Updates environment variables

### **Deployment Workflow:**
```mermaid
git push → GitHub Actions → Tests → Build → Deploy → Production
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **MongoDB Connection Failed**
- Check `MONGODB_URI` secret
- Verify IP whitelist in Atlas (0.0.0.0/0)
- Ensure database user exists

#### **Build Failures**
- Check Node.js version (must be 18+)
- Verify all dependencies installed
- Check frontend build logs

#### **Deployment Failures**
- Verify platform tokens
- Check environment variables
- Review deployment platform logs

#### **Real-time Features Not Working**
- Check `ALLOWED_ORIGINS` includes your domain
- Verify Socket.io configuration
- Check browser console for errors

### **Debug Steps:**

1. **Check GitHub Actions logs**
2. **Verify all secrets are set**
3. **Test MongoDB connection separately**
4. **Check deployment platform dashboard**
5. **Review browser console errors**

---

## 📱 Post-Deployment Checklist

- [ ] MongoDB Atlas connected
- [ ] Frontend builds successfully
- [ ] Deployment completes without errors
- [ ] Application loads at your domain
- [ ] Whisper submission works
- [ ] Real-time updates function
- [ ] Data persists in MongoDB
- [ ] SSL certificate active
- [ ] Mobile responsive

---

## 🎉 Success Metrics

Your deployment is successful when:

✅ **GitHub Actions** shows green checkmarks  
✅ **Application** loads at your domain  
✅ **Users** can submit whispers  
✅ **Real-time** updates work instantly  
✅ **Data** appears in MongoDB Atlas  
✅ **No console** errors on frontend  
✅ **Mobile** responsive design works  

---

## 🛠️ Maintenance

### **Regular Tasks:**
- Monitor MongoDB Atlas storage usage
- Check GitHub Actions for failed runs
- Update dependencies regularly
- Monitor platform performance metrics

### **Scaling:**
- **MongoDB**: Upgrade to M10+ for production
- **Vercel**: Pro plan for custom domains
- **Railway**: Upgrade for better performance

---

## 🎯 You're Live!

**The Unsaid Archive is now deployed with:**
- ✅ **Automatic CI/CD** pipeline
- ✅ **Cloud database** (MongoDB Atlas)
- ✅ **Global CDN** distribution
- ✅ **SSL certificates** included
- ✅ **Real-time updates** working
- ✅ **Mobile responsive** design

**Share your deployed URL and start collecting anonymous whispers globally!** 🌍🚀
