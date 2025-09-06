// app/[locale]/blog/page.tsx
import type { Metadata } from "next";
import { autoTranslate } from "@/lib/translate";
import ClientBlogList from "./ClientBlogList";

const baseUrl = "https://www.cashduezy.com";

// Map locales → DeepL codes
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

// ✅ Ensure Next.js builds /blog for each locale
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ✅ SEO metadata
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const deeplCode = langMap[locale] || "EN";

  const englishTitle = "Our Blog | CashDuezy";
  const englishDescription =
    "Read the latest insights on subscription management, bill tracking, and personal finance.";

  const title =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? englishTitle
      : await autoTranslate(englishTitle, deeplCode);

  const description =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? englishDescription
      : await autoTranslate(englishDescription, deeplCode);

  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] =
      loc === "en-US" ? `${baseUrl}/blog` : `${baseUrl}/${loc}/blog`;
  });

  return {
    title,
    description,
    alternates: {
      canonical:
        locale === "en-US" ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url: locale === "en-US" ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`,
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

// ✅ Page entrypoint
export default function Page({ params }: { params: { locale: string } }) {
  return <ClientBlogList params={params} />;
}
