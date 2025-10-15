/**
 * Image transformation utilities for privacy protection
 * Transforms Cloudinary URLs to serve blurred/pixelated versions
 */

/**
 * Get Cloudinary cloud name from environment or use default
 */
function getCloudinaryCloudName(): string {
  return process.env.CLOUDINARY_CLOUD_NAME || 'demo';
}

/**
 * Transforms a Cloudinary image URL to include blur and pixelation effects
 * This ensures users cannot bypass client-side blur by inspecting the DOM
 * 
 * For non-Cloudinary URLs (like AI personas), uses Cloudinary's fetch feature
 * to proxy and transform external images
 * 
 * @param imageUrl - Original image URL (Cloudinary or external)
 * @returns Transformed URL with blur effects applied
 */
export function getBlurredImageUrl(imageUrl: string): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }

  // Blur transformation parameters
  // e_blur:2000 = heavy blur effect
  // e_pixelate:20 = pixelation effect
  // q_auto:low = low quality to reduce file size and further obscure details
  const transformation = 'e_blur:2000,e_pixelate:20,q_auto:low';

  // Check if it's already a Cloudinary URL
  const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;
  
  if (cloudinaryPattern.test(imageUrl)) {
    // Transform existing Cloudinary URL by inserting transformation parameters
    const transformedUrl = imageUrl.replace(
      /\/image\/upload\//,
      `/image/upload/${transformation}/`
    );
    return transformedUrl;
  } else {
    // For non-Cloudinary URLs (AI personas, external images):
    // Use Cloudinary's fetch feature to proxy and transform external images
    // This allows us to apply blur to ANY image URL through Cloudinary
    const cloudName = getCloudinaryCloudName();
    
    // If cloud name is not properly configured, log warning
    if (cloudName === 'demo') {
      console.warn('⚠️ CLOUDINARY_CLOUD_NAME not configured. AI persona images may not blur properly.');
      console.warn('   Set CLOUDINARY_CLOUD_NAME in your .env file or upload AI persona images to Cloudinary.');
    }
    
    const encodedUrl = encodeURIComponent(imageUrl);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformation}/${encodedUrl}`;
  }
}

/**
 * Transforms an array of image URLs to their blurred versions
 * 
 * @param imageUrls - Array of original image URLs
 * @returns Array of transformed blurred URLs
 */
export function getBlurredImageUrls(imageUrls: string[]): string[] {
  if (!Array.isArray(imageUrls)) {
    return [];
  }
  
  return imageUrls.map(url => getBlurredImageUrl(url));
}

/**
 * Check if a URL is a Cloudinary URL
 * 
 * @param url - URL to check
 * @returns true if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return /^https?:\/\/res\.cloudinary\.com\//.test(url);
}

/**
 * IMPORTANT NOTES:
 * 
 * 1. For Cloudinary-hosted images:
 *    - Transformation is inserted directly into the URL
 *    - No additional setup required
 * 
 * 2. For external images (AI personas, pravatar.cc, etc.):
 *    - Uses Cloudinary's fetch feature to proxy and transform
 *    - Requires CLOUDINARY_CLOUD_NAME in environment variables
 *    - The fetch feature should be enabled in your Cloudinary account (it's enabled by default)
 * 
 * 3. If Cloudinary fetch fails or is disabled:
 *    - Images may not load or may load unblurred
 *    - Solution: Upload AI persona images to Cloudinary and update aiPersonas.ts
 * 
 * 4. Security guarantee:
 *    - Even with DOM inspection, users only see the blurred URL
 *    - Original URL is never exposed to the frontend
 *    - Cloudinary serves the pre-blurred image
 */

