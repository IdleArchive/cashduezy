// app/dashboard/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react"; // ✅ for components that may use useSearchParams

// Match root baseUrl logic for consistency
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.cashduezy.com"
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { absolute: "Dashboard | CashDuezy" },
  description:
    "View your subscriptions, spending insights, and upcoming payments in your CashDuezy dashboard.",
  keywords: [
    "subscription dashboard",
    "subscription tracker",
    "upcoming payments",
    "spending insights",
    "recurring charges",
    "CashDuezy",
  ],
  authors: [{ name: "CashDuezy Team" }],
  creator: "CashDuezy",
  publisher: "CashDuezy",
  openGraph: {
    title: "Dashboard | CashDuezy",
    description:
      "Manage your subscriptions and view upcoming charges directly in your CashDuezy dashboard.",
    url: "https://www.cashduezy.com/dashboard",
    siteName: "CashDuezy",
    images: [
      {
        url: "/cashduezy_preview.png",
        width: 1200,
        height: 630,
        alt: "CashDuezy dashboard preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cashduezy",
    title: "Dashboard | CashDuezy",
    description:
      "Track your subscriptions, spending, and renewals in the CashDuezy dashboard.",
    images: ["/cashduezy_preview.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="font-sans flex flex-col min-h-screen
                 bg-gray-50 text-gray-800
                 dark:bg-gray-950 dark:text-gray-100"
    >
      {/* Main: wrapped in Suspense in case children use useSearchParams() */}
      <Suspense fallback={null}>
        <main className="flex-1">{children}</main>
      </Suspense>

      {/* Footer (static links; no FooterClient) */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Company navigation */}
          <div>
            <h3 className="font-semibold mb-2">Company</h3>
            <ul className="space-y-1">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/changelog" className="hover:underline">Changelog</Link></li>
              <li><Link href="/support" className="hover:underline">Support</Link></li>
            </ul>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <p>
              <a href="mailto:support@cashduezy.com" className="underline">
                support@cashduezy.com
              </a>
            </p>
          </div>

          {/* Column 3: Legal */}
          <div className="text-gray-600 dark:text-gray-500 md:text-right space-y-2">
            <p>&copy; {new Date().getFullYear()} CashDuezy. All rights reserved.</p>
            <div className="flex gap-4 justify-center md:justify-end text-sm">
              <a href="/privacy" className="hover:underline">Privacy Policy</a>
              <a href="/terms" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}