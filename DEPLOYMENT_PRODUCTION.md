# 🚀 Production Deployment Guide - duongduyhung.tech

## 🎯 Deployment Overview

**Frontend:** https://duongduyhung.tech (hoặc melodicbook.duongduyhung.tech)
**Backend API:** https://api.duongduyhung.tech (hoặc api.melodicbook.duongduyhung.tech)
**Database:** MongoDB Atlas (FREE tier)
**Auth:** Clerk Authentication

## 📋 Pre-Deployment Checklist

### 1. Tài khoản cần thiết:

- ✅ Domain: duongduyhung.tech (đã có)
- ⬜ Vercel account (free)
- ⬜ Railway account (free, $5 credit)
- ⬜ MongoDB Atlas (free)
- ⬜ Clerk account (free tier)

### 2. Repository chuẩn bị:

- ⬜ Push code lên GitHub
- ⬜ Tạo production branch
- ⬜ Environment variables template

## 🔥 DEPLOYMENT STEP-BY-STEP

### BƯỚC 1: Set up MongoDB Atlas

```bash
# 1. Đăng ký MongoDB Atlas: https://www.mongodb.com/atlas
# 2. Tạo FREE cluster (M0 Sandbox)
# 3. Tạo database user
# 4. Whitelist IP: 0.0.0.0/0 (allow all)
# 5. Copy connection string
```

**Connection String Example:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/melodicbook?retryWrites=true&w=majority
```

### BƯỚC 2: Deploy Backend to Railway

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login Railway
railway login

# Trong thư mục backend/
cd backend
railway link
railway up

# Hoặc deploy qua GitHub (recommended):
# 1. Vào https://railway.app
# 2. Connect GitHub
# 3. Import repository: CT553-FullStack
# 4. Select backend folder
```

**Set Railway Environment Variables:**

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/melodicbook
CLERK_SECRET_KEY=sk_live_...
ALLOWED_ORIGINS=https://duongduyhung.tech,https://www.duongduyhung.tech
JWT_SECRET=your-super-secret-jwt-key
```

### BƯỚC 3: Deploy Frontend to Vercel

```bash
# Cài Vercel CLI
npm install -g vercel

# Login Vercel
vercel login

# Trong thư mục frontend/
cd frontend
vercel

# Follow prompts:
# ? Set up and deploy "frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? (your-username)
# ? Link to existing project? [y/N] N
# ? What's your project's name? melodicbook
# ? In which directory is your code located? ./
```

**Set Vercel Environment Variables:**

```env
VITE_API_URL=https://melodicbook-backend-production.up.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_SITE_URL=https://duongduyhung.tech
```

### BƯỚC 4: Configure DNS Records

**Vào domain registrar (.tech domains) và add DNS records:**

#### Option A: Main Domain

```
Type: A
Host: @
Value: 76.76.19.61

Type: A
Host: www
Value: 76.76.19.61

Type: CNAME
Host: api
Value: melodicbook-backend-production.up.railway.app
```

#### Option B: Subdomain (Recommended)

```
Type: CNAME
Host: melodicbook
Value: cname.vercel-dns.com

Type: CNAME
Host: api.melodicbook
Value: melodicbook-backend-production.up.railway.app
```

### BƯỚC 5: Add Custom Domain to Vercel

```bash
# Add domain to Vercel
vercel domains add duongduyhung.tech
vercel domains add www.duongduyhung.tech

# Hoặc subdomain:
vercel domains add melodicbook.duongduyhung.tech
```

### BƯỚC 6: Update PWA Configuration

#### Update `frontend/public/manifest.json`:

```json
{
  "name": "MelodicBook - Music Streaming Platform",
  "short_name": "MelodicBook",
  "start_url": "https://duongduyhung.tech/",
  "scope": "https://duongduyhung.tech/",
  "id": "https://duongduyhung.tech/",
  "display": "standalone",
  "theme_color": "#1DB954",
  "background_color": "#121212",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Update `frontend/public/sw.js`:

```javascript
const CACHE_NAME = "melodicbook-v1";
const STATIC_ASSETS = [
  "https://duongduyhung.tech/",
  "https://duongduyhung.tech/manifest.json",
  "https://duongduyhung.tech/offline.html",
  "/static/js/",
  "/static/css/",
];
```

#### Update Environment Files:

**frontend/.env.production:**

```env
VITE_API_URL=https://api.duongduyhung.tech
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_SITE_URL=https://duongduyhung.tech
```

**backend/.env.production:**

```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/melodicbook
CLERK_SECRET_KEY=sk_live_...
ALLOWED_ORIGINS=https://duongduyhung.tech,https://www.duongduyhung.tech
PORT=8000
```

### BƯỚC 7: Final Deployment

```bash
# Build và deploy frontend
cd frontend
npm run build
vercel --prod

# Backend tự động deploy từ GitHub
# Hoặc manual push:
cd backend
railway up --service backend
```

## 🧪 Testing & Verification

### 1. Test Domain Resolution:

```bash
nslookup duongduyhung.tech
nslookup api.duongduyhung.tech
```

### 2. Test HTTPS:

- ✅ https://duongduyhung.tech (frontend)
- ✅ https://api.duongduyhung.tech (backend)

### 3. Test PWA Features:

- ✅ Install prompt
- ✅ Offline functionality
- ✅ Push notifications
- ✅ Service worker

### 4. Test API Connectivity:

```bash
# Test backend API
curl https://api.duongduyhung.tech/health

# Expected response:
{"status": "OK", "timestamp": "2024-01-20T10:30:00Z"}
```

## 🎯 Expected Results

✅ **Frontend:** https://duongduyhung.tech
✅ **Backend:** https://api.duongduyhung.tech  
✅ **Database:** MongoDB Atlas connected
✅ **Auth:** Clerk authentication working
✅ **PWA:** Full functionality
✅ **HTTPS:** Automatic SSL certificates
✅ **Cost:** $0 (FREE tier everything!)

## 🚨 Troubleshooting

### DNS Issues:

- DNS propagation: 24-48 hours
- Use `dig` command to check records
- Try different DNS servers (8.8.8.8)

### API Connection Issues:

- Check CORS settings in backend
- Verify environment variables
- Check Railway logs: `railway logs`

### PWA Issues:

- Clear browser cache
- Check service worker in DevTools
- Verify manifest.json format

### Deployment Issues:

- Check build logs in Vercel
- Verify all environment variables
- Test locally first with production env

## 💰 Cost Breakdown

- **Domain:** FREE (GitHub Student Pack)
- **Frontend Hosting:** FREE (Vercel)
- **Backend Hosting:** FREE (Railway $5 credit)
- **Database:** FREE (MongoDB Atlas M0)
- **Auth:** FREE (Clerk free tier)
- **SSL Certificates:** FREE (auto-generated)

**Total: $0/month for first year!**

---

## 🎉 Ready to Deploy?

Bạn đã sẵn sàng deploy MelodicBook lên domain duongduyhung.tech chưa?

**Next step:** Tôi sẽ hướng dẫn bạn từng bước một, bắt đầu với MongoDB Atlas!
