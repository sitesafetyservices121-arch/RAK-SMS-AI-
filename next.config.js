/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for highlighting potential problems
  experimental: {
    serverActions: {
      allowedOrigins: ["*.google.com"],
    },
  },
  typescript: {
    // ❗ Better to keep strict in production; set to false only if CI/type-checking handled separately
    ignoreBuildErrors: false,
  },
  eslint: {
    // ❗ Same here: disable only if linting is handled outside build
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.payfast.co.za",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
