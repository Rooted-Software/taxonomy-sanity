/** @type {import('next').NextConfig} */
const webpack = import("webpack");
// import { withContentlayer } from "next-contentlayer"
import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  fallbacks: {
    image: "/static/images/fallback.png",
    document: '~offline',  // if you want to fallback to another page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
    webpack5: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false };
        return config;
    },
  // @TODO turn swcMinify back on once the agressive dead code elimination bug that casues
  // `ReferenceError: FieldPresenceWithOverlay is not defined` is fixed
  swcMinify: false,
    //setting to false to enable draggable

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
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
}

export default withPWA(nextConfig);
