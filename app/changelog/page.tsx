"use client";

type UpdateType = "New" | "Improved";

interface UpdateEntry {
  date: string;       // e.g., "Sept 1, 2025"
  title: string;      // short headline
  description: string;// brief summary
  type: UpdateType;   // "New" | "Improved"
}

/**
 * Accurate, recent updates only (no fabricated backfill).
 * Add new entries to the TOP of this array.
 */
const updates: UpdateEntry[] = [
  {
    date: "Sept 1, 2025",
    title: "Support Email Live",
    description:
      "Replaced personal contact with support@cashduezy.com across the site and set up forwarding. This is now the primary channel for help and cancellations.",
    type: "New",
  },
  {
    date: "Sept 1, 2025",
    title: "Header & Footer Navigation",
    description:
      "Added FAQ, Changelog, and Support links to the header and a polished 3-column footer for better discoverability.",
    type: "Improved",
  },
  {
    date: "Sept 1, 2025",
    title: "Help Pages",
    description:
      "Published /faq and /support pages, plus this /changelog page to keep you informed about product updates.",
    type: "New",
  },
  {
    date: "Aug 31, 2025",
    title: "Pricing Page Layout",
    description:
      "Centered key content and improved readability to make plan selection clearer.",
    type: "Improved",
  },
  {
    date: "Aug 31, 2025",
    title: "Robots.txt Update",
    description:
      "Updated robots.txt to include the www variant for better SEO consistency.",
    type: "Improved",
  },
];

function TypeBadge({ type }: { type: UpdateType }) {
  const cls =
    type === "New"
      ? "bg-green-600 text-white"
      : "bg-blue-600 text-white";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${cls}`}>
      {type}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-extrabold mb-4">What’s New</h1>
        <p className="text-gray-400">
          Transparent updates from the CashDuezy team. We keep this page accurate and
          up to date so you always know what changed.
        </p>
      </header>

      {/* Update List */}
      <ul className="space-y-8">
        {updates.map((u, i) => (
          <li
            key={`${u.date}-${u.title}-${i}`}
            className="border-b border-gray-700 pb-6 last:border-none"
          >
            <div className="flex items-center gap-3 mb-2">
              <TypeBadge type={u.type} />
              <time className="text-sm text-gray-400">{u.date}</time>
            </div>
            <h2 className="text-xl font-semibold mb-1">{u.title}</h2>
            <p className="text-gray-200">{u.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}