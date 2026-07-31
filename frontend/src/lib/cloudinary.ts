/** Cloudinary secure URLs encode resource type in the path segment. */
export function isVideoUrl(url: string): boolean {
  return url.includes('/video/upload/');
}

/**
 * Derives a Cloudinary public_id (including folder) from a secure_url, so
 * the previous upload can be deleted without the app having to separately
 * persist publicId anywhere it stores a URL.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  let path = url.slice(idx + marker.length);
  // Strip a leading version segment like "v1785254330/".
  path = path.replace(/^v\d+\//, '');
  // Strip the file extension.
  const lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) path = path.slice(0, lastDot);
  return path || null;
}
