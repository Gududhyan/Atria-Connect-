import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const securityHeaders = [
  // SAMEORIGIN (not DENY) so the document preview can still iframe same-origin dev uploads.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the trace root to this folder; a stray lockfile in the parent directory
  // otherwise makes Next infer the wrong workspace root.
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  poweredByHeader: false,
  // next/image isn't used, so the optimizer gets no remote hosts; a `**` wildcard
  // turned it into an open image proxy for any URL on the internet.
  images: { remotePatterns: [] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  }
}

export default nextConfig
