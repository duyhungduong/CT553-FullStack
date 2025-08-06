# MelodicBook Deployment Guide

## 🎯 Overview

This guide covers complete deployment of MelodicBook PWA to production with free GitHub Student Pack benefits.

## 📚 Prerequisites

- ✅ GitHub Student Pack activated
- ✅ Node.js 18+ installed
- ✅ Git configured
- ✅ MongoDB Atlas account (free tier)
- ✅ Clerk account for authentication

## 🌐 Step 1: Get FREE Domain (GitHub Student Pack)

### Option A: Namecheap (Recommended)

1. **Activate Benefit:**

   - Go to: https://education.github.com/pack
   - Find "Namecheap" → Click "Get access"
   - Sign up with your student email

2. **Claim FREE Domain:**

   ```
   Available Extensions:
   - .me (1 year FREE) ✅ Perfect for personal projects
   - .live (1 year FREE)
   - .online (1 year FREE)
   - .website (1 year FREE)
   ```

3. **Suggested Domain Names:**
   ```
   melodicbook.me
   mymelodicbook.me
   musicstream.me
   [yourname]melodic.me
   ```

### Option B: .tech domains

1. **Get .tech domain:**
   - Activate in GitHub Student Pack
   - Get .tech domain for 1 year FREE
   - Perfect for tech projects

### Option C: Name.com

1. **1 year FREE domain**
   - Standard extensions (.com, .org, .net)
   - Higher value but competitive names

## 🏗️ Step 2: Deployment Platforms (FREE for Students)

### Option A: Vercel + Railway (Recommended)

**Frontend (Vercel):**

- ✅ FREE hosting
- ✅ Automatic deployments
- ✅ Custom domain support
- ✅ Global CDN
- ✅ Built-in PWA support

**Backend (Railway):**

- ✅ $5/month FREE credit with Student Pack
- ✅ MongoDB support
- ✅ Environment variables
- ✅ Auto-scaling

### Option B: Netlify + Heroku

**Frontend (Netlify):**

- ✅ FREE tier
- ✅ PWA optimization
- ✅ Forms handling

**Backend (Heroku):**

- ✅ FREE tier available
- ✅ Student Pack credits

### Option C: DigitalOcean (Student Pack)

**Benefits:**

- ✅ $200 FREE credit for 1 year
- ✅ Full control
- ✅ Can host full-stack

## 🚀 Step 3: Prepare for Deployment

### 3.1 Environment Configuration

**Create deployment configs:**

```bash
# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.me
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_ENV=production

# Backend (.env.production)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
JWT_SECRET=your-super-secure-jwt-secret
REDIS_URL=redis://...
ALLOWED_ORIGINS=https://yourdomain.me,https://www.yourdomain.me
```

### 3.2 Build Optimization

