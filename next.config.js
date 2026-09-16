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
      {
        source: "/wishlist",
        has: [{ type: "header", key: "accept", value: ".*application/json.*" }],
        destination: "/api/wishlist",
      },
      {
        source: "/notifications",
        has: [{ type: "header", key: "accept", value: ".*application/json.*" }],
        destination: "/api/notifications",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

