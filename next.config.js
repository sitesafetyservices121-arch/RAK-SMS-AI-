
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests
    // from the Firebase Studio development environment.
    allowedDevOrigins: [
      "*.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    ],
  },
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
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

      {
        protocol: "https",
        hostname: "raksms.services",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "firebase-admin": false,
      };
    }
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
    };
    return config;
  },
};

module.exports = nextConfig;
