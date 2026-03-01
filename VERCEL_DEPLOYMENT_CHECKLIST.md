# Vercel Deployment Checklist ✅

## Pre-Deployment Checks

### 1. Code Quality
- [ ] Run TypeScript check: `npx tsc -b --noEmit`
- [ ] Run linter: `pnpm lint`
- [ ] Fix any errors or warnings
- [ ] Test build locally: `pnpm build`
- [ ] Preview build: `pnpm preview`

### 2. Environment Variables
- [ ] Copy environment variables from `.env.local`
- [ ] Add them to Vercel project settings
- [ ] Verify all required variables are set:
  - [ ] `VITE_CONVEX_URL`
  - [ ] `VITE_VLY_APP_ID` (if using VLY)
  - [ ] `VITE_VLY_MONITORING_URL` (if using VLY)

### 3. Convex Backend
- [ ] Deploy Convex backend: `npx convex deploy --prod`
- [ ] Copy production Convex URL
- [ ] Update `VITE_CONVEX_URL` in Vercel with production URL
- [ ] Verify Convex deployment is working

### 4. Convex Auth Configuration
- [ ] Go to Convex dashboard → Settings
- [ ] Set `SITE_URL` to your Vercel URL
- [ ] Verify JWT keys are configured
- [ ] Test authentication flow

## Vercel Configuration

### Project Settings
- [x] Framework: Vite ✅
- [x] Build Command: `npm run build` ✅
- [x] Output Directory: `dist` ✅
- [x] Install Command: `pnpm install` or `npm install` ✅
- [x] Root Directory: `./` ✅

### Configuration Files
- [x] `vercel.json` created ✅
- [x] SPA routing configured ✅
- [x] Cache headers configured ✅

## Deployment Process

### Option 1: Vercel Dashboard
1. [ ] Go to [vercel.com/new](https://vercel.com/new)
2. [ ] Import GitHub repo: `mrkarthik14/a-silent-thread-react`
3. [ ] Select branch: `main`
4. [ ] Add environment variables
5. [ ] Click "Deploy"
6. [ ] Wait for deployment to complete

### Option 2: Vercel CLI
1. [ ] Install: `npm install -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel --prod`

## Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes)
- [ ] Authentication works
  - [ ] Sign up with email OTP
  - [ ] Login with email OTP
  - [ ] Logout works
- [ ] Real-time features work
  - [ ] Messaging
  - [ ] Bookings
  - [ ] Feed updates
- [ ] Theme switching works (light/dark)
- [ ] Mobile responsiveness
- [ ] Screenshot functionality works
- [ ] No console errors

### Performance Tests
- [ ] Check Lighthouse score
- [ ] Verify page load time < 3s
- [ ] Test on mobile device
- [ ] Test on different browsers
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### Security Checks
- [ ] No API keys exposed in client code
- [ ] HTTPS enabled
- [ ] Authentication working properly
- [ ] CORS configured correctly
- [ ] Environment variables secure

## Continuous Deployment

### Automatic Deployments
- [x] Production: Push to `main` branch ✅
- [x] Preview: Create pull request ✅

### Branch Protection (Recommended)
- [ ] Enable branch protection on `main`
- [ ] Require PR reviews
- [ ] Require status checks to pass

## Monitoring Setup

### Vercel
- [ ] Enable Vercel Analytics (optional)
- [ ] Enable Speed Insights (optional)
- [ ] Monitor deployment logs

### Convex
- [ ] Monitor function logs
- [ ] Check database usage
- [ ] Monitor real-time connections

## Custom Domain (Optional)

- [ ] Add custom domain in Vercel
- [ ] Update DNS records
- [ ] Wait for DNS propagation
- [ ] Update `SITE_URL` in Convex
- [ ] Test with custom domain

## Rollback Plan

If deployment fails:
1. [ ] Check deployment logs in Vercel
2. [ ] Check Convex logs
3. [ ] Rollback to previous deployment in Vercel
4. [ ] Fix issues locally
5. [ ] Redeploy

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Convex Docs: https://docs.convex.dev
- Project README: README.md
- Deployment Guide: DEPLOYMENT.md

---

## Quick Commands Reference

```bash
# Local Development
pnpm dev                    # Start dev server
npx convex dev              # Start Convex backend

# Build & Test
pnpm build                  # Build for production
pnpm preview               # Preview production build
npx tsc -b --noEmit        # Type check
pnpm lint                   # Run linter

# Convex Deployment
npx convex deploy --prod    # Deploy backend to production

# Vercel Deployment
vercel                      # Deploy preview
vercel --prod              # Deploy to production

# Git Commands
git add .
git commit -m "message"
git push origin main        # Triggers production deployment
```

---

**Current Status**: Ready for deployment ✅

**Your Vercel Project**: mrkarthik14-a-silent-thread-react-dztf
**GitHub Repo**: mrkarthik14/a-silent-thread-react
**Branch**: main
