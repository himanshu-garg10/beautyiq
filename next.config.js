/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/comparison",
        has: [{ type: "header", key: "accept", value: ".*application/json.*" }],
        destination: "/api/comparison",
      },
      {
        source: "/comparison/history",
        has: [{ type: "header", key: "accept", value: ".*application/json.*" }],
        destination: "/api/comparison/history",
      },
    ];
  },
};

module.exports = nextConfig;

