import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nft/sdk"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
    };
    return config;
  },
};

export default nextConfig;
