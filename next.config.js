const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Don’t allow builds to pass if there are type errors
    ignoreBuildErrors: false,
  },

  eslint: {
    // Run ESLint during builds
    ignoreDuringBuilds: false,
  },

  // Removed invalid 'allowedDevOrigins' key from 'experimental'
  experimental: {},

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

  webpack: (config, { isServer }) => {
    // Prevent firebase-admin from being bundled client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "firebase-admin": false,
      };
    }

    // Add @ alias to the src directory
    config.resolve.alias["@"] = path.resolve(__dirname, "src");

    // Support WebAssembly (WASM)
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Polyfills for Node modules in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
    };

    return config;
  },
};

module.exports = nextConfig;

