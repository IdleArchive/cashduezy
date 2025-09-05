export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// /app/api/blog/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * Create a new blog post
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image_url, is_published } = body;

    // --- Validate inputs ---
    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, slug, content)" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("blogs")
      .insert([
        {
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          is_published: is_published ?? true, // default true if not provided
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[API] Blog insert error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: unknown) {
    console.error("[API] Blog insert exception:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error creating blog post" },
      { status: 500 }
    );
  }
}

/**
 * Update an existing blog post
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    // --- Validate inputs ---
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing blog post ID" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("blogs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API] Blog update error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: unknown) {
    console.error("[API] Blog update exception:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error updating blog post" },
      { status: 500 }
    );
  }
}

/**
 * Delete a blog post
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    // --- Validate inputs ---
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing blog post ID" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      console.error("[API] Blog delete error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: `Blog post ${id} deleted` });
  } catch (err: unknown) {
    console.error("[API] Blog delete exception:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error deleting blog post" },
      { status: 500 }
    );
  }
}
