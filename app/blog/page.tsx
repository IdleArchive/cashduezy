"use client";

import Link from "next/link";

export default function BlogPage() {
  const posts = [
    { slug: "saving-on-subscriptions", title: "5 Ways to Save on Subscriptions", date: "Aug 31, 2025" },
    { slug: "budgeting-101", title: "Budgeting 101: How to Take Control", date: "Aug 29, 2025" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 px-6 py-20 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">CashDuezy Blog</h1>
      <p className="text-gray-400 text-center mb-12">
        Tips, strategies, and insights on managing subscriptions and saving money.
      </p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-violet-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm">{post.date}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
