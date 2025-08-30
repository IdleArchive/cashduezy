import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CashDuezy",
  description:
    "View your subscriptions, spending insights, and upcoming payments in your CashDuezy dashboard.",
  openGraph: {
    title: "Dashboard | CashDuezy",
    description:
      "Manage your subscriptions and view upcoming charges directly in your CashDuezy dashboard.",
    url: "https://www.cashduezy.com/dashboard",
  },
  twitter: {
    title: "Dashboard | CashDuezy",
    description: "Track your subscriptions and payments in the CashDuezy dashboard.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}