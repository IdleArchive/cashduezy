"use client";

const updates = [
  {
    date: "Sept 1, 2025",
    title: "Support Email Added",
    description: "We added support@cashduezy.com across the site for inquiries.",
  },
  {
    date: "Aug 31, 2025",
    title: "CSV + PDF Export",
    description: "Users can now export dashboard data as CSV or PDF.",
  },
];

export default function ChangelogPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">What’s New</h1>
      <ul className="space-y-6">
        {updates.map((u, i) => (
          <li key={i} className="border-b border-gray-700 pb-4">
            <p className="text-sm text-gray-400">{u.date}</p>
            <h2 className="text-xl font-semibold">{u.title}</h2>
            <p>{u.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}