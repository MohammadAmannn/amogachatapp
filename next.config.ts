import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable strict mode to prevent double-renders in development (faster dev experience)
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // maplibre-gl is a browser-only library. Keeping it out of transpilePackages avoids SSR
  // bundling issues and speeds up builds. The map page uses next/dynamic with ssr:false
  // to completely exclude maplibre-gl from the server bundle.
  transpilePackages: [],
  experimental: {},
}

export default nextConfig

