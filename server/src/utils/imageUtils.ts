/**
 * Utility functions for handling product images
 */

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=Product+Image'

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)
    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }

    // Check for common image extensions or data URLs
    const pathname = urlObj.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    return imageExtensions.some((ext) => pathname.endsWith(ext)) || pathname === '/'
  } catch {
    return false
  }
}

/**
 * Normalize image URLs - ensure they're valid and use HTTPS
 */
export function normalizeImageUrl(url: string): string {
  if (!url) {
    return PLACEHOLDER_IMAGE
  }

  try {
    // Convert http to https for security
    let normalizedUrl = url.replace(/^http:\/\//i, 'https://')

    // Ensure it's a valid URL
    if (!isValidImageUrl(normalizedUrl)) {
      return PLACEHOLDER_IMAGE
    }

    return normalizedUrl
  } catch {
    return PLACEHOLDER_IMAGE
  }
}

/**
 * Normalize an array of image URLs
 */
export function normalizeImageUrls(urls: string[]): string[] {
  if (!Array.isArray(urls) || urls.length === 0) {
    return [PLACEHOLDER_IMAGE]
  }

  return urls
    .filter((url) => typeof url === 'string' && url.trim().length > 0)
    .map((url) => normalizeImageUrl(url.trim()))
    .filter((url) => url !== PLACEHOLDER_IMAGE || urls.length === 0)
    .slice(0, 5) // Limit to 5 images per product
}

/**
 * Add placeholder image if product has no valid images
 */
export function ensureValidImages(images: string[]): string[] {
  const normalized = normalizeImageUrls(images)
  return normalized.length > 0 ? normalized : [PLACEHOLDER_IMAGE]
}
