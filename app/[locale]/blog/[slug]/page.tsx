// app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { autoTranslate } from "@/lib/translate";
import ClientPost from "./ClientPost";

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

// ✅ Pre-generate blog slugs for all locales
export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("slug")
    .eq("is_published", true);

  if (error || !posts) return [];

  // Build { locale, slug } combinations for every post
  return locales.flatMap((locale) =>
    posts.map((post: { slug: string }) => ({
      locale,
      slug: post.slug,
    }))
  );
}

// ✅ Server-side SEO metadata
export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const deeplCode = langMap[locale] || "EN";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("blogs")
    .select("title, excerpt, published_at, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    // ✅ Return safe fallback metadata if post missing
    return {
      title: "CashDuezy Blog",
      description: "Insights on subscriptions, bills, and personal finance.",
    };
  }

  const title =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? post.title
      : await autoTranslate(post.title, deeplCode);

  const description =
    deeplCode === "EN" || deeplCode === "EN-GB"
      ? post.excerpt || ""
      : post.excerpt
      ? await autoTranslate(post.excerpt, deeplCode)
      : "";

  // hreflang alternates
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] =
      loc === "en-US"
        ? `${baseUrl}/blog/${slug}`
        : `${baseUrl}/${loc}/blog/${slug}`;
  });

  return {
    title,
    description,
    alternates: {
      canonical:
        locale === "en-US"
          ? `${baseUrl}/blog/${slug}`
          : `${baseUrl}/${locale}/blog/${slug}`,
      languages: alternates,
    },
    openGraph: {
      type: "article",
      url:
        locale === "en-US"
          ? `${baseUrl}/blog/${slug}`
          : `${baseUrl}/${locale}/blog/${slug}`,
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

// ✅ Page entrypoint with fallback
export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("blogs")
    .select("id")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    notFound(); // ✅ Proper Next.js 404
  }

  return <ClientPost params={params} />;
}
