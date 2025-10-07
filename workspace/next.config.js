
import { resolve } from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Ensures TypeScript build errors block the build (change to true to ignore)
    ignoreBuildErrors: false,
  },

  eslint: {
    // Ensures ESLint errors block builds (set true to skip during build)
    ignoreDuringBuilds: false,
  },

  experimental: {
    // Allows Next.js dev server access from Firebase Studio
    allowedDevOrigins: [
      "*.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
      "9000-firebase-studio-1759140212143.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    ],
  },

  // Ensures Firebase Admin is treated as external during server build
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
    // Prevent firebase-admin from being bundled on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "firebase-admin": false,
      };
    }

    // Set up path alias
    config.resolve.alias["@"] = resolve(__dirname, "src");

    // Add WebAssembly async support
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add Node.js polyfills for browser builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
    };

    return config;
  },
};

export default nextConfig;
