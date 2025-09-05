// /app/blog/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";

export async function deleteBlogById(id: number, redirectTo?: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");

  const supabase = await getSupabaseServer();

  // (Optional) grab slug before delete so we can revalidate detail path if needed
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

type BlogUpdate = Partial<{
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  published_at: string | null; // ISO
}>;

export async function updateBlogById(id: number, patch: BlogUpdate) {
  if (!(await isAdmin())) throw new Error("Unauthorized");

  const supabase = await getSupabaseServer();

  // grab current slug in case it changes
  const { data: current, error: currentErr } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (currentErr) throw currentErr;

  const { error } = await supabase.from("blogs").update(patch).eq("id", id);
  if (error) throw error;

  revalidatePath("/blog", "page");
  if (current?.slug) revalidatePath(`/blog/${current.slug}`, "page");

  const nextSlug = patch.slug ?? current?.slug;
  if (nextSlug) redirect(`/blog/${nextSlug}`);
}
