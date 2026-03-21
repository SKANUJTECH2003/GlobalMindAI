# 🚀 Deployment Guide

Get GlobalMindAI to production.

---

## 📋 Deployment Options

| Platform | Difficulty | Cost | Speed | Recommendation |
|----------|-----------|------|-------|-----------------|
| **Vercel** | ⭐ Easy | Free | ⚡ Instant | **RECOMMENDED** |
| **Netlify** | ⭐ Easy | Free | ⚡ Fast | Good alternative |
| **GitHub Pages** | ⭐ Easy | Free | 🎫 Slow | Simple static |
| **AWS S3 + CloudFront** | ⭐⭐ Moderate | $💰 Low | ⚡ Fast | Enterprise |
| **Docker + VPS** | ⭐⭐⭐ Complex | 💰💰 Medium | 🎫 Depends | Full control |
| **Azure Static Web** | ⭐⭐ Moderate | $💰 Low | ⚡ Fast | Microsoft stack |

---

## 1️⃣ Vercel Deployment (Recommended)

### Why Vercel?
✅ Built-in Git integration
✅ Auto-deploy on push
✅ Serverless functions (when needed)
✅ Edge caching across globe
✅ Analytics included
✅ Free tier generous

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Code pushed to repository
- Vercel account (free)

### Step-by-Step

#### A. Initialize Git (if not done)
```bash
cd c:\Users\Anjali Vishawakarma\OneDrive\Desktop\GlobalMindAI

# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: GlobalMindAI"

# Add remote (replace with your GitHub)
git remote add origin https://github.com/yourusername/GlobalMindAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### B. Create Vercel Account
1. Visit https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub

#### C. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import repository (select GlobalMindAI)
3. Select framework: **Vite**
4. Click **Deploy**

**Vercel auto-detects:**
- Framework: Vite ✓
- Build command: `npm run build` ✓
- Output: `dist/` ✓

#### D. Custom Domain (Optional)
1. In Vercel project settings
2. Go to **Domains**
3. Add custom domain
4. Update DNS settings
5. Wait for verification (5-15 min)

### Automatic Deployments
**Every push to `main` branch automatically:**
1. Builds the project
2. Runs tests (if configured)
3. Deploys to production
4. Generates live URL

### Rollback
In Vercel dashboard:
1. Click **Deployments**
2. Select previous deployment
3. Click **Promote to Production**
4. Live within seconds

**Perfect for quick fixes!**

---

## 2️⃣ Netlify Deployment

### Why Netlify?
✅ Simple GitHub integration
✅ Form handling available
✅ Excellent performance
✅ Free tier very good
✅ Great documentation

### Step-by-Step

1. **Push to GitHub** (same as Vercel section above)

2. **Connect to Netlify**
   - Visit https://app.netlify.com
   - Sign up with GitHub
   - Choose: "New site from Git"
   - Select your repository

3. **Configure Build**
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click **Deploy**

4. **Custom Domain**
   - Settings → Domain management
   - Add custom domain
   - Update DNS as instructed

### Environment Variables (if needed)
In Netlify:
1. Settings → Build & deploy → Environment
2. Add variables if required
3. Re-deploy

---

## 3️⃣ GitHub Pages Deployment

### Suitable For
✅ Static sites
✅ Portfolio projects
✅ Low traffic
❌ Not for custom domains easily
❌ Limited performance

### Step-by-Step

```bash
# 1. Update vite.config.ts for GitHub Pages
# If deploying to /GlobalMindAI/ path:
# Add to vite.config.ts:
# export default {
#   base: '/GlobalMindAI/',
#   ...
# }

# 2. Build project
npm run build

# 3. Deploy to gh-pages branch
npm install --save-dev gh-pages

# 4. Update package.json
# Add scripts:
# "deploy": "npm run build && gh-pages -d dist"

# 5. Deploy
npm run deploy
```

### Access your site
`https://yourusername.github.io/GlobalMindAI/`

---

## 4️⃣ Docker & VPS Deployment

### Prerequisites
- Docker installed
- VPS account (DigitalOcean, Linode, etc.)
- SSH access to server
- Basic Linux knowledge

### Create Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

RUN npm install -g http-server

WORKDIR /app
COPY --from=builder /app/dist ./

EXPOSE 3000
CMD ["http-server", ".", "-p", "3000", "-c-1"]
```

### Build and Push
```bash
# Build Docker image
docker build -t globalmindai:latest .

# Tag for registry (e.g., Docker Hub)
docker tag globalmindai:latest yourusername/globalmindai:latest

# Push to Docker Hub
docker push yourusername/globalmindai:latest
```

### Deploy on VPS
```bash
# SSH into server
ssh root@your-vps-ip

# Pull image
docker pull yourusername/globalmindai:latest

# Run container
docker run -d \
  -p 80:3000 \
  -p 443:3000 \
  --name globalmindai \
  yourusername/globalmindai:latest

# Setup nginx reverse proxy (optional)
# Point domain to server IP
```

---

## 5️⃣ AWS S3 + CloudFront

### Setup Process

#### A. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://globalmindai-prod
aws s3 website s3://globalmindai-prod \
  --index-document index.html \
  --error-document index.html
```

#### B. Upload Build
```bash
npm run build

aws s3 sync dist/ s3://globalmindai-prod --delete
```

#### C. Create CloudFront Distribution
1. CloudFront Console → Create distribution
2. Origin: Select your S3 bucket
3. Caching: Default cache setting
4. Custom domain (optional)
5. Create distribution

