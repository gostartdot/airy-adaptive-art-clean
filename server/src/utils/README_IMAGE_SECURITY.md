# Image Security Utilities

## Quick Reference for Developers

### ⚠️ CRITICAL: Always Use Image Transformation for Anonymous Profiles

When returning user data where profiles are **not yet revealed**, you **MUST** use the `getBlurredImageUrls()` function to protect user privacy.

---

## Import & Usage

```typescript
import { getBlurredImageUrls } from '../utils/imageTransform';

// For single URL
import { getBlurredImageUrl } from '../utils/imageTransform';
```

---

## When to Use

### ✅ DO USE for Anonymous Profiles
```typescript
// Match not revealed yet
if (!match.revealStatus.isRevealed) {
  return {
    otherUser: {
      blurredPhotos: getBlurredImageUrls(user.photos || [])
    }
  };
}
```

### ❌ DON'T USE for Revealed Profiles
```typescript
// Match already revealed - send original photos
if (match.revealStatus.isRevealed) {
  return {
    otherUser: {
      photos: user.photos  // Original URLs OK here
    }
  };
}
```

---

## Examples

### Example 1: Match Controller
```typescript
export const getMatches = async (req: AuthRequest, res: Response) => {
  const matches = await Match.find({ userId });
  
  const formattedMatches = matches.map(match => {
    if (match.revealStatus.isRevealed) {
      return { ...match, otherUser };
    } else {
      return {
        ...match,
        otherUser: {
          ...otherUser,
          blurredPhotos: getBlurredImageUrls(otherUser.photos || [])
        }
      };
    }
  });
  
  return sendSuccess(res, formattedMatches);
};
```

### Example 2: Chat Controller
```typescript
export const getConversations = async (req: AuthRequest, res: Response) => {
  const conversations = matches.map(match => {
    const otherUser = getOtherUser(match);
    
    return {
      matchId: match._id,
      otherUser: match.revealStatus.isRevealed 
        ? otherUser 
        : {
            ...otherUser,
            blurredPhotos: getBlurredImageUrls(otherUser.photos || [])
          },
      isAnonymous: !match.revealStatus.isRevealed
    };
  });
  
  return sendSuccess(res, conversations);
};
```

---

## How It Works

### URL Transformation
The function transforms Cloudinary URLs by inserting transformation parameters:

**Before:**
```
https://res.cloudinary.com/yourcloud/image/upload/profile.jpg
```

**After:**
```
https://res.cloudinary.com/yourcloud/image/upload/e_blur:2000,e_pixelate:20,q_auto:low/profile.jpg
```

### Transformation Parameters
- `e_blur:2000` - Maximum blur strength
- `e_pixelate:20` - Pixelation effect
- `q_auto:low` - Reduced quality (50-70%)

### Non-Cloudinary URLs
The function safely handles non-Cloudinary URLs:
- Returns the URL unchanged
- No errors or side effects
- Useful for AI personas with external image URLs

---

## Testing Your Implementation

### Manual Test Checklist
1. ✅ Find a match (before reveal)
2. ✅ Open DevTools → Network tab
3. ✅ Check API response - should contain "e_blur" in photo URLs
4. ✅ Inspect `<img>` element - should show blurred URL
5. ✅ Open image URL directly - should see pixelated/blurred image
6. ✅ Accept reveal
7. ✅ Check API response - should contain original URLs (no "e_blur")
8. ✅ Verify clear image now visible

### Code Review Checklist
When reviewing PRs that handle user photos:

- [ ] Anonymous profiles use `getBlurredImageUrls()`
- [ ] Revealed profiles send original `photos` array
- [ ] No CSS blur classes (server handles blurring)
- [ ] Proper null/undefined handling with `|| []`
- [ ] Correct reveal status check

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using original photos for anonymous profiles
```typescript
// WRONG - Exposes original URLs
blurredPhotos: user.photos
```
```typescript
// CORRECT
blurredPhotos: getBlurredImageUrls(user.photos || [])
```

### ❌ Mistake 2: Forgetting null safety
```typescript
// WRONG - Will crash if photos is undefined
blurredPhotos: getBlurredImageUrls(user.photos)
```
```typescript
// CORRECT
blurredPhotos: getBlurredImageUrls(user.photos || [])
```

### ❌ Mistake 3: Adding CSS blur in frontend
```typescript
// WRONG - Don't do this, images already blurred from server
<img src={photo} className="blur-lg" />
```
```typescript
// CORRECT - No blur needed
<img src={photo} className="w-full h-full object-cover" />
```

---

## Security Benefits

1. **Cannot be bypassed**: Blur is server-enforced, not CSS-based
2. **DOM inspection safe**: Even viewing image src shows blurred URL
3. **Network tab safe**: API responses contain blurred URLs only
4. **Direct URL safe**: Opening image URL directly shows blurred version
5. **No client processing**: Cloudinary CDN serves pre-blurred images

---

## Performance Notes

- ✅ **Zero overhead**: Transformations happen at CDN level
- ✅ **Cached**: Cloudinary caches both original and blurred versions
- ✅ **Smaller files**: Blurred images are lower quality = faster load
- ✅ **Global CDN**: Low latency worldwide

---

## Questions?

If you're unsure whether to use image transformation:
1. Ask: "Can the user see this profile without reveal?"
2. If YES → Use `getBlurredImageUrls()`
3. If NO → Use original `photos` array

**When in doubt, use the blur function - it's safe even if not strictly necessary.**

---

## Related Files

- Implementation: `server/src/utils/imageTransform.ts`
- Match Controller: `server/src/controllers/matchController.ts`
- Chat Controller: `server/src/controllers/chatController.ts`
- Documentation: `SECURITY_IMAGE_BLUR.md`

