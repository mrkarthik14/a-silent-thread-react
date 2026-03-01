# Deployment Guide for A Silent Thread

## Vercel Deployment

### Prerequisites
- GitHub repository: `mrkarthik14/a-silent-thread-react`
- Vercel account connected to GitHub
- Convex account for backend deployment

### Deployment Steps

#### 1. Environment Variables Setup

You need to configure the following environment variables in Vercel:

**Required Environment Variables:**

```bash
# Convex Configuration
VITE_CONVEX_URL=<your-convex-deployment-url>

# VLY Configuration (if using vly integrations)
VITE_VLY_APP_ID=<your-vly-app-id>
VITE_VLY_MONITORING_URL=<your-vly-monitoring-url>
```

**How to add environment variables in Vercel:**
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate value
4. Make sure to add them for all environments (Production, Preview, Development)

#### 2. Convex Backend Deployment

Before deploying to Vercel, deploy your Convex backend:

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Login to Convex
npx convex login

# Deploy to production
npx convex deploy

# Copy the deployment URL shown in the output
# Add it to Vercel as VITE_CONVEX_URL
```

#### 3. Vercel Configuration

Your project is configured with the following settings:

- **Framework**: Vite
- **Build Command**: `npm run build` (or `pnpm build`)
- **Output Directory**: `dist`
- **Install Command**: `pnpm install` (recommended) or `npm install`
- **Root Directory**: `./`

#### 4. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `mrkarthik14/a-silent-thread-react`
4. Select branch: `main`
5. Configure project settings (already set in vercel.json)
6. Add environment variables
7. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Post-Deployment Configuration

#### Update Convex Auth Settings

After deployment, update your Convex auth configuration:

1. Go to your Convex dashboard
2. Navigate to Settings → Environment Variables
3. Update `SITE_URL` to your Vercel deployment URL:
   ```
   SITE_URL=https://your-project.vercel.app
   ```

#### Update CORS Settings (if needed)

If you're using external APIs, make sure to update CORS settings to allow your Vercel domain.

### Build Configuration

The project uses:
- **Node.js Version**: 18.x or higher (recommended: 20.x)
- **Package Manager**: pnpm (recommended) or npm
- **Build Command**: `tsc -b && vite build`

### Optimization Tips

1. **Enable Vercel Analytics** (optional):
   ```bash
   npm install @vercel/analytics
   ```

2. **Enable Vercel Speed Insights** (optional):
   ```bash
   npm install @vercel/speed-insights
   ```

3. **Configure caching** (already set in vercel.json):
   - Static assets cached for 1 year
   - SPA routing handled with rewrites

### Troubleshooting

#### Build Fails
- Check that all environment variables are set
- Verify TypeScript has no errors: `npx tsc -b --noEmit`
- Check Convex deployment is successful

#### Runtime Errors
- Verify `VITE_CONVEX_URL` is correct
- Check browser console for errors
- Ensure Convex backend is deployed and running

#### Authentication Issues
- Verify `SITE_URL` in Convex matches your Vercel URL
- Check that JWT keys are properly configured in Convex
- Ensure email OTP is configured correctly

#### 404 Errors on Refresh
- Verify `vercel.json` has correct rewrite rules
- Check that SPA routing is enabled

### Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

### Monitoring

Monitor your deployment:
- **Vercel Dashboard**: View deployments, logs, and analytics
- **Convex Dashboard**: Monitor backend functions, database, and usage
- **Browser DevTools**: Check for client-side errors

### Environment-Specific Deployments

**Production:**
```bash
vercel --prod
```

**Preview:**
```bash
vercel
```

### Rollback

If you need to rollback:
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "⋯" menu → "Promote to Production"

### Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `SITE_URL` in Convex to match your custom domain

### Performance Checklist

Before deploying to production:
- ✅ Run TypeScript check: `npx tsc -b --noEmit`
- ✅ Run ESLint: `pnpm lint`
- ✅ Test build locally: `pnpm build && pnpm preview`
- ✅ Check bundle size: Review build output
- ✅ Test on mobile devices
- ✅ Verify all environment variables are set
- ✅ Test authentication flow
- ✅ Test real-time features (messaging, bookings)
- ✅ Verify Convex backend is deployed
- ✅ Check screenshot functionality works

### Security Checklist

- ✅ All API keys are in environment variables (not in code)
- ✅ Environment variables are NOT prefixed with `VITE_` for secrets
- ✅ JWT keys are secure and not exposed
- ✅ CORS is properly configured
- ✅ Input validation is in place (Zod schemas)
- ✅ Authentication is working correctly

### Support

If you encounter issues:
- Check Vercel deployment logs
- Check Convex function logs
- Review browser console errors
- Check this deployment guide
- Consult Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Consult Convex documentation: [docs.convex.dev](https://docs.convex.dev)

---

**Deployment URL**: https://mrkarthik14-a-silent-thread-react-dztf.vercel.app (example)
**GitHub**: https://github.com/mrkarthik14/a-silent-thread-react
**Status**: Ready for deployment ✅
