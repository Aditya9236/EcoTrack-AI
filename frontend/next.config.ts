import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloud Run: produces a minimal self-contained build
  output: "standalone",
};

export default nextConfig;
