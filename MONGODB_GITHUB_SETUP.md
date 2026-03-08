# 🌐 MongoDB Atlas Setup for GitHub Deployment

## 📋 Why MongoDB Atlas is Required

- **Local MongoDB** only works on your machine
- **GitHub Actions/Vercel** need cloud-accessible database
- **MongoDB Atlas** provides free cloud hosting
- **Automatic backups** and monitoring included

---

## 🚀 Step-by-Step MongoDB Atlas Setup

### **1. Create MongoDB Atlas Account**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with Google/GitHub or email
4. Verify your email

### **2. Create Free Cluster**
1. After login, click **"Build a Database"**
2. Choose **"M0 Sandbox"** (FREE - 512MB)
3. Select **Cloud Provider**: AWS
4. Select **Region**: Choose closest to your users
5. **Cluster Name**: `unsaid-archive-cluster`
6. Click **"Create Cluster"**

### **3. Create Database User**
1. While cluster creates, go to **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. **Authentication Method**: Username/Password
4. **Username**: `unsaid-archive-user`
5. **Password**: Generate strong password (save it!)
6. **Database User Privileges**: Read and write to any database
7. Click **"Add User"**

### **4. Configure Network Access**
1. Go to **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. Choose **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
4. **Why?** GitHub/Vercel need access from any IP
5. Click **"Confirm"**

### **5. Get Connection String**
1. Go to **"Database"** (left menu)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 6.0 or later
6. **Copy the connection string**

Your connection string will look like:
```
mongodb+srv://unsaid-archive-user:<password>@unsaid-archive-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **6. Update Connection String**
Replace `<password>` with your actual password:
```
mongodb+srv://unsaid-archive-user:YOUR_ACTUAL_PASSWORD@unsaid-archive-cluster.xxxxx.mongodb.net/unsaid-archive?retryWrites=true&w=majority
```

---

## 🔧 Configure for GitHub Deployment

### **Option 1: GitHub Secrets (Recommended)**
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name**: `MONGODB_URI`
5. **Secret**: Paste your complete connection string
6. Click **"Add secret"

### **Option 2: Vercel Environment Variables**
1. Go to Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add `MONGODB_URI` with your connection string

---

## 🧪 Test Your Connection

### **Test Locally First**
Update your `backend/.env`:
```env
MONGODB_URI=mongodb+srv://unsaid-archive-user:YOUR_PASSWORD@cluster.mongodb.net/unsaid-archive?retryWrites=true&w=majority
```

Then test:
```bash
cd backend
node server.js
```

### **Test Connection Script**
Create `test-mongo-atlas.js`:
```javascript
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://unsaid-archive-user:YOUR_PASSWORD@cluster.mongodb.net/unsaid-archive?retryWrites=true&w=majority";

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log('✅ Connected to MongoDB Atlas successfully!');
  
  const database = client.db('unsaid-archive');
  const collections = await database.listCollections().toArray();
  console.log('📁 Collections:', collections.map(c => c.name));
  
} catch (error) {
  console.error('❌ Connection failed:', error.message);
} finally {
  await client.close();
}
```

---

## 🔒 Security Best Practices

### **1. Never Commit Passwords**
- ❌ Don't put passwords in code
- ✅ Use environment variables/secrets
- ✅ Use GitHub Secrets for CI/CD

### **2. Use Strong Passwords**
- Minimum 16 characters
- Mix uppercase, lowercase, numbers, symbols
- Don't reuse passwords

### **3. Monitor Access**
- Check Atlas dashboard for unusual activity
- Review connection logs
- Set up alerts for high usage

---

## 📊 Atlas Features You Get

### **Free Tier (M0) Includes:**
- ✅ 512MB storage
- ✅ Unlimited connections
- ✅ Automatic backups
- ✅ Performance monitoring
- ✅ 24/7 uptime
- ✅ Global CDN

### **Monitoring Dashboard:**
- Real-time performance metrics
- Query analyzer
- Connection monitoring
- Storage usage tracking

---

## 🚨 Troubleshooting

### **Connection Errors:**

**"Authentication failed"**
- Check username/password
- Verify user exists in Atlas
- Ensure password is URL-encoded

**"IP not whitelisted"**
- Add 0.0.0.0/0 to IP whitelist
- Wait 2-3 minutes for changes
- Check network access settings

**"Connection timeout"**
- Check cluster region
- Verify network connectivity
- Try different connection string

### **Performance Issues:**
- Monitor Atlas dashboard
- Check query performance
- Consider upgrading to M10 for production

---

## ✅ Success Checklist

Before deploying to GitHub:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string tested locally
- [ ] Environment variables set in GitHub/Vercel
- [ ] Connection working with production server
- [ ] Data persists after restarts

---

## 🎉 You're Ready!

Your MongoDB Atlas is now configured for GitHub deployment:
- ✅ Cloud-accessible from anywhere
- ✅ Secure authentication
- ✅ Automatic backups
- ✅ Monitoring included
- ✅ Free tier ready for production

**Next: Deploy to GitHub/Vercel with your Atlas connection string!** 🚀
