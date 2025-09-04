"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function NewBlogPost() {
  const router = useRouter();

  // --- Form State ---
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  // --- Publish Handler ---
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault(); // stop full page reload
    setLoading(true);

    const { title, slug, excerpt, content } = form;

    // Basic validation
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("posts").insert([
        {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content,
          author: "Dev Team",
          published_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("❌ Insert error:", error);
        toast.error(error.message || "Failed to publish post");
      } else {
        toast.success("✅ Post published!");
        router.push(`/blog/${slug}`);
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Unexpected error while publishing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Blog Post</h1>

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 rounded border bg-gray-800 text-gray-100"
          required
        />

        {/* Slug */}
        <input
          type="text"
          placeholder="Slug (e.g. emergency-fund-savings-tips)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-3 py-2 rounded border bg-gray-800 text-gray-100"
          required
        />

        {/* Excerpt */}
        <input
          type="text"
          placeholder="Excerpt (short preview text)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full px-3 py-2 rounded border bg-gray-800 text-gray-100"
        />

        {/* Content */}
        <textarea
          placeholder="Content (Markdown supported)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full h-60 px-3 py-2 rounded border bg-gray-800 text-gray-100"
          required
        />

        {/* Publish Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 px-4 py-2 rounded hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      <Toaster position="top-right" />
    </main>
  );
}
