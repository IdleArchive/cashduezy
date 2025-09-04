import { supabasePublic } from "@/lib/supabasePublic";

export async function GET() {
  const { data, error } = await supabasePublic
    .from("blogs")
    .select("title, slug, excerpt, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return new Response("Error generating feed", { status: 500 });
  }

  const siteUrl = "https://www.cashduezy.com";
  const feedItems = data
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>
  `
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>CashDuezy Blog</title>
      <link>${siteUrl}/blog</link>
      <description>Actionable guides on subscription tracking, cancellation, budgeting, and fintech.</description>
      <language>en-us</language>
      ${feedItems}
    </channel>
  </rss>`;

  return new Response(rss, {
    status: 200,
    headers: { "Content-Type": "application/rss+xml" },
  });
}
