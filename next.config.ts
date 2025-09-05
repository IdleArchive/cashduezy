// next.config.ts
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost: string | undefined;
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
} catch {
  supabaseHost = undefined;
}

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https",
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            } as const,
          ]
        : []),
      { protocol: "https", hostname: "www.cashduezy.com", pathname: "/**" },
      { protocol: "https", hostname: "cashduezy.com", pathname: "/**" },
    ],
  },

  async redirects() {
    return [
      { source: "/dashboard/blog", destination: "/blog/new", permanent: true },
      { source: "/dashboard/profile", destination: "/dashboard/account", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [{ key: "Content-Type", value: "application/xml" }],
      },
      {
        source: "/sitemap-:index.xml",
        headers: [{ key: "Content-Type", value: "application/xml" }],
      },
      {
        source: "/rss.xml",
        headers: [{ key: "Content-Type", value: "application/rss+xml; charset=utf-8" }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
