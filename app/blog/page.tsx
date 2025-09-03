// /app/blog/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: "Blog | CashDuezy",
  description:
    "Actionable guides on subscription tracking, cancellation, budgeting, and fintech. Written by the CashDuezy Dev Team.",
};

export const revalidate = 600; // refresh list every 10 minutes

type BlogListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string;
  published_at: string; // ISO
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPosts(): Promise<BlogListItem[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, cover_image_url, author, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[BLOG] list error:", error.message);
    return [];
  }
  return (data ?? []) as BlogListItem[];
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">CashDuezy Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Research-backed articles by the Dev Team. No fluff—just useful.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id} className="group rounded-2xl border p-4">
              <Link href={`/blog/${post.slug}`} className="block">
                {post.cover_image_url ? (
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}

                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  By {post.author} • {formatDate(post.published_at)}
                </div>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm text-foreground/80">
                    {post.excerpt}
                  </p>
                ) : null}

                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  Read article →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}