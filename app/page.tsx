"use client";

import Image from "next/image";
import Link from "next/link";
import {
  List as ListIcon,
  PieChart as PieChartIcon,
  AlertTriangle as AlertTriangleIcon,
  Palette as PaletteIcon,
  CheckCircle2,
  Shield,
  Lock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Track Subscriptions",
      desc: "Manage and track all your recurring services in one place.",
      icon: <ListIcon className="w-5 h-5" />,
    },
    {
      title: "Spending Insights",
      desc: "Visualize your spending with charts and monthly projections.",
      icon: <PieChartIcon className="w-5 h-5" />,
    },
    {
      title: "Duplicate Alerts",
      desc: "Identify and cancel duplicate subscriptions easily.",
      icon: <AlertTriangleIcon className="w-5 h-5" />,
    },
    {
      title: "Customizable Theme",
      desc: "Switch between light and dark mode to match your style.",
      icon: <PaletteIcon className="w-5 h-5" />,
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create your account",
      desc: "Start free — it takes less than a minute. No credit card required.",
    },
    {
      step: "2",
      title: "Add or import services",
      desc: "Quick-add popular services or import a CSV to get up and running fast.",
    },
    {
      step: "3",
      title: "Get insights & reminders",
      desc: "See upcoming charges, spot waste, and stay on top of renewals.",
    },
  ];

  const faqs = [
    {
      q: "Is there a free plan?",
      a: "Yes. The Free plan lets you track up to 3 unique services with insights and renewal reminders.",
    },
    {
      q: "What do I get with Pro?",
      a: "Unlimited services, advanced analytics, priority reminders, upcoming features early, and more.",
    },
    {
      q: "How do duplicate alerts work?",
      a: "We flag multiple subscriptions with the same service name so you can review and cancel extras.",
    },
    {
      q: "Is my data secure?",
      a: "We use industry-standard best practices and secure providers. You can export or delete your data at any time.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely. Manage your plan in a couple of clicks. You’ll keep access through the current billing period.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-700/10 to-transparent" />
        <Image
          src="/cashduezy_logo.png"
          alt="CashDuezy Logo"
          width={80}
          height={80}
          className="mb-6"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Take Control of Your Subscriptions
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl">
          Track, manage, and reduce recurring spend — all in one place. Stay ahead
          of renewals and never be surprised by a charge again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-lg font-medium inline-flex items-center gap-2"
          >
            Get Started Free <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 text-lg font-medium"
          >
            See Pro Features
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline text-violet-400 hover:text-violet-300"
          >
            Log In
          </Link>
        </p>

        {/* credibility mini-badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Shield className="w-3.5 h-3.5" />
            Bank-style security
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5" />
            Privacy first
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Built for simplicity
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5"
              >
                <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-violet-600/15 text-violet-300 p-2 border border-violet-700/20">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              >
                <div className="text-violet-300 text-sm font-semibold">Step {s.step}</div>
                <h3 className="text-xl font-semibold mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pricing that grows with you</h2>
          <p className="text-gray-400 mb-12">
            Start free today. Upgrade to Pro anytime for more power and flexibility.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">
                Everything to get started and build the habit.
              </p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Track up to 3
                  subscriptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Spending insights &
                  charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Renewal reminders
                </li>
                <li className="flex items-center gap-2 opacity-70">
                  <AlertTriangleIcon className="w-4 h-4 text-rose-400" /> No advanced
                  analytics
                </li>
              </ul>
              <Link
                href="/login"
                className="mt-auto px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 border border-violet-700 rounded-2xl p-8 flex flex-col shadow-lg shadow-violet-900/10">
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">Unlock unlimited power and automation.</p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited
                  subscriptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority renewal
                  alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Early access to new
                  features
                </li>
              </ul>
              <Link
                href="/pricing"
                className="mt-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-center"
              >
                Upgrade to Pro – $5/month
              </Link>
              <p className="text-sm text-gray-400 mt-3">
                Cancel anytime. Zero hassle, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Security */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-8 md:p-10">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-300 p-2 border border-emerald-700/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Security & Privacy</h3>
                <p className="text-sm text-gray-400 mb-4">
                  We take your privacy seriously. CashDuezy uses secure providers and
                  follows best practices to protect your data.
                </p>
                <ul className="grid sm:grid-cols-3 gap-3 text-sm">
                  <li className="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                    Encrypted in transit
                  </li>
                  <li className="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                    Privacy-first design
                  </li>
                  <li className="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                    Export & delete anytime
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-gray-800 bg-gray-900/70 p-5"
              >
                <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                  <span>{q}</span>
                  <span className="text-gray-500 group-open:rotate-90 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-400">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to get control back?</h2>
          <p className="text-gray-400 mb-6">
            Start free in under a minute. Upgrade anytime.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium inline-flex items-center gap-2"
            >
              Get Started Free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg bg-gray-950 border border-gray-800 hover:bg-gray-900 text-gray-200 font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CashDuezy. All rights reserved.
      </footer>
    </main>
  );
}