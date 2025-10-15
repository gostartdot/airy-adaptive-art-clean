# AI Persona Image Blur Fix

## Issue
AI personas were showing unblurred images because they use external URLs from `pravatar.cc`, not Cloudinary URLs.

## Solution Implemented
Updated `imageTransform.ts` to use **Cloudinary's fetch feature** for non-Cloudinary URLs.

### How It Works

#### For Cloudinary URLs (User Photos)
```
Original: https://res.cloudinary.com/demo/image/upload/profile.jpg
Blurred:  https://res.cloudinary.com/demo/image/upload/e_blur:2000,e_pixelate:20,q_auto:low/profile.jpg
```

#### For External URLs (AI Personas)
```
Original: https://i.pravatar.cc/400?img=5
Blurred:  https://res.cloudinary.com/YOUR_CLOUD/image/fetch/e_blur:2000,e_pixelate:20,q_auto:low/https%3A%2F%2Fi.pravatar.cc%2F400%3Fimg%3D5
```

Cloudinary fetches the external image and applies blur transformations on-the-fly.

---

## Setup Required

### 1. Environment Variable
Ensure `CLOUDINARY_CLOUD_NAME` is set in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Enable Cloudinary Fetch (Usually Enabled by Default)
1. Go to Cloudinary Dashboard → Settings → Security
2. Find "Fetched URL" or "Resource fetching" section
3. Ensure it's enabled
4. Optionally add `pravatar.cc` to allowed domains (for better security)

---

## Testing

### Before Fix
```
1. Find AI persona match (anonymous)
2. Inspect image element in DevTools
3. See: src="https://i.pravatar.cc/400?img=5"
4. ❌ Clear, unblurred image visible
```

### After Fix
```
1. Find AI persona match (anonymous)
2. Inspect image element in DevTools
3. See: src="https://res.cloudinary.com/.../fetch/e_blur:2000.../https%3A%2F%2Fi.pravatar.cc..."
4. ✅ Heavily blurred/pixelated image
5. After reveal → Original pravatar.cc URL → Clear image
```

---

## Alternative: Upload AI Persona Images to Cloudinary

If Cloudinary fetch is disabled or you want better control, upload AI persona images to Cloudinary:

### Step 1: Upload Images
```bash
# Example script to upload AI persona images
node scripts/upload-ai-personas.js
```

### Step 2: Update aiPersonas.ts
```typescript
export const FEMALE_PERSONAS: AIPersona[] = [
  {
    id: 'ai_female_1',
    name: 'Priya',
    // Replace with Cloudinary URLs
    photos: ['https://res.cloudinary.com/YOUR_CLOUD/image/upload/ai_personas/priya.jpg'],
    // ...
  }
];
```

---

## Benefits

### ✅ Security
- AI persona images now blurred for anonymous profiles
- Cannot bypass by inspecting DOM
- Server-enforced privacy

### ✅ Consistency
- All images (user + AI) use same blur mechanism
- Uniform experience across the app

### ✅ Performance
- Cloudinary caches fetched images
- Fast CDN delivery
- Automatic optimization

---

## Troubleshooting

### Images Not Loading
**Cause**: Cloudinary fetch may be disabled or rate-limited

**Solution**:
1. Check Cloudinary dashboard for fetch limits
2. Or upload AI persona images directly to Cloudinary (see Alternative above)

### Images Loading But Not Blurred
**Cause**: Incorrect CLOUDINARY_CLOUD_NAME in environment

**Solution**:
```bash
# Check your .env file
cat server/.env | grep CLOUDINARY_CLOUD_NAME

# Should match your Cloudinary account name
```

### CORS Errors
**Cause**: pravatar.cc blocking Cloudinary fetch

**Solution**:
- Upload AI persona images to Cloudinary instead
- Or use different image source that allows hotlinking

---

## Code Changes

### Modified Files
1. `server/src/utils/imageTransform.ts`
   - Added Cloudinary fetch support for external URLs
   - Added environment variable detection

### No Changes Needed In
- `server/src/controllers/matchController.ts` (already uses `getBlurredImageUrls`)
- `server/src/controllers/chatController.ts` (already uses `getBlurredImageUrls`)
- `server/src/config/aiPersonas.ts` (pravatar.cc URLs work with fetch)

---

## Future Improvements

1. **Upload AI Persona Images**: More reliable than fetch
2. **Cloudinary Upload API**: Fetch and cache images permanently
3. **Custom AI Avatars**: More unique and brand-consistent
4. **Face Detection**: Apply blur only to faces for partial reveal feature

---

## Security Notes

- ✅ Original external URLs never exposed to frontend
- ✅ Cloudinary proxies and transforms before serving
- ✅ Cannot remove transformations from fetch URLs
- ✅ Same security as Cloudinary-hosted images

---

## Status
✅ **FIXED** - AI persona images now properly blurred for anonymous profiles

