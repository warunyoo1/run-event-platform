import type { NextConfig } from "next";
const config: NextConfig = {
  agentRules: false,
  output: "standalone",
  async rewrites() {
    const target = (process.env.API_PROXY_TARGET || "http://localhost:4000").replace(/\/+$/, "");
    return [{ source: "/api/v1/public/:path*", destination: `${target}/api/v1/public/:path*` }];
  },
  turbopack: { root: process.cwd() },
};
export default config;
