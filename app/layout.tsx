// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import HeaderClient from "./HeaderClient";
import HideOnDashboard from "./HideOnDashboard";
import FooterClient from "./FooterClient"; // site-wide legal buttons

// --- Base URL configuration (switches automatically for prod/dev) ---
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.cashduezy.com"
    : "http://localhost:3000";

/**
 * Global SEO + Metadata configuration
 * - Includes Open Graph, Twitter, and base config
 * - Ensures consistent preview cards and SEO across site
 */
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

/**
 * RootLayout — wraps every page in the app with:
 * - Early theme handling (dark/light/system)
 * - Header (hidden on /dashboard pages)
 * - Footer (hidden on /dashboard pages)
 * - Global legal modal support (via FooterClient)
 * - SEO metadata from above
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* --- Early Theme Application Script ---
             Ensures dark/light mode is applied before content flashes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme') || 'system';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = saved === 'system'
                    ? (prefersDark ? 'dark' : 'light')
                    : saved;
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
        {/* --- Header: hidden on dashboard pages --- */}
        <HideOnDashboard>
          <HeaderClient />
        </HideOnDashboard>

        {/* --- Main content area --- */}
        <main className="flex-1">{children}</main>

        {/* --- Footer: hidden on dashboard pages --- */}
        <HideOnDashboard>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-10 text-sm">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1: Company navigation */}
              <div>
                <h3 className="font-semibold mb-2">Company</h3>
                <ul className="space-y-1">
                  <li>
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:underline">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:underline">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/changelog" className="hover:underline">
                      Changelog
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:underline">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Contact */}
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p>
                  <a
                    href="mailto:support@cashduezy.com"
                    className="underline"
                  >
                    support@cashduezy.com
                  </a>
                </p>
              </div>

              {/* Column 3: Legal / Rights (copyright + buttons) */}
              <div className="text-gray-600 dark:text-gray-500 md:text-right space-y-2">
                <p>
                  &copy; {new Date().getFullYear()} CashDuezy. All rights
                  reserved.
                </p>
                {/* FooterClient handles Privacy + Terms modals site-wide */}
                <FooterClient className="flex gap-4 justify-center md:justify-end" />
              </div>
            </div>
          </footer>
        </HideOnDashboard>
      </body>
    </html>
  );
}