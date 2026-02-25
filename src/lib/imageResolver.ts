/**
 * Image Resolver Utility
 * 
 * In development, Vite serves `/src/assets/...` paths directly.
 * In production builds, assets get hashed filenames and `/src/assets/...` URLs break.
 * 
 * This utility maps database-stored paths like `/src/assets/product-lamp.jpg`
 * to the actual bundled asset imports so images work in both dev and production.
 */

// Eagerly import all asset images using Vite's glob import
const assetModules = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp,svg,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

/**
 * Resolves a database image URL to a production-safe URL.
 * 
 * - `/src/assets/product-lamp.jpg` → bundled asset URL
 * - `https://...` → passed through unchanged
 * - `/placeholder.svg` → passed through unchanged
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg';
  
  // If it's a /src/assets/ path, resolve via the glob import map
  if (url.startsWith('/src/assets/') || url.startsWith('src/assets/')) {
    const key = url.startsWith('/') ? url : `/${url}`;
    const resolved = assetModules[key];
    if (resolved) return resolved;
    // Fallback: return original (works in dev)
    return url;
  }
  
  // External URLs, public folder paths, etc. — pass through
  return url;
}
