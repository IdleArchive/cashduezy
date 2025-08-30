"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Replace with your publishable key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function ProPage() {
  const router = useRouter();

  // Example: use router to redirect after upgrade success (if you want to auto-navigate)
  const handleContinue = () => {
    router.push("/dashboard");
  };

  // Theme toggling state
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  const isDark = theme === 'dark';
  const pageBg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const pageText = isDark ? 'text-gray-100' : 'text-gray-800';
  const cardBg = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-800' : 'border-gray-200';
  const neutralButton = isDark
    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300';
  const accentButton = (colour: 'violet' | 'emerald') => {
    if (colour === 'emerald') {
      return isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white';
    }
    return isDark ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white';
  };
  // Theme menu state
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle upgrade from pro page
  const handleUpgrade = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error('Stripe failed to load');
      return;
    }
    // Create a checkout session for the Pro plan
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro', automaticTax: true, billingAddressCollection: 'auto' }),
    });
    const session = await res.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    if (result.error) {
      toast.error(result.error.message || 'Stripe checkout failed');
    }
  };

  const proFeatures = [
    { name: 'Unlimited Subscriptions', free: 'Up to 3 unique services', pro: 'Unlimited unique services' },
    { name: 'Account Linking & Import', free: 'Manual entry only', pro: 'Link your bank and auto‑import recurring charges' },
    { name: 'Automated Cancellation', free: 'Semi‑automated forms', pro: 'Concierge and fully automated cancellations' },
    { name: 'Alerts & Notifications', free: 'Basic renewal reminders', pro: 'Overspending and free trial alerts' },
    { name: 'Multi‑User Sharing', free: 'Single user only', pro: 'Invite family and roommates with roles' },
    { name: 'Data Export', free: 'CSV only', pro: 'CSV & PDF export with projections' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${pageText} font-sans`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 w-full ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md ${isDark ? 'bg-violet-900/30 border-violet-800/40 text-violet-300' : 'bg-indigo-100 border-indigo-300 text-indigo-600'} border`}>
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-semibold">CashDuezy Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2 rounded-md ${neutralButton}`}
                aria-label="Theme settings"
              >
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              {isThemeMenuOpen && (
                <div className={`absolute right-0 mt-2 w-32 rounded-md shadow-lg ${cardBg} ${cardBorder} z-50`}>
                  <button
                    onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 flex-1">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Level Up Your Subscription Management</h2>
          <p className="max-w-2xl mx-auto text-lg mb-6">
            Unlock the full power of CashDuezy with our Pro plan. Seamlessly link your bank accounts,
            automate cancellations, receive intelligent alerts, invite family members and export detailed reports.
          </p>
          <button
            onClick={handleUpgrade}
            className={`px-8 py-3 rounded-md text-lg font-medium ${accentButton('emerald')}`}
          >
            Upgrade Now
          </button>

          {/* Example use of router */}
          <div className="mt-6">
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className={`overflow-x-auto shadow-sm rounded-xl ${cardBg} ${cardBorder}`}>
          <table className="min-w-full text-sm">
            <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <tr>
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-center">Free</th>
                <th className="px-4 py-3 text-center">Pro</th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'divide-gray-800' : 'divide-gray-200'} divide-y`}>
              {proFeatures.map((feat) => (
                <tr key={feat.name}>
                  <td className="px-4 py-3 font-medium">{feat.name}</td>
                  <td className="px-4 py-3 text-center flex justify-center items-center gap-2">
                    {feat.free !== '' ? (
                      <>
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>{feat.free}</span>
                      </>
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{feat.pro}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="mb-4 text-lg">Ready to experience CashDuezy Pro?</p>
          <button
            onClick={handleUpgrade}
            className={`px-8 py-3 rounded-md text-lg font-medium ${accentButton('emerald')}`}
          >
            Upgrade to Pro
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>  
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 items-center">
          <nav className="flex gap-2 sm:gap-4 items-center">
            <Link href="/" className="hover:underline">Dashboard</Link>
            <span>|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline">Back to Top</a>
          </nav>
        </div>
        <div className="mt-2">© 2025 CashDuezy. All rights reserved.</div>
      </footer>
    </div>
  );
}