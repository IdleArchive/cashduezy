// app/sitemap.ts
import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // rebuild sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://www.cashduezy.com"
      : "http://localhost:3000");

  const now = new Date();

  // --- Locales from next.config.ts ---
  const locales = [
    "en-US", // default
    "en-GB",
    "en-IN",
    "en-CA",
    "en-AU",
    "fr-FR",
    "de-DE",
    "es-ES",
    "it-IT",
    "ja-JP",
    "zh-CN",
    "ko-KR",
    "pt-BR",
  ];

  // --- Core static pages ---
  const corePaths = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/login", changeFrequency: "monthly", priority: 0.5 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { path: "/goodbye", changeFrequency: "monthly", priority: 0.5 },
    { path: "/changelog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/support", changeFrequency: "monthly", priority: 0.6 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  // Generate localized versions of static pages
  corePaths.forEach((page) => {
    locales.forEach((locale) => {
      const isDefault = locale === "en-US";

      // root path `/` → `/` (default) or `/fr-FR`
      // everything else → `/faq` (default) or `/fr-FR/faq`
      const localizedPath =
        page.path === "/"
          ? isDefault
            ? "/"
            : `/${locale}`
          : isDefault
          ? page.path
          : `/${locale}${page.path}`;

      staticPages.push({
        url: `${baseUrl}${localizedPath}`,
        lastModified: now,
        changeFrequency: page.changeFrequency as any,
        priority: page.priority,
      });
    });
  });

  // --- Blog posts from Supabase ---
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const nowIso = new Date().toISOString();

      const { data: posts, error } = await supabase
        .from("blogs")
        .select("slug, updated_at, published_at")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .lte("published_at", nowIso)
        .order("published_at", { ascending: false });

      if (!error && posts?.length) {
        blogPages = posts
          .filter((p: any) => new Date(p.published_at) <= new Date())
          .flatMap((p: any) => {
            const lastMod = p.updated_at || p.published_at || nowIso;
            const publishedDate = new Date(p.published_at);
            const ageInDays =
              (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

            let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" =
              "weekly";
            if (ageInDays <= 7) changeFrequency = "daily";
            else if (ageInDays <= 30) changeFrequency = "weekly";
            else if (ageInDays <= 365) changeFrequency = "monthly";
            else changeFrequency = "yearly";

            return locales.map((locale) => {
              const isDefault = locale === "en-US";
              const localizedPath = isDefault
                ? `/blog/${p.slug}`
                : `/${locale}/blog/${p.slug}`;

              return {
                url: `${baseUrl}${localizedPath}`,
                lastModified: new Date(lastMod),
                changeFrequency,
                priority: 0.9,
              };
            });
          });

        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[SITEMAP] Added ${blogPages.length} localized blog entries`
          );
        }
      }
    }
  } catch (err) {
    console.error("[SITEMAP] blog fetch error:", err);
  }

  return [...staticPages, ...blogPages];
}
