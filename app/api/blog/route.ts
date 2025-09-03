// /app/api/blog/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image_url, is_published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
          is_published: is_published ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    console.error("[API] Blog insert error:", err.message);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("blogs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    console.error("[API] Blog update error:", err.message);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
