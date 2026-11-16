import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Required by the Dockerfile: `next build` emits a self-contained server in .next/standalone.
  output: 'standalone',
  // Keep the old static-site URLs working.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/donate.html', destination: '/donate', permanent: true },
      { source: '/donate_items.html', destination: '/donate-items', permanent: true },
      { source: '/volunteer.html', destination: '/volunteer', permanent: true },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
