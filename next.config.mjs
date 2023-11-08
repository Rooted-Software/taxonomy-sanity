/** @type {import('next').NextConfig} */
// import { withContentlayer } from "next-contentlayer"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @TODO turn swcMinify back on once the agressive dead code elimination bug that casues
  // `ReferenceError: FieldPresenceWithOverlay is not defined` is fixed
  swcMinify: false,
  //setting to false to enable draggable
  reactStrictMode: false,
  images: {
    domains: ['avatars.githubusercontent.com'],
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'source.unsplash.com' },
    ],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
  compiler: {
    styledComponents: true,
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },
}

export default nextConfig
