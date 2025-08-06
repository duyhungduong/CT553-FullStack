# Domain Setup Guide - duongduyhung.tech

## 🎉 Domain Successfully Registered!

Congratulations! You now have **duongduyhung.tech** domain ready for deployment.

## 🚀 Next Steps with Your Domain

## 🌐 Domain Configuration for duongduyhung.tech

### Step 1: Access Domain Management

1. Login to your domain registrar account (.tech domains)
2. Go to **DNS Management** or **Domain Settings**
3. Find **duongduyhung.tech** in your domain list
4. Click **Manage DNS** or **DNS Records**

### Step 2: Configure DNS Records for Deployment

**Set up these DNS records for full-stack deployment:**

#### For Frontend (duongduyhung.tech):

```
Type: A
Host: @
Value: 76.76.19.61

Type: A
Host: www
Value: 76.76.19.61

Type: CNAME
Host: @
Value: cname.vercel-dns.com
```

#### For Backend API (api.duongduyhung.tech):

```
Type: CNAME
Host: api
Value: [your-railway-app].up.railway.app
```

### Step 3: Verify Domain Ownership

Test your domain configuration:

```bash
# Check if domain resolves
nslookup duongduyhung.tech

# Check domain propagation (may take 24-48 hours)
dig duongduyhung.tech
```

## 🚀 Deployment with Custom Domain

Your **duongduyhung.tech** domain is ready! Now let's deploy:

### Option A: Use as Main Domain

- **Frontend:** https://duongduyhung.tech
- **Backend API:** https://api.duongduyhung.tech

### Option B: Use Subdomain for MelodicBook

- **Frontend:** https://melodicbook.duongduyhung.tech
- **Backend API:** https://api.melodicbook.duongduyhung.tech

## 🔧 Deployment Commands

### Deploy Frontend to Vercel:

```bash
# Navigate to frontend
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy and add custom domain
vercel --prod

# Add your domain
vercel domains add duongduyhung.tech
vercel domains add www.duongduyhung.tech

# Or if using subdomain:
vercel domains add melodicbook.duongduyhung.tech
```

### Deploy Backend to Railway:

```bash
# Method 1: GitHub Integration (Recommended)
1. Go to https://railway.app
2. Connect GitHub account
3. Import repository: CT553-FullStack
4. Select backend folder
5. Auto-deploy on push

# Method 2: Railway CLI
npm install -g @railway/cli
railway login
railway link
railway up
```

## 📱 PWA Configuration Updates

Update your PWA files with the new domain:

### Update manifest.json:

```json
{
  "name": "MelodicBook - Music Streaming Platform",
  "short_name": "MelodicBook",
  "start_url": "https://duongduyhung.tech/",
  "scope": "https://duongduyhung.tech/",
  "id": "https://duongduyhung.tech/",
  "display": "standalone",
  "theme_color": "#1DB954",
  "background_color": "#121212"
}
```

### Update service worker (frontend/public/sw.js):

```javascript
const STATIC_ASSETS = [
  "https://duongduyhung.tech/",
  "https://duongduyhung.tech/manifest.json",
  "https://duongduyhung.tech/offline.html",
];

// Or if using subdomain:
const STATIC_ASSETS = [
  "https://melodicbook.duongduyhung.tech/",
  "https://melodicbook.duongduyhung.tech/manifest.json",
  "https://melodicbook.duongduyhung.tech/offline.html",
];
```

### Update environment variables:

```env
# Frontend (.env.production)
VITE_API_URL=https://api.duongduyhung.tech
VITE_SITE_URL=https://duongduyhung.tech

# Or if using subdomain:
VITE_API_URL=https://api.melodicbook.duongduyhung.tech
VITE_SITE_URL=https://melodicbook.duongduyhung.tech

# Backend (.env.production)
ALLOWED_ORIGINS=https://duongduyhung.tech,https://www.duongduyhung.tech
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/melodicbook
CLERK_SECRET_KEY=sk_test_...
```

## 🎯 What You Have Now

✅ **Domain:** duongduyhung.tech (FREE for 1 year)
✅ **Value:** ~$15-20 saved with GitHub Student Pack
✅ **Professional branding** for your MelodicBook PWA
✅ **Ready for production deployment**
✅ **HTTPS automatically enabled**

## 🔜 Immediate Next Steps

### Step 1: Choose Domain Structure

**Option A (Simple):** duongduyhung.tech → MelodicBook app
**Option B (Organized):** melodicbook.duongduyhung.tech → MelodicBook app

### Step 2: Deploy Infrastructure

1. **Set up MongoDB Atlas** (free tier)
2. **Deploy backend to Railway**
3. **Deploy frontend to Vercel**
4. **Configure DNS records**

### Step 3: Test Everything

1. **PWA installation**
2. **API connectivity**
3. **Authentication flow**
4. **Offline functionality**

---

**🚀 Ready to deploy MelodicBook to duongduyhung.tech!**

Bạn muốn tôi hướng dẫn deploy ngay bây giờ không?
