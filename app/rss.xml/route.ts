import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { autoTranslate } from "@/lib/translate";

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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cashduezy.com";

// ✅ RSS handler
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en-US";
  const deeplCode = langMap[locale] || "EN";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch published blog posts
  const { data: posts, error } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, published_at")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[RSS] Error fetching blogs:", error);
    return new NextResponse("Feed unavailable", { status: 500 });
  }

  // Build feed items
  const items = await Promise.all(
    (posts || []).map(async (post) => {
      let title = post.title;
      let description = post.excerpt || "";

      if (deeplCode !== "EN" && deeplCode !== "EN-GB") {
        title = await autoTranslate(post.title, deeplCode);
        if (description) {
          description = await autoTranslate(description, deeplCode);
        }
      }

      return `
        <item>
          <title><![CDATA[${title}]]></title>
          <link>${baseUrl}/${locale}/blog/${post.slug}</link>
          <guid isPermaLink="true">${baseUrl}/${locale}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
          <description><![CDATA[${description}]]></description>
        </item>
      `;
    })
  );

  // Build RSS XML
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>CashDuezy Blog</title>
      <link>${baseUrl}</link>
      <description>Insights on subscriptions, bills, and personal finance.</description>
      <language>${locale}</language>
      ${items.join("\n")}
    </channel>
  </rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
