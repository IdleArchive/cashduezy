// /app/sitemap.ts
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
        blogPages = posts.map((p: any) => ({
          url: `${baseUrl}/blog/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.9,
        }));
      }
    }
  } catch (err) {
    console.error("[SITEMAP] blog fetch error:", err);
  }

  return [...staticPages, ...blogPages];
}
