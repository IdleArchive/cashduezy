"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { autoTranslate } from "@/lib/translate";

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

// --- Translation keys for UI ---
type TranslationKeys = {
  blogTitle: string;
  blogIntro: string;
  readMore: string;
};

const englishStrings: TranslationKeys = {
  blogTitle: "Our Blog",
  blogIntro:
    "Read the latest insights on subscription management, bill tracking, and personal finance.",
  readMore: "Read more",
};

// --- Blog type from Supabase ---
type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  published_at: string;
};

export default function ClientBlogList({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const deeplCode = langMap[locale] || "EN";

  const [translated, setTranslated] = useState<TranslationKeys>(englishStrings);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Translate UI strings
  useEffect(() => {
    async function translateAll() {
      if (deeplCode === "EN" || deeplCode === "EN-GB") {
        setTranslated(englishStrings);
        return;
      }

      const translatedEntries = await Promise.all(
        Object.entries(englishStrings).map(async ([key, value]) => {
          const t = await autoTranslate(value, deeplCode);
          return [key, t] as [string, string];
        })
      );

      setTranslated(Object.fromEntries(translatedEntries) as TranslationKeys);
    }

    translateAll();
  }, [deeplCode]);

  // Fetch blog posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, slug, excerpt, cover_image_url, author, published_at")
          .eq("is_published", true)
          .not("published_at", "is", null)
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("[BLOG] fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <main className="px-6 py-12 max-w-5xl mx-auto">
      {/* Page Heading */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
        {translated.blogTitle}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-12 text-center">
        {translated.blogIntro}
      </p>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts available yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="p-6 border rounded-2xl shadow bg-white"
            >
              {post.cover_image_url && (
                <div className="mb-4 relative w-full h-48">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt || ""}</p>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="text-blue-600 font-medium hover:underline"
              >
                {translated.readMore} →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
