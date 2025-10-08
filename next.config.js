const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Temporarily allow build to continue with type warnings for Vercel
    ignoreBuildErrors: false,
  },

  eslint: {
    // Allow production builds to complete even if there are ESLint warnings
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "www.payfast.co.za", pathname: "/**" },
      { protocol: "https", hostname: "raksms.services", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
    ],
  },

  // Optimize for production builds
  swcMinify: true,

  // Disable problematic features during build
  experimental: {
    // Improve build performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Prevent build from hanging on API routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
};

module.exports = nextConfig;
