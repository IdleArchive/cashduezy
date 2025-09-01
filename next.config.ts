import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during `next build` on Vercel to avoid Edge runtime issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Good default; keeps React warnings helpful in dev
  reactStrictMode: true,

  // If you later load remote images, add domains here:
  // images: {
  //   domains: ["images.unsplash.com", "your-cdn.com"],
  // },

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