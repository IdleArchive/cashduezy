// /app/blog/[slug]/edit/page.tsx
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";
import { updateBlogAction } from "@/app/blog/actions"; // ✅ correct import

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: { slug: string } }) {
  if (!(await isAdmin())) notFound();

  const supabase = await getSupabaseServer();
  const { data: post, error } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, cover_image_url, author, published_at")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Blog</h1>

      {/* Server action signature must be (formData) => Promise<void> */}
      <form action={updateBlogAction} className="space-y-5">
        <input type="hidden" name="id" value={post.id} />

        <Field label="Title" name="title" defaultValue={post.title ?? ""} />
        <Field label="Slug" name="slug" defaultValue={post.slug ?? ""} />
        <Field label="Excerpt" name="excerpt" defaultValue={post.excerpt ?? ""} textarea />
        <Field label="Cover Image URL" name="cover_image_url" defaultValue={post.cover_image_url ?? ""} />
        <Field label="Author" name="author" defaultValue={post.author ?? ""} />
        <Field label="Published At (ISO)" name="published_at" defaultValue={post.published_at ?? ""} />

        <div className="flex gap-3">
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90">
            Save Changes
          </button>
          <a href={`/blog/${post.slug}`} className="rounded-md border px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/10">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          className="w-full rounded-md border p-2 bg-transparent"
          rows={5}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue ?? ""}
          className="w-full rounded-md border p-2 bg-transparent"
        />
      )}
    </label>
  );
}
