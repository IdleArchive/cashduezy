import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during `next build` on Vercel to avoid Edge runtime issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Good default; keeps React warnings helpful in dev
  reactStrictMode: true,

  // ✅ Redirects
  async redirects() {
    return [
      {
        source: "/dashboard/blog",
        destination: "/blog/new",
        permanent: true, // 308 redirect, SEO-friendly
      },
      {
        source: "/dashboard/profile",
        destination: "/dashboard/account",
        permanent: true, // 308 redirect, safe rename for account page
      },
    ];
  },

  // ✅ Force correct Content-Type for sitemap.xml
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
