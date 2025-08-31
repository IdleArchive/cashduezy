"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProPage() {
  const router = useRouter();

  // ----- Theme -----
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const isDark = theme === "dark";
  const pageBg = isDark ? "bg-gray-950" : "bg-gray-50";
  const pageText = isDark ? "text-gray-100" : "text-gray-800";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const cardBorder = isDark ? "border-gray-800" : "border-gray-200";
  const neutralButton = isDark
    ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300";
  const accentButton = (colour: "violet" | "emerald") => {
    if (colour === "emerald") {
      return isDark
        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
        : "bg-green-600 hover:bg-green-500 text-white";
    }
    return isDark
      ? "bg-violet-600 hover:bg-violet-500 text-white"
      : "bg-indigo-600 hover:bg-indigo-500 text-white";
  };

  // Theme menu
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ----- Actions -----
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Direct redirect to Stripe (Option A)
  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "pro",
          automaticTax: true,
          billingAddressCollection: "auto",
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // Stripe takes over
      } else {
        toast.error("Failed to get checkout URL");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Stripe checkout failed");
      setIsLoading(false);
    }
  };

  const goDashboard = () => router.push("/dashboard");

  // Comparison rows
  const proFeatures = [
    { name: "Unlimited Subscriptions", free: "Up to 3 unique services", pro: "Unlimited unique services" },
    { name: "Account Linking & Import", free: "Manual entry only", pro: "Link your bank and auto-import recurring charges" },
    { name: "Automated Cancellation", free: "Semi-automated forms", pro: "Concierge and fully automated cancellations" },
    { name: "Alerts & Notifications", free: "Basic renewal reminders", pro: "Overspending and free trial alerts" },
    { name: "Multi-User Sharing", free: "Single user only", pro: "Invite family & roommates with roles" },
    { name: "Data Export", free: "CSV only", pro: "CSV & PDF export with projections" },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${pageText}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 w-full ${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md ${isDark ? "bg-violet-900/30 border-violet-800/40 text-violet-300" : "bg-indigo-100 border-indigo-300 text-indigo-600"} border`}>
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-semibold">CashDuezy Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={themeMenuRef}>
              <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`p-2 rounded-md ${neutralButton}`} aria-label="Theme settings">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              {isThemeMenuOpen && (
                <div className={`absolute right-0 mt-2 w-32 rounded-md shadow-lg ${cardBg} ${cardBorder} z-50`}>
                  <button onClick={() => { setTheme("light"); setIsThemeMenuOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button onClick={() => { setTheme("dark"); setIsThemeMenuOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Level Up Your Subscription Management</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Unlock the full power of CashDuezy with our Pro plan. Link bank accounts, automate cancellations,
          get intelligent alerts, invite family members, and export detailed reports.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center gap-2 ${accentButton("emerald")} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>) : "Upgrade Now"}
          </button>
          <button onClick={goDashboard} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-medium">
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* Pricing Cards — mirrors homepage style */}
      <section className="bg-gray-900/40 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-3">Pricing</h3>
          <p className="text-gray-400 mb-12">Start free today. Upgrade to Pro anytime for more power and flexibility.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className={`rounded-2xl p-8 flex flex-col border ${cardBg} ${cardBorder}`}>
              <h4 className="text-2xl font-semibold mb-2">Free</h4>
              <p className="text-gray-400 mb-6">Get started with essential features.</p>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✅ Track up to 3 subscriptions</li>
                <li>✅ Spending insights &amp; charts</li>
                <li>✅ Renewal reminders</li>
                <li>❌ No advanced analytics</li>
              </ul>
              <Link
                href="/"
                className="mt-auto px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl p-8 flex flex-col border border-violet-600 shadow-lg bg-gray-900">
              <h4 className="text-2xl font-semibold mb-2">Pro</h4>
              <p className="text-gray-400 mb-6">Unlock unlimited power.</p>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✅ Unlimited subscriptions</li>
                <li>✅ Advanced spending analytics</li>
                <li>✅ Priority renewal reminders</li>
                <li>✅ Access to upcoming features first</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={`mt-auto px-6 py-3 rounded-lg font-medium text-white ${accentButton("emerald")} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Processing…" : "Upgrade to Pro – $5/month"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-side Comparison (kept for detail) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className={`overflow-x-auto shadow-sm rounded-xl ${cardBg} ${cardBorder}`}>
          <table className="min-w-full text-sm">
            <thead className={`${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              <tr>
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-center">Free</th>
                <th className="px-4 py-3 text-center">Pro</th>
              </tr>
            </thead>
            <tbody className={`${isDark ? "divide-gray-800" : "divide-gray-200"} divide-y`}>
              {proFeatures.map((feat) => (
                <tr key={feat.name}>
                  <td className="px-4 py-3 font-medium">{feat.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>{feat.free}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{feat.pro}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-16 px-6">
        <p className="text-lg mb-4">Ready to experience CashDuezy Pro?</p>
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center gap-2 ${accentButton("emerald")} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>) : "Upgrade to Pro"}
        </button>
        <div className="mt-4 text-sm text-gray-500">Cancel anytime. Secure checkout powered by Stripe.</div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDark ? "border-gray-800" : "border-gray-200"} py-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        <nav className="flex justify-center gap-4 mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span>•</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:underline"
          >
            Back to Top
          </button>
        </nav>
        © 2025 CashDuezy. All rights reserved.
      </footer>
    </div>
  );
}