**Update package.json:**

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod"
  }
}
```

### 3.3 Database Setup (MongoDB Atlas)

**Free Tier Setup:**

1. Go to https://cloud.mongodb.com/
2. Create FREE cluster (512MB)
3. Setup database user
4. Configure IP whitelist (0.0.0.0/0 for production)
5. Get connection string

## 📦 Step 4: Deploy Frontend (Vercel)

### 4.1 Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 4.2 Deploy Configuration

**Create `vercel.json`:**

```json
{
  "name": "melodicbook-frontend",
  "builds": [
    {
      "src": "packages/web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Service-Worker-Allowed": "/"
      }
    },
    {
      "src": "/manifest.json",
      "headers": {
        "Content-Type": "application/manifest+json"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "packages/web/dist/index.html": {
      "includeFiles": "packages/web/dist/**"
    }
  }
}
```

### 4.3 Deploy Commands

```bash
# From project root
cd packages/web
vercel

# Follow prompts:
# ? Set up and deploy "packages/web"? Y
# ? Which scope should contain your project? [your-username]
# ? Link to existing project? N
# ? What's your project's name? melodicbook-frontend
# ? In which directory is your code located? ./
```

### 4.4 Custom Domain Setup

```bash
# Add your domain
vercel domains add yourdomain.me
vercel domains add www.yourdomain.me

# Point to project
vercel alias https://melodicbook-frontend-xxx.vercel.app yourdomain.me
```

## 🔧 Step 5: Deploy Backend (Railway)

### 5.1 Railway Setup

1. **Get Railway Credits:**

   - Activate Railway in GitHub Student Pack
   - Get $5/month credit

2. **Connect GitHub:**
   - Go to https://railway.app/
   - Connect GitHub account
   - Select your repository

### 5.2 Railway Configuration

**Create `railway.json`:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd packages/api && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd packages/api && npm start",
    "healthcheckPath": "/health"
  }
}
```

**Add `Procfile`:**

```
web: cd packages/api && npm start
```

### 5.3 Environment Variables in Railway

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/melodicbook
CLERK_SECRET_KEY=sk_live_...
JWT_SECRET=your-jwt-secret-here
REDIS_URL=redis://railway-redis-url
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.me
```

## 🌍 Step 6: Domain Configuration

### 6.1 DNS Setup (Namecheap)

**A Records:**

```
Type: A
Host: @
Value: [Vercel IP from dashboard]

Type: A
Host: www
Value: [Vercel IP from dashboard]

Type: CNAME
Host: api
Value: your-railway-app.railway.app
```

**CNAME Records:**

```
Type: CNAME
Host: api
Value: melodicbook-api-production-xxx.up.railway.app
```

### 6.2 SSL Certificate

- ✅ Vercel provides FREE SSL automatically
- ✅ Railway provides FREE SSL automatically
- ✅ Both platforms handle HTTPS redirect

## 🔐 Step 7: Security Configuration

### 7.1 Update CORS Settings

```javascript
// packages/api/src/index.js
const allowedOrigins = [
  "https://yourdomain.me",
  "https://www.yourdomain.me",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

### 7.2 Content Security Policy

```html
<!-- Update index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self' https://yourdomain.me https://api.yourdomain.me;
  script-src 'self' 'unsafe-inline' https://clerk.dev;
  connect-src 'self' https://api.yourdomain.me https://clerk.dev;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
"
/>
```

## 📱 Step 8: PWA Configuration for Production

### 8.1 Update Manifest

```json
{
  "name": "MelodicBook - Music Streaming Platform",
  "short_name": "MelodicBook",
  "start_url": "https://yourdomain.me/",
  "scope": "https://yourdomain.me/",
  "id": "https://yourdomain.me/",
  "display": "standalone",
  "background_color": "#1a0b2e",
  "theme_color": "#1a0b2e"
}
```

### 8.2 Service Worker Updates

```javascript
// Update sw.js with production URLs
const API_BASE_URL = "https://api.yourdomain.me";
const STATIC_ASSETS = [
  "https://yourdomain.me/",
  "https://yourdomain.me/manifest.json",
  "https://yourdomain.me/offline.html",
];
```

## 🚀 Step 9: Deployment Commands

### 9.1 Build & Deploy Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying MelodicBook..."

# Build frontend
echo "📦 Building frontend..."
cd packages/web
npm run build

# Deploy to Vercel
echo "🌐 Deploying frontend to Vercel..."
vercel --prod

# Deploy backend (if using manual deployment)
echo "🔧 Backend deployed via Railway auto-deploy"

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://yourdomain.me"
echo "🔧 Backend: https://api.yourdomain.me"
```

### 9.2 Make Script Executable

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📊 Step 10: Monitoring & Analytics

### 10.1 Free Monitoring Tools

**Vercel Analytics:**

- Free performance monitoring
- Real-time visitor data
- Core Web Vitals tracking

**Railway Metrics:**

- CPU, memory usage
- Request logs
- Error tracking

### 10.2 Setup Monitoring

```javascript
// Add to main.tsx
if (import.meta.env.PROD) {
  // Vercel Analytics
  import("@vercel/analytics").then(({ inject }) => inject());

  // Performance monitoring
  import("./lib/analytics").then(({ trackPageView }) => {
    trackPageView(window.location.pathname);
  });
}
```

## 🧪 Step 11: Testing Deployment

### 11.1 PWA Testing Checklist

```
✅ HTTPS enabled
✅ Service Worker registered
✅ Manifest valid
✅ Install prompt works
✅ Offline functionality
✅ Push notifications ready
✅ App shortcuts work
✅ Mobile responsive
✅ Lighthouse score 90+
```

### 11.2 Test Commands

```bash
# Test PWA compliance
npx lighthouse https://yourdomain.me --view

# Test performance
npx web-vitals https://yourdomain.me

# Test offline functionality
# Open DevTools → Network → Offline → Refresh
```

## 💰 Cost Breakdown (Student Pack)

### FREE Resources:

- ✅ Domain: $0 (1 year via Student Pack)
- ✅ Vercel hosting: $0 (Hobby plan)
- ✅ Railway: $0 ($5/month credit)
- ✅ MongoDB Atlas: $0 (512MB free tier)
- ✅ Clerk Auth: $0 (10,000 MAU free)
- ✅ SSL certificates: $0 (automatic)

**Total Monthly Cost: $0**
**Annual Cost: ~$12 (domain renewal after year 1)**

## 🔄 Step 12: CI/CD Setup (Optional)

### 12.1 GitHub Actions

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy MelodicBook

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"

      - name: Install dependencies
        run: |
          cd packages/web
          npm ci

      - name: Build
        run: |
          cd packages/web
          npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/web

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: "melodicbook-api"
```

## 🎉 Success Checklist

### Deployment Complete When:

- [ ] Domain purchased and configured
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database connected and working
- [ ] SSL certificates active
- [ ] PWA features working
- [ ] All environment variables set
- [ ] DNS records configured
- [ ] Monitoring setup
- [ ] Performance optimized

## 🆘 Troubleshooting

### Common Issues:

1. **Domain not resolving:**

   - Check DNS propagation (up to 48 hours)
   - Verify DNS records in registrar

2. **PWA not installing:**

   - Check HTTPS is enabled
   - Verify manifest.json accessible
   - Ensure service worker registered

3. **API connection failed:**

   - Check CORS configuration
   - Verify environment variables
   - Test API endpoints directly

4. **Build failures:**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check build logs for errors

---

**🎯 Result: Professional PWA deployed with FREE domain!**
**🌐 Your app: https://yourdomain.me**
**💰 Cost: $0 with GitHub Student Pack**
