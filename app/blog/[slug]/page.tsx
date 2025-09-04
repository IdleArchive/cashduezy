// /app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabasePublic } from "@/lib/supabasePublic"; // ✅ public client
import React from "react";

// Markdown + plugins
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export const revalidate = 600; // ISR: refresh every 10 minutes

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabasePublic
      .from("blogs")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, author, published_at, updated_at, is_published"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("[BLOG] getPost error:", error.message);
      return null;
    }
    return data as Blog | null;
  } catch (e: any) {
    console.error("[BLOG] getPost unexpected error:", e?.message || e);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { data, error } = await supabasePublic
      .from("blogs")
      .select("slug")
      .eq("is_published", true);

    if (error) {
      console.error("[BLOG] generateStaticParams error:", error.message);
      return [];
    }
    return (data ?? []).map((row) => ({ slug: row.slug }));
  } catch (err) {
    console.error("[BLOG] generateStaticParams unexpected error:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return { title: "Article not found | CashDuezy" };
  }

  const title = `${post.title} | CashDuezy Blog`;
  const description =
    post.excerpt ??
    post.content.slice(0, 160) ??
    "Financial insights, subscription management tips, and budgeting strategies from the CashDuezy Dev Team.";
  const canonicalUrl = `https://www.cashduezy.com/blog/${post.slug}`;
  const images = post.cover_image_url
    ? [{ url: post.cover_image_url }]
    : [{ url: "https://www.cashduezy.com/og-default.png" }];

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
    description: post.excerpt || post.content.slice(0, 160),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "CashDuezy Dev Team" },
    publisher: {
      "@type": "Organization",
      name: "CashDuezy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.cashduezy.com/logo.png", // update to your real logo
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
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          By {post.author} • {formatDate(post.published_at)}
        </div>
      </header>

      {post.cover_image_url ? (
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
      ) : null}

      <div className="prose max-w-none prose-headings:scroll-mt-20">
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
