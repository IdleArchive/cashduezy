// /app/sitemap.ts
import { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabasePublic"; // ✅ public client for anon access

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://www.cashduezy.com"
      : "http://localhost:3000";

  // === Static core pages (replaces sitemap-0.xml) ===
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/goodbye`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  // === Dynamic blog posts from Supabase ===
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts, error } = await supabasePublic
      .from("blogs")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (error) {
      console.error("[SITEMAP] Error fetching blog posts:", error.message);
    } else if (posts) {
      blogPages = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "weekly",
        priority: 0.9, // blogs get higher priority for SEO
      }));
    }
  } catch (err) {
    console.error("[SITEMAP] Unexpected error fetching blog posts:", err);
  }

  return [...staticPages, ...blogPages];
}