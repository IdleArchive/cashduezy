"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BlogAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    is_published: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save post");

      toast.success("Blog post published!");
      router.push(`/blog/${data.post.slug}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug (URL)</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={2}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Content (Markdown)</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={12}
            className="mt-1 w-full rounded-lg border p-2 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Cover Image URL</label>
          <input
            type="text"
            name="cover_image_url"
            value={form.cover_image_url}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border p-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_published"
            checked={form.is_published}
            onChange={(e) =>
              setForm({ ...form, is_published: e.target.checked })
            }
          />
          <label>Publish immediately</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
