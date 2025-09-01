"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Stripe upgrade
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
        window.location.href = data.url; // Stripe checkout
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

  const proFeatures = [
    { name: "Unlimited Subscriptions", free: "Up to 3 unique services", pro: "Unlimited unique services" },
    { name: "Account Linking & Import", free: "Manual entry only", pro: "Link your bank and auto-import recurring charges" },
    { name: "Automated Cancellation", free: "Semi-automated forms", pro: "Concierge and fully automated cancellations" },
    { name: "Alerts & Notifications", free: "Basic renewal reminders", pro: "Overspending and free trial alerts" },
    { name: "Multi-User Sharing", free: "Single user only", pro: "Invite family & roommates with roles" },
    { name: "Data Export", free: "CSV only", pro: "CSV & PDF export with projections" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Level Up Your Subscription Management
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Unlock the full power of CashDuezy with our Pro plan. Link bank accounts,
          automate cancellations, get intelligent alerts, invite family members,
          and export detailed reports.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing…
              </>
            ) : (
              "Upgrade Now"
            )}
          </button>
          <button
            onClick={goDashboard}
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pricing</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            Start free today. Upgrade to Pro anytime for more power and flexibility.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started with essential features.
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Track up to 3 subscriptions</li>
                <li>✅ Spending insights & charts</li>
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
            <div className="bg-white dark:bg-gray-900 border border-violet-600 rounded-2xl p-8 flex flex-col shadow-lg">
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Unlock unlimited power.</p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Unlimited subscriptions</li>
                <li>✅ Advanced spending analytics</li>
                <li>✅ Priority renewal reminders</li>
                <li>✅ Access to upcoming features first</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={`mt-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Processing…" : "Upgrade to Pro – $5/month"}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Cancel anytime. Zero hassle, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="overflow-x-auto shadow-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-center">Free</th>
                <th className="px-4 py-3 text-center">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
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
          className={`px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processing…
            </>
          ) : (
            "Upgrade to Pro"
          )}
        </button>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-500">
          Cancel anytime. Secure checkout powered by Stripe.
        </div>
      </section>
    </div>
  );
}