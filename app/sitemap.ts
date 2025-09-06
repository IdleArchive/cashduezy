// /app/sitemap.ts
import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // Rebuild sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://www.cashduezy.com"
      : "http://localhost:3000");

  const now = new Date();

  // --- Static pages ---
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/goodbye`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rss.xml`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  // --- Blog posts ---
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
        .lte("published_at", nowIso) // ✅ only include posts already published
        .order("published_at", { ascending: false });

      if (!error && posts?.length) {
        blogPages = posts
          // ✅ filter out any future-dated posts just in case
          .filter((p: any) => new Date(p.published_at) <= new Date())
          .map((p: any) => {
            const lastMod = p.updated_at || p.published_at || nowIso;

            // Dynamically set crawl frequency based on age
            const publishedDate = new Date(p.published_at);
            const ageInDays =
              (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

            let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "weekly";
            if (ageInDays <= 7) changeFrequency = "daily"; // fresh posts
            else if (ageInDays <= 30) changeFrequency = "weekly"; // recent posts
            else if (ageInDays <= 365) changeFrequency = "monthly"; // older posts
            else changeFrequency = "yearly"; // archive

            return {
              url: `${baseUrl}/blog/${p.slug}`,
              lastModified: new Date(lastMod),
              changeFrequency,
              priority: 0.9,
            };
          });

        // ✅ Debug logging only in non-production environments
        if (process.env.NODE_ENV !== "production") {
          console.log(`[SITEMAP] Added ${blogPages.length} blog posts to sitemap`);
        }
      }
    }
  } catch (err) {
    console.error("[SITEMAP] blog fetch error:", err);
  }

  return [...staticPages, ...blogPages];
}
