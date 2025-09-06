// app/metadata.tsx
import type { Metadata } from "next";

// Base site URL (update if you use env vars)
const baseUrl = "https://www.cashduezy.com";

// All supported locales from next.config.ts
const locales = [
  "en-US", // USD
  "en-GB", // GBP
  "en-IN", // INR
  "en-CA", // CAD
  "en-AU", // AUD
  "fr-FR", // EUR
  "de-DE", // EUR
  "es-ES", // EUR
  "it-IT", // EUR
  "ja-JP", // JPY
  "zh-CN", // CNY
  "ko-KR", // KRW
  "pt-BR", // BRL
];

// Generate alternate links for hreflang
const buildAlternates = () => {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] =
      locale === "en-US"
        ? `${baseUrl}/` // default root for English US
        : `${baseUrl}/${locale}`;
  });
  return languages;
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "CashDuezy – Track Bills & Subscriptions Automatically",
  description:
    "CashDuezy helps you manage subscriptions, cancel unwanted bills, and stay on top of your finances — wherever you are in the world.",
  alternates: {
    canonical: baseUrl,
    languages: buildAlternates(),
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "CashDuezy",
    title: "CashDuezy – Track Bills & Subscriptions Automatically",
    description:
      "Manage subscriptions and bills with ease. Global support for multiple currencies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CashDuezy – Track Bills & Subscriptions",
    description: "Automated subscription & bill tracking across currencies.",
  },
};
