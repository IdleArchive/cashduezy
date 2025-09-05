// /app/blog/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabasePublic";

// --- SEO ---
export const metadata: Metadata = {
  title: "CashDuezy Blog | Subscription & Budgeting Insights",
  description:
    "Actionable guides on emergency funds, subscription tracking, cancellation strategies, and smarter money habits. Written by the CashDuezy Dev Team.",
  alternates: { canonical: "https://www.cashduezy.com/blog" },
  openGraph: {
    type: "website",
    url: "https://www.cashduezy.com/blog",
    title: "CashDuezy Blog | Subscription & Budgeting Insights",
    description:
      "Explore expert tips on subscription management, budgeting, and financial wellness from the CashDuezy Dev Team.",
    images: [
      {
        url: "https://www.cashduezy.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "CashDuezy Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CashDuezy Blog | Subscription & Budgeting Insights",
    description:
      "Actionable guides on subscription tracking, cancellation, budgeting, and fintech. Written by the CashDuezy Dev Team.",
    images: ["https://www.cashduezy.com/og-default.png"],
  },
};

// --- Disable caching so new posts appear immediately in prod ---
export const dynamic = "force-dynamic";

type BlogListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  published_at: string; // ISO
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPosts(): Promise<BlogListItem[]> {
  try {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabasePublic
      .from("blogs")
      .select(
        "id, title, slug, excerpt, cover_image_url, author, published_at"
      )
      .eq("is_published", true)
      .not("published_at", "is", null) // exclude drafts missing a publish date
      .lte("published_at", nowIso) // only show posts that are live
      .order("published_at", { ascending: false });

    if (error) {
      console.error("[BLOG] list error:", error.message);
      return [];
    }
    return (data ?? []) as BlogListItem[];
  } catch (err: any) {
    console.error("[BLOG] unexpected list error:", err?.message ?? err);
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">CashDuezy Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Research-backed articles by the Dev Team. No fluff—just useful.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No published posts yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:shadow-lg"
            >
              <Link href={`/blog/${post.slug}`} className="block" prefetch={false}>
                {post.cover_image_url && (
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                    />
                  </div>
                )}

                <h2 className="text-xl font-semibold group-hover:text-primary">
                  {post.title}
                </h2>

                <div className="mt-1 text-sm text-muted-foreground">
                  By {post.author || "Dev Team"} • {formatDate(post.published_at)}
                </div>

                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm text-foreground/80">
                    {post.excerpt}
                  </p>
                )}

                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  Read article →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
