// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from "react";
import { autoTranslate } from "@/lib/translate";

const baseUrl = "https://www.cashduezy.com";

// Map Next.js locales → DeepL codes
const langMap: Record<string, string> = {
  "en-US": "EN",
  "en-GB": "EN-GB",
  "fr-FR": "FR",
  "de-DE": "DE",
  "es-ES": "ES",
  "it-IT": "IT",
  "ja-JP": "JA",
  "zh-CN": "ZH",
  "pt-BR": "PT-BR",
  "ko-KR": "KO",
  "en-IN": "EN",
  "en-CA": "EN",
  "en-AU": "EN",
};

const locales = Object.keys(langMap);

type LayoutProps = {
  children: ReactNode;
};

// ✅ Layout wrapper (no params here!)
export default function LocaleLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

// ✅ Pre-generate all locales to prevent 404s
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ✅ Metadata per locale (params *is* allowed here)
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const currentLocale = locales.includes(locale) ? locale : "en-US";
  const deeplCode = langMap[currentLocale] || "EN";

  // English source text
  const englishTitle = "CashDuezy – Track Bills & Subscriptions Automatically";
  const englishDescription =
    "CashDuezy helps you manage subscriptions, cancel unwanted bills, and stay on top of your finances — wherever you are in the world.";

  // Auto-translate title/description
  const title =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? englishTitle
      : await autoTranslate(englishTitle, deeplCode);

  const description =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? englishDescription
      : await autoTranslate(englishDescription, deeplCode);

  // hreflang alternates
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = loc === "en-US" ? `${baseUrl}/` : `${baseUrl}/${loc}`;
  });

  return {
    title,
    description,
    alternates: {
      canonical:
        currentLocale === "en-US" ? baseUrl : `${baseUrl}/${currentLocale}`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url:
        currentLocale === "en-US" ? baseUrl : `${baseUrl}/${currentLocale}`,
      siteName: "CashDuezy",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
