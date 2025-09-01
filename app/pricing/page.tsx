"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Stripe upgrade handler
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
        window.location.href = data.url; // Stripe checkout redirect
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
      <section className="max-w-4xl mx-auto px-6 text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple Pricing, Powerful Results
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Start free. Upgrade anytime for unlimited subscriptions, automated cancellations, advanced alerts, and more.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`px-10 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing…
              </>
            ) : (
              "Upgrade to Pro – $5/month"
            )}
          </button>
          <button
            onClick={goDashboard}
            className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            CashDuezy is free to start. Upgrade to Pro for the tools you need to save serious money and take control.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Essential tools to start managing subscriptions.
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Track up to 3 subscriptions</li>
                <li>✅ Spending insights & charts</li>
                <li>✅ Renewal reminders</li>
                <li>❌ No advanced analytics</li>
              </ul>
              <Link
                href="/login"
                className="mt-auto px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-gray-900 border-2 border-emerald-600 rounded-2xl p-8 flex flex-col shadow-xl">
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unlock unlimited power and automation.
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Unlimited subscriptions</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Automated cancellations</li>
                <li>✅ Priority renewal alerts</li>
                <li>✅ Multi-user sharing</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={`mt-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Processing…" : "Upgrade to Pro – $5/month"}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Compare Plans</h2>
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
                  <td className="px-4 py-3 text-center">
                    <XCircle className="w-4 h-4 text-rose-500 inline-block mr-1" />
                    {feat.free}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block mr-1" />
                    {feat.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-gray-950 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p>Yes, you can cancel your Pro subscription at any time. There are no hidden fees or long-term commitments.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you support?</h3>
              <p>We support all major credit and debit cards through Stripe’s secure checkout.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Will I lose my data if I downgrade?</h3>
              <p>No, your subscriptions and spending history remain saved. You’ll just lose access to Pro-only features.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my information secure?</h3>
              <p>Absolutely. CashDuezy uses bank-level encryption and never stores sensitive payment credentials directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Loved by Smart Savers</h2>
          <div className="grid md:grid-cols-3 gap-8 text-gray-700 dark:text-gray-300">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              “CashDuezy saved me over $200 in the first month by catching forgotten subscriptions.”
              <div className="mt-3 font-semibold">– Alex R.</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              “The automated cancellation feature is a game changer. Worth every penny.”
              <div className="mt-3 font-semibold">– Jamie L.</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              “I love being able to share with my family. We’re all on the same page with bills now.”
              <div className="mt-3 font-semibold">– Morgan S.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-20 px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to experience CashDuezy Pro?</h2>
        <p className="text-lg mb-6">Start saving money, cutting waste, and staying in control of your subscriptions today.</p>
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className={`px-10 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processing…
            </>
          ) : (
            "Upgrade Now"
          )}
        </button>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-500">
          Cancel anytime. Secure checkout powered by Stripe.
        </div>
      </section>
    </div>
  );
}