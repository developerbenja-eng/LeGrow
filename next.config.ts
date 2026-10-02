import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The /pozo guide is embedded as live pages inside LeNotes; nothing else may frame it.
        source: "/pozo/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://lenotes.ledesign.ai http://localhost:3110",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
