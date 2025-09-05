"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewBlogPost() {
  const router = useRouter();

  // --- Auth/Admin gate ---
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async (retry = false) => {
      const { data, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error) {
        console.error("Auth error:", error);
        router.push("/login");
        return;
      }

      const user = data.user;
      if (!user) {
        if (!retry) setTimeout(() => checkAuth(true), 500);
        return;
      }

      // 1) DEV email override (optional)
      const DEV_EMAIL = (process.env.NEXT_PUBLIC_DEV_EMAIL || "").toLowerCase();
      let admin = !!(user.email && DEV_EMAIL && user.email.toLowerCase() === DEV_EMAIL);

      // 2) Primary: membership in blog_admins (non-recursive policy must allow self read)
      if (!admin) {
        const { data: adminRow, error: adminErr } = await supabase
          .from("blog_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminErr) {
          console.error("blog_admins check error:", adminErr);
        }
        admin = !!adminRow;
      }

      if (!admin) {
        console.warn("Unauthorized user tried to access blog editor");
        router.push("/login");
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
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

    let { title, slug, excerpt, cover_image_url, content } = form;

    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      setPublishing(false);
      return;
    }

    const safeSlug = normalizeSlug(slug);

    try {
      // --- Check for duplicate slug (head+count = lightweight) ---
      const { count, error: slugError } = await supabase
        .from("blogs")
        .select("id", { count: "exact", head: true })
        .eq("slug", safeSlug);

      if (slugError) {
        console.error("Slug check error (full):", slugError);
        toast.error(slugError.message || "Slug check failed");
        setPublishing(false);
        return;
      }

      if ((count ?? 0) > 0) {
        toast.error("Slug already exists. Please choose another.");
        setPublishing(false);
        return;
      }

      // --- Insert blog post ---
      const now = new Date().toISOString();
      const { error } = await supabase.from("blogs").insert([
        {
          title: title.trim(),
          slug: safeSlug,
          excerpt: excerpt.trim() || null,
          cover_image_url: cover_image_url.trim() || null,
          content,
          author: "Dev Team",
          is_published: true,
          published_at: now,
          updated_at: now,
        },
      ]);

      if (error) {
        console.error("❌ Insert error (full):", error);
        toast.error(error.message || "Failed to publish post");
      } else {
        toast.success("✅ Post published!");
        router.push(`/blog/${safeSlug}`);
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
        <Toaster position="top-right" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-red-400">Redirecting to login...</p>
        <Toaster position="top-right" />
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
          onBlur={(e) => setForm((f) => ({ ...f, slug: normalizeSlug(e.target.value || f.slug) }))}
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
