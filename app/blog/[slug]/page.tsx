// /app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { supabasePublic } from "@/lib/supabasePublic";

// Markdown + plugins
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// Always render fresh so edits/publishes show immediately in prod
export const dynamic = "force-dynamic";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
  updated_at: string;
  is_published: boolean;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string): Promise<Blog | null> {
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabasePublic
      .from("blogs")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, author, published_at, updated_at, is_published"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .maybeSingle();

    if (error) {
      console.error("[BLOG] getPost error:", error.message);
      return null;
    }
    return (data as Blog) ?? null;
  } catch (e: any) {
    console.error("[BLOG] getPost unexpected error:", e?.message || e);
    return null;
  }
}

// We keep this light-weight fetch for metadata only
async function getPostForMeta(slug: string) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabasePublic
    .from("blogs")
    .select("title, excerpt, cover_image_url, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .maybeSingle();

  if (error) {
    console.error("[BLOG] meta fetch error:", error.message);
    return null;
  }
  return data as { title: string; excerpt: string | null; cover_image_url: string | null; slug: string } | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostForMeta(params.slug);
  if (!post) {
    return { title: "Article not found | CashDuezy" };
  }

  const title = `${post.title} | CashDuezy Blog`;
  const description =
    post.excerpt ??
    "Financial insights, subscription management tips, and budgeting strategies from the CashDuezy Dev Team.";
  const canonicalUrl = `https://www.cashduezy.com/blog/${params.slug}`;
  const images = post.cover_image_url
    ? [post.cover_image_url]
    : ["https://www.cashduezy.com/og-default.png"];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      images,
    },
  twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  // JSON-LD schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || (post.content ?? "").slice(0, 160),
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { "@type": "Organization", name: "CashDuezy Dev Team" },
    publisher: {
      "@type": "Organization",
      name: "CashDuezy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.cashduezy.com/logo.png",
      },
    },
    image: post.cover_image_url
      ? [post.cover_image_url]
      : ["https://www.cashduezy.com/og-default.png"],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.cashduezy.com/blog/${post.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link
          href="/blog"
          prefetch={false}
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          By {post.author || "Dev Team"} • {formatDate(post.published_at)}
        </div>
      </header>

      {post.cover_image_url && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <div className="prose prose-invert max-w-none prose-headings:scroll-mt-20">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="mt-8 scroll-m-20" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="mt-8 scroll-m-20" {...props} />
            ),
            img: ({ node, ...props }) => (
              <img {...props} className="my-4 rounded-lg" />
            ),
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-primary underline-offset-2 hover:underline"
              />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        Last updated {formatDate(post.updated_at)}
      </footer>
    </article>
  );
}
