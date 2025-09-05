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

/**
 * Server action used directly in <form action={updateBlogAction}>.
 * Must have (formData) signature for TS to accept it.
 */
export async function updateBlogAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const supabase = await getSupabaseServer();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    throw new Error("Invalid blog id");
  }

  const patch: BlogUpdate = {
    title: emptyToUndef(formData.get("title")),
    slug: emptyToUndef(formData.get("slug")),
    excerpt: emptyToNull(formData.get("excerpt")),
    cover_image_url: emptyToNull(formData.get("cover_image_url")),
    author: emptyToUndef(formData.get("author")),
    published_at: emptyToNull(formData.get("published_at")),
  };

  // Read current slug (in case it changes)
  const { data: current, error: currentErr } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (currentErr) throw new Error(currentErr.message);
  if (!current) throw new Error("Post not found");

  // Apply update
  const { error } = await supabase.from("blogs").update(patch).eq("id", id);
  if (error) {
    // If you want to show this nicely later, we can redirect back with a query param.
    throw new Error(error.message);
  }

  // Revalidate list + old detail route
  revalidatePath("/blog", "page");
  if (current.slug) revalidatePath(`/blog/${current.slug}`, "page");

  // Redirect to the (possibly new) slug
  const nextSlug = patch.slug ?? current.slug;
  redirect(`/blog/${nextSlug}`);
}

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
