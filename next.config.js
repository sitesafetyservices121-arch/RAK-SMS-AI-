const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Don’t allow builds to pass if there are type errors
    ignoreBuildErrors: false,
  },
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "www.payfast.co.za", pathname: "/**" },
      { protocol: "https", hostname: "raksms.services", pathname: "/**" },
    ],
  },

  experimental: {
    // Allow cross-origin fetching in development for Firebase Studio
    allowedDevOrigins: [
      "https://6000-firebase-studio-1759140212143.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    ],
  },
};

module.exports = nextConfig;
