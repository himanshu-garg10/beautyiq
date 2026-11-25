/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // ── Build memory reduction for Render free-tier (512 MB) ──────────────────
  productionBrowserSourceMaps: false,
  // Skip ESLint and TypeScript checks during build (run them locally instead)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "bcryptjs"],
    // Run only 1 worker so the build doesn't exhaust RAM on small hosts
    cpus: 1,
    workerThreads: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const ignored = [
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        "**/Untitled/**",
        path.join(__dirname, "Untitled"),
      ];
      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored,
        poll: 1000,
      };
    }
    return config;
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
            value: "camera=(self), microphone=(), geolocation=()",
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

