"use client";

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 px-6 py-20 max-w-3xl mx-auto">
      <article>
        <h1 className="text-4xl font-bold mb-4 capitalize">{params.slug.replace("-", " ")}</h1>
        <p className="text-gray-400 mb-6">Published on Aug 31, 2025</p>
        <div className="space-y-4 leading-relaxed">
          <p>This is your blog post content. Add financial tips, saving strategies, and subscription insights here.</p>
          <p>Make sure each article is actionable and ties back to how CashDuezy helps users save.</p>
        </div>
      </article>
    </main>
  );
}