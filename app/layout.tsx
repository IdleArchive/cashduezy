import "./globals.css";
import type { Metadata } from "next";

// Dynamically pick base URL (localhost for dev, real domain for prod)
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.cashduezy.com"
    : "http://localhost:3000";

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
        url: "/cashduezy_preview.png", // path in /public
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
    site: "@cashduezy", // add your handle if you create one
    title: "CashDuezy – Subscription Manager",
    description:
      "Easily track, manage, and cancel subscriptions with CashDuezy. Stay on top of renewals and spending.",
    images: ["/cashduezy_preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}