import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.196.105.228"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