#### D. Configure for Single Page App
In CloudFront error pages:
- 403 → 200 (index.html)
- 404 → 200 (index.html)

### Deploy Script
```bash
#!/bin/bash
npm run build
aws s3 sync dist/ s3://globalmindai-prod --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 🔧 Pre-Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] Run TypeScript compiler: `npm run build`
- [ ] No console errors or warnings
- [ ] All tests pass
- [ ] Code properly formatted
- [ ] No console.log debug statements (except important ones)

### Performance
- [ ] Production bundle optimized (check size)
- [ ] Gzip enabled on server
- [ ] Cache headers configured
- [ ] Images optimized
- [ ] Code-splitting working

### Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested on iPhone Safari
- [ ] Tested on Android Chrome
- [ ] All features working end-to-end

### Configuration
- [ ] Model URLs correct for production
- [ ] API endpoints correct (if any)
- [ ] Environment variables set
- [ ] Error tracking configured
- [ ] Analytics set up

### Documentation
- [ ] README up-to-date
- [ ] Deployment documented
- [ ] Known issues documented
- [ ] Contact info visible
- [ ] License included

### Security
- [ ] Input sanitization working
- [ ] XSS protected
- [ ] CORS configured if needed
- [ ] No secrets in code
- [ ] Dependencies updated

---

## 📊 Environment Variables

Create `.env.production` for production-specific settings:

```bash
VITE_API_ENDPOINT=https://api.example.com
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

Access in code:
```typescript
const apiEndpoint = import.meta.env.VITE_API_ENDPOINT
```

---

## 🔍 Post-Deployment Verification

After deploying:

1. **Access the site**
   - Open in browser
   - Check console (F12) for errors
   - Verify all pages load

2. **Test core features**
   - [ ] Chat works
   - [ ] File upload works
   - [ ] Analysis generates
   - [ ] Quiz works
   - [ ] Voice input works (if enabled)

3. **Test on multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Test on mobile**
   - iPhone Safari
   - Android Chrome
   - Tablet view

5. **Check Performance**
   ```
   Lighthouse score: Aim for 90+
   First contentful paint: < 2 seconds
   Time to interactive: < 3 seconds
   ```

6. **Verify Analytics**
   - Install Google Analytics
   - Check events tracking
   - Monitor errors

---

## 📈 Monitoring & Maintenance

### Set up Monitoring
- **Error tracking**: Sentry.io (free tier available)
- **Uptime monitoring**: UptimeRobot (free)
- **Performance monitoring**: Web Vitals
- **Analytics**: Google Analytics or Plausible

### Regular Maintenance
- **Weekly**: Check error reports
- **Monthly**: Update dependencies
- **Monthly**: Review performance metrics
- **Quarterly**: Security audit
- **Quarterly**: Update documentation

### Backup Strategy
```bash
# Backup production data regularly
aws s3 sync s3://globalmindai-prod s3://globalmindai-backup-$(date +%Y%m%d)/
```

---

## 🔄 Update Deployment

### Push Updates

#### For Vercel/Netlify (Git-based)
```bash
# Make changes locally
# Test thoroughly
npm run build

# Commit and push
git add .
git commit -m "Feature: Add new functionality"
git push origin main

# Auto-deploys within minutes!
```

#### For S3 + CloudFront
```bash
# Build and sync
npm run build
aws s3 sync dist/ s3://globalmindai-prod --delete

# Invalidate cache (required!)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

#### For Docker
```bash
# Build new image
docker build -t yourusername/globalmindai:latest .

# Push to registry
docker push yourusername/globalmindai:latest

# SSH and redeploy
# docker pull yourusername/globalmindai:latest
# docker restart globalmindai
```

---

## 🎯 Recommended Stack

For best experience in production:

```
Frontend: Vite + React
Hosting: Vercel (auto-deploy from GitHub)
Domain: Custom .com or .app
SSL: Auto-renewed by Vercel
CDN: Vercel EdgeNetwork
Analytics: Google Analytics
Monitoring: Sentry.io
```

**This gets you:**
- ✅ 99.99% uptime
- ✅ Global CDN (2ms response anywhere)
- ✅ Auto SSL certificates
- ✅ Git-based deployment
- ✅ Analytics and monitoring
- ✅ Auto-scaling (if needed)
- ✅ Zero DevOps needed

**Cost**: Free for most use cases

---

## 📞 Deployment Support

### Vercel Help
- Docs: https://vercel.com/docs
- Support: support@vercel.com
- Community: Vercel Discord

### Netlify Help
- Docs: https://docs.netlify.com
- Support: support@netlify.com
- Community: Netlify Forums

### AWS Help
- Docs: https://docs.aws.amazon.com
- Support: AWS Support (paid)
- Community: AWS Forums

---

## 🎁 Deployment Tips

**Pro Tips:**
1. Use Vercel for simplicity (recommended for this project)
2. Set up GitHub Actions for automated testing
3. Use branch deployments for testing before production
4. Monitor error logs daily first week after deploy
5. Set up performance alerts
6. Keep backups of dist/ folder
7. Document all server configurations
8. Use semantic versioning for releases
9. Create release notes for major updates
10. Test rollback procedure before needed

---

## 📚 Related Documentation

- [README](README.md) - Project overview
- [Quick Start](QUICK_START.md) - Local development
- [Architecture](ARCHITECTURE.md) - System design
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

**Ready to deploy?** Choose Vercel and you'll be live in 5 minutes! 🚀
