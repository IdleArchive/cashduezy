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
  // === 🌍 i18n for international SEO + currency alignment ===
  i18n: {
    locales: [
      "en-US", // USD ($)
      "en-GB", // GBP (£)
      "en-IN", // INR (₹)
      "en-CA", // CAD ($)
      "en-AU", // AUD ($)
      "fr-FR", // EUR (€)
      "de-DE", // EUR (€)
      "es-ES", // EUR (€)
      "it-IT", // EUR (€)
      "ja-JP", // JPY (¥)
      "zh-CN", // CNY (¥)
      "ko-KR", // KRW (₩)
      "pt-BR", // BRL (R$)
    ],
    defaultLocale: "en-US",
    localeDetection: false, // prevents unwanted auto-redirects (SEO safe)
  },

  // === ⚙️ General config ===
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  poweredByHeader: false,

  // === 🖼 Image optimization rules ===
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
      {
        protocol: "https",
        hostname: "www.cashduezy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cashduezy.com",
        pathname: "/**",
      },
    ],
  },

  // === 🔀 Redirects ===
  async redirects() {
    return [
      {
        source: "/dashboard/blog",
        destination: "/blog/new",
        permanent: true,
      },
      {
        source: "/dashboard/profile",
        destination: "/dashboard/account",
        permanent: true,
      },
    ];
  },

  // === 📑 Headers (SEO & crawlers) ===
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
      {
        source: "/sitemap-:index.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
      {
        source: "/rss.xml",
        headers: [
          { key: "Content-Type", value: "application/rss+xml; charset=utf-8" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
