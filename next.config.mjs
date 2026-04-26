/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all pages
        source: '/(.*)',
        headers: [
          // Block the page from being embedded in iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Block MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak referrer info
          { key: 'Referrer-Policy', value: 'strict-origin' },
          // Disable screen capture, clipboard, and camera APIs via browser policy
          {
            key: 'Permissions-Policy',
            value: 'display-capture=(), clipboard-read=(), camera=(), microphone=()',
          },
        ],
      },
      {
        // Strict no-cache for the signed video URL API
        source: '/video/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]
  },
}

export default nextConfig;
