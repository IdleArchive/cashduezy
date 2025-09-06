"use client";

import { useEffect, useState } from "react";
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

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
};

export default function ClientPost({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const deeplCode = langMap[locale] || "EN";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [translated, setTranslated] = useState<Partial<BlogPost>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data } = await supabase
          .from("blogs")
          .select("id, title, slug, excerpt, content, cover_image_url, author, published_at")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        setPost(data);
      } catch (err) {
        console.error("[BLOG] fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  useEffect(() => {
    async function translatePost() {
      if (!post) return;
      if (deeplCode === "EN" || deeplCode === "EN-GB") {
        setTranslated(post);
        return;
      }

      const [title, excerpt, content] = await Promise.all([
        autoTranslate(post.title, deeplCode),
        post.excerpt ? autoTranslate(post.excerpt, deeplCode) : null,
        autoTranslate(post.content, deeplCode),
      ]);

      setTranslated({
        ...post,
        title,
        excerpt: excerpt || null,
        content,
      });
    }

    translatePost();
  }, [post, deeplCode]);

  if (loading) {
    return <p className="text-center text-gray-500 py-12">Loading...</p>;
  }

  if (!post) {
    return <p className="text-center text-gray-500 py-12">Post not found.</p>;
  }

  return (
    <main className="px-6 py-12 max-w-3xl mx-auto">
      {post.cover_image_url && (
        <div className="mb-6">
          <img
            src={post.cover_image_url}
            alt={translated.title || post.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        {translated.title || post.title}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        By {post.author} •{" "}
        {new Date(post.published_at).toLocaleDateString(locale, {
          dateStyle: "long",
        })}
      </p>
      {translated.excerpt && (
        <p className="italic text-gray-600 mb-8">{translated.excerpt}</p>
      )}
      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{
          __html: translated.content || post.content,
        }}
      />
    </main>
  );
}
