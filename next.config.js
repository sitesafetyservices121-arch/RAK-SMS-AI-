/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ✅ replaces next export
  reactStrictMode: true, // Recommended for highlighting potential problems
  experimental: {
    // serverActions: {
    //   allowedOrigins: ["*.google.com"],
    // },
  },
  // Add allowedDevOrigins to address cross-origin warnings in development
  allowedDevOrigins: ["*.google.com"],
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