const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Don’t allow builds to pass if there are type errors
    ignoreBuildErrors: false,
  },

  // This ensures 'firebase-admin' is handled correctly on the server
  serverExternalPackages: ["firebase-admin"],

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
};

module.exports = nextConfig;
