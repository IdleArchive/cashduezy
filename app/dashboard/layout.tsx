import "../globals.css";
import type { Metadata } from "next";

// Match root baseUrl logic for consistency
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.cashduezy.com"
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    absolute: "Dashboard | CashDuezy",
  },
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
      {/* 👇 Dashboard pages already include their own header/footer inside DashboardContent */}
      <main className="flex-1">{children}</main>
    </div>
  );
}