# Production Setup Guide for gostart.live

## Common Production Issues Fixed

### 1. CORS Configuration ✅
- Server now allows multiple origins including production domain
- Updated `server/src/app.ts` to support `https://gostart.live` and `https://www.gostart.live`

### 2. API Interceptor Issue ✅
- Fixed overly aggressive 401 redirect that was interrupting login flow
- Now only redirects if user was previously authenticated and receives 401
- Excludes auth endpoints from auto-redirect

### 3. Better Error Logging ✅
- Added detailed console logs to track authentication flow
- Server logs will show exactly where the error occurs

## Required Environment Variables

### Client (Vercel/Frontend)
Create these environment variables in your Vercel dashboard:

```bash
VITE_API_URL=https://your-backend-api-url.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Server (Backend Host)
Set these in your server hosting platform:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_URL=https://gostart.live
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## Google OAuth Configuration

### Critical: Authorized Redirect URIs
In Google Cloud Console (https://console.cloud.google.com/):

1. Go to **APIs & Services** → **Credentials**
2. Select your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   - `https://gostart.live`
   - `https://www.gostart.live`
   - `http://localhost:5174` (for local dev)

4. Under **Authorized redirect URIs**, add:
   - `https://gostart.live`
   - `https://www.gostart.live`
   - `http://localhost:5174` (for local dev)

**⚠️ This is the #1 cause of "Internal Server Error" on production!**

## Vercel Deployment Settings

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### vercel.json (Already configured)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

## Debugging Production Issues

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors related to:
   - CORS (Cross-Origin Resource Sharing)
   - 401/500 HTTP errors
   - Google OAuth failures

### Check Network Tab
1. Open DevTools → **Network** tab
2. Try to login
3. Look at the `/api/auth/google` request
4. Check:
   - Request URL (should match your VITE_API_URL)
   - Response status (200 = success, 500 = server error)
   - Response body for error messages

### Check Server Logs
Your backend hosting service should show console.logs:
- "Google auth attempt received"
- "Google auth successful for: [email]"
- Any error messages

## Common Issues & Solutions

### Issue: "Internal Server Error" on Login

**Possible Causes:**
1. ❌ Google OAuth redirect URIs not configured for production domain
   - **Fix:** Add your production URL to Google Console (see above)

2. ❌ GOOGLE_CLIENT_ID mismatch between client and server
   - **Fix:** Ensure both use the SAME client ID

3. ❌ VITE_API_URL not set or incorrect
   - **Fix:** Set correct backend URL in Vercel environment variables

4. ❌ CORS blocking requests
   - **Fix:** Already fixed in server/src/app.ts (redeploy backend)

### Issue: Login works locally but not in production

**Fix:** This is 99% a Google OAuth configuration issue
- Verify redirect URIs include production domain
- Check that VITE_GOOGLE_CLIENT_ID is set in Vercel
- Ensure GOOGLE_CLIENT_ID is set on backend server

### Issue: Redirects to landing page after login

**Fix:** Already fixed in this update
- Updated API interceptor to not redirect during login
- Added proper error handling in Landing.tsx

## Deployment Checklist

### Before Deploying:
- [ ] Set all environment variables in Vercel
- [ ] Set all environment variables on backend server
- [ ] Configure Google OAuth redirect URIs
- [ ] Verify MongoDB is accessible from backend
- [ ] Test locally with production API URL

### After Deploying:
- [ ] Test Google login on production
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Test logout and re-login flow
- [ ] Verify all features work (matching, chat, etc.)

## Quick Test Commands

### Test API Connection (from browser console on gostart.live)
```javascript
fetch('YOUR_BACKEND_URL/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Check Environment Variables (from browser console)
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

## Support

If issues persist:
1. Check browser console for specific error messages
2. Check server logs for detailed error info
3. Verify all environment variables are set correctly
4. Double-check Google OAuth configuration

## Recent Fixes Applied

✅ Fixed API interceptor to not interrupt login flow
✅ Added comprehensive CORS support for production
✅ Enhanced error logging on both client and server
✅ Improved authentication state management
✅ Fixed logout → login loop issue
✅ Removed unused code files

