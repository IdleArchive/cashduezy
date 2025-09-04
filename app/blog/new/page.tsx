"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const ADMIN_UUID = "777d0c66-4664-4b75-8d1c-0d91cd05b9b6"; // your UUID

export default function NewBlogPost() {
  const router = useRouter();

  // --- Auth state ---
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Auth error or no user:", error?.message);
        router.push("/login");
        return;
      }

      if (user.id !== ADMIN_UUID) {
        console.warn("⚠️ Unauthorized user tried to access blog editor");
        router.push("/login");
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
    };

    checkAuth();
  }, [router]);

  // --- Form State ---
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    cover_image_url: "",
    content: "",
  });
  const [publishing, setPublishing] = useState(false);

  // --- Publish Handler ---
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publishing) return;
    setPublishing(true);

    const { title, slug, excerpt, cover_image_url, content } = form;

    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      setPublishing(false);
      return;
    }

    try {
      // --- Check for duplicate slug ---
      const { data: existing, error: slugError } = await supabase
        .from("blogs")
        .select("id")
        .eq("slug", slug.trim())
        .maybeSingle();

      if (slugError) {
        console.error("Slug check error:", slugError.message);
      }

      if (existing) {
        toast.error("Slug already exists. Please choose another.");
        setPublishing(false);
        return;
      }

      // --- Insert blog post ---
      const { error } = await supabase.from("blogs").insert([
        {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          cover_image_url: cover_image_url.trim() || null,
          content,
          author: "Dev Team",
          is_published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      setPublishing(false);
    }
  };

  // --- UI ---
  if (!authChecked) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-gray-300">Checking authentication...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-red-400">Redirecting to login...</p>
      </main>
    );
  }

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

        {/* Cover Image URL */}
        <input
          type="url"
          placeholder="Cover Image URL (optional)"
          value={form.cover_image_url}
          onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
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
          disabled={publishing}
          className="bg-violet-600 px-4 py-2 rounded hover:bg-violet-500 disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      <Toaster position="top-right" />
    </main>
  );
}
