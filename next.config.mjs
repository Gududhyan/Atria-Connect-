import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the trace root to this folder; a stray lockfile in the parent directory
  // otherwise makes Next infer the wrong workspace root.
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
}

export default nextConfig
