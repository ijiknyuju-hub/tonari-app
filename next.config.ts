import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow real-device testing over LAN in dev (Next 16 blocks cross-origin /_next/* by default)
  allowedDevOrigins: ["10.196.105.228"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
