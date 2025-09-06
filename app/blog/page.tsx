// /app/blog/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabasePublic";
import AdminButtons from "./_components/AdminButtons";

export const revalidate = 600;

// --- SEO ---
export const metadata: Metadata = {
  title: "CashDuezy Blog | Subscription & Budgeting Insights",
  description:
    "Actionable guides on emergency funds, subscription tracking, cancellation strategies, and smarter money habits. Written by the CashDuezy Dev Team.",
  keywords: [
    "subscription management",
    "emergency fund",
    "budgeting tips",
    "financial planning",
    "CashDuezy blog",
  ],
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
  content?: string; // optional fallback
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
        "id, title, slug, excerpt, cover_image_url, author, published_at, content"
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

  // JSON-LD structured data for Blog + list of posts
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "CashDuezy Blog",
    url: "https://www.cashduezy.com/blog",
    description:
      "CashDuezy Blog shares expert insights on subscription management, budgeting, emergency funds, and smarter money habits.",
    publisher: {
      "@type": "Organization",
      name: "CashDuezy",
      url: "https://www.cashduezy.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.cashduezy.com/logo.png",
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://www.cashduezy.com/blog/${post.slug}`,
      datePublished: post.published_at,
      author: {
        "@type": "Organization",
        name: post.author || "CashDuezy Dev Team",
        url: "https://www.cashduezy.com/about",
      },
      image: post.cover_image_url
        ? [post.cover_image_url]
        : ["https://www.cashduezy.com/og-default.png"],
      description:
        post.excerpt ||
        (post.content ?? "").slice(0, 160).replace(/\s+\S*$/, ""),
    })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">CashDuezy Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Research-backed articles by the Dev Team. No fluff — just useful.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No published posts yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => {
            const excerpt =
              post.excerpt ||
              (post.content ?? "").slice(0, 160).replace(/\s+\S*$/, "");

            return (
              <li
                key={post.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:shadow-lg"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block"
                  prefetch={false}
                >
                  {post.cover_image_url && (
                    <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl">
                      <Image
                        src={post.cover_image_url}
                        alt={`Cover image for ${post.title} - CashDuezy blog`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  <h2 className="text-xl font-semibold group-hover:text-primary">
                    {post.title}
                  </h2>

                  <div className="mt-1 text-sm text-muted-foreground">
                    By {post.author || "Dev Team"} • {formatDate(post.published_at)}
                  </div>

                  {excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm text-foreground/80">
                      {excerpt}
                    </p>
                  )}

                  <span className="mt-4 inline-block text-sm font-medium text-primary">
                    Read article →
                  </span>
                </Link>

                {/* ▼ Admin-only controls (render nothing for non-admins) */}
                <div className="mt-3">
                  <AdminButtons postId={post.id} slug={post.slug} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
