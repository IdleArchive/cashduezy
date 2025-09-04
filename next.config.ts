import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during `next build` on Vercel to avoid Edge runtime issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Good default; keeps React warnings helpful in dev
  reactStrictMode: true,

  // ✅ Redirect old blog admin link to new location
  async redirects() {
    return [
      {
        source: "/dashboard/blog",
        destination: "/blog/new",
        permanent: true, // 308 redirect, SEO-friendly
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
