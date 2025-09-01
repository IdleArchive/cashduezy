import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import HeaderClient from "./HeaderClient";
import HideOnDashboard from "./HideOnDashboard";

// --- Base URL configuration (switches automatically for prod/dev) ---
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.cashduezy.com"
    : "http://localhost:3000";

// --- SEO + Metadata configuration ---
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "CashDuezy – Subscription Manager",
    template: "%s | CashDuezy",
  },
  description:
    "Track, manage, and cancel your subscriptions with CashDuezy. Stay on top of renewals, avoid overspending, and simplify your financial life.",
  keywords: [
    "subscription manager",
    "track subscriptions",
    "cancel subscriptions",
    "recurring payments",
    "subscription tracker app",
    "budgeting tool",
    "CashDuezy",
    "bill tracker",
    "subscription reminders",
  ],
  authors: [{ name: "CashDuezy Team" }],
  creator: "CashDuezy",
  publisher: "CashDuezy",
  openGraph: {
    title: "CashDuezy – Subscription Manager",
    description:
      "Track and manage all your recurring subscriptions in one place. Stay on top of payments and cut out waste.",
    url: "https://www.cashduezy.com",
    siteName: "CashDuezy",
    images: [
      {
        url: "/cashduezy_preview.png",
        width: 1200,
        height: 630,
        alt: "CashDuezy preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cashduezy",
    title: "CashDuezy – Subscription Manager",
    description:
      "Easily track, manage, and cancel subscriptions with CashDuezy. Stay on top of renewals and spending.",
    images: ["/cashduezy_preview.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* --- Early Theme Application Script --- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme') || 'system';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = saved === 'system' ? (prefersDark ? 'dark' : 'light') : saved;
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.warn("Theme detection failed", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-sans flex flex-col min-h-screen
                   bg-gray-50 text-gray-800
                   dark:bg-gray-950 dark:text-gray-100"
      >
        {/* Header only outside /dashboard */}
        <HideOnDashboard>
          <HeaderClient />
        </HideOnDashboard>

        <main className="flex-1">{children}</main>

        {/* Footer only outside /dashboard */}
        <HideOnDashboard>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-600 dark:text-gray-500">
            <nav className="flex justify-center gap-4 mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/pricing" className="hover:underline">Pricing</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            </nav>
            © {new Date().getFullYear()} CashDuezy. All rights reserved.
          </footer>
        </HideOnDashboard>
      </body>
    </html>
  );
}