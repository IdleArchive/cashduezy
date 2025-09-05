// /app/blog/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";

type BlogUpdate = Partial<{
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  published_at: string | null; // ISO or null
}>;

function emptyToNull(v: unknown): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}
function emptyToUndef(v: unknown): string | undefined {
  const s = (v ?? "").toString().trim();
  return s === "" ? undefined : s;
}

/** Update via <form action={updateBlogAction}>. Redirects on success, returns {error} on failure. */
export async function updateBlogAction(_prevState: any, formData: FormData): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const supabase = await getSupabaseServer();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { error: "Invalid blog id" };

  // Build patch from form
  const patch: BlogUpdate = {
    title: emptyToUndef(formData.get("title")),
    slug: emptyToUndef(formData.get("slug")),
    excerpt: emptyToNull(formData.get("excerpt")),
    cover_image_url: emptyToNull(formData.get("cover_image_url")),
    author: emptyToUndef(formData.get("author")),
    published_at: emptyToNull(formData.get("published_at")),
  };

  // Current slug in case it changes
  const { data: current, error: currentErr } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (currentErr) return { error: currentErr.message };
  if (!current) return { error: "Post not found" };

  // Apply update
  const { error } = await supabase.from("blogs").update(patch).eq("id", id);
  if (error) {
    // Common: 23505 duplicate key (slug unique)
    return { error: error.message };
  }

  // Revalidate list + old detail route
  revalidatePath("/blog", "page");
  if (current.slug) revalidatePath(`/blog/${current.slug}`, "page");

  // Redirect to new (or unchanged) slug
  const nextSlug = patch.slug ?? current.slug;
  redirect(`/blog/${nextSlug}`);
}

/** Delete by id; optionally redirect back to /blog. (Used by AdminButtons) */
export async function deleteBlogById(id: number, redirectTo?: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");

  const supabase = await getSupabaseServer();

  const { data: pre, error: preErr } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (preErr) throw preErr;

  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/blog", "page");
  if (pre?.slug) revalidatePath(`/blog/${pre.slug}`, "page");
  if (redirectTo) redirect(redirectTo);
}
