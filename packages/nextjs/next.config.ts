import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
  }
  config.externals.push("pino-pretty", "lokijs", "encoding", "@react-native-async-storage/async-storage");
  return config;
},
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";
if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = { unoptimized: true };
}

module.exports = nextConfig;