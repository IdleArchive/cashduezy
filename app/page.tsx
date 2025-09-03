// app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  List as ListIcon,
  PieChart as PieChartIcon,
  AlertTriangle as AlertTriangleIcon,
  Palette as PaletteIcon,
  Shield,
  Lock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// --- Translations dictionary ---
const translations: Record<
  string,
  {
    heroTitle: string;
    heroDesc: string;
    ctaStart: string;
    ctaPro: string;
    alreadyHave: string;
    login: string;

    featureTitle: string;
    features: { title: string; desc: string; icon: React.ReactNode }[];

    stepsTitle: string;
    steps: { step: string; title: string; desc: string }[];

    pricingTitle: string;
    pricingDesc: string;

    securityTitle: string;
    securityDesc: string;
    secPoints: string[];

    faqTitle: string;
    faqs: { q: string; a: string }[];

    finalTitle: string;
    finalDesc: string;
    footer: string;
  }
> = {
  en: {
    heroTitle: "Take Control of Your Subscriptions",
    heroDesc:
      "Track, manage, and reduce recurring spend — all in one place. Stay ahead of renewals and never be surprised by a charge again.",
    ctaStart: "Get Started Free",
    ctaPro: "See Pro Features",
    alreadyHave: "Already have an account?",
    login: "Log In",

    featureTitle: "Everything you need",
    features: [
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
    ],

    stepsTitle: "How it works",
    steps: [
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
    ],

    pricingTitle: "Pricing that grows with you",
    pricingDesc:
      "Start free today. Upgrade to Pro anytime for more power and flexibility.",

    securityTitle: "Security & Privacy",
    securityDesc:
      "We take your privacy seriously. CashDuezy uses secure providers and follows best practices to protect your data.",
    secPoints: [
      "Encrypted in transit",
      "Privacy-first design",
      "Export & delete anytime",
    ],

    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Is there a free plan?", a: "Yes. Free lets you track 3 services." },
      {
        q: "What do I get with Pro?",
        a: "Unlimited services, analytics, reminders, and more.",
      },
      {
        q: "How do duplicate alerts work?",
        a: "We flag multiple subscriptions so you can cancel extras.",
      },
      { q: "Is my data secure?", a: "Yes. We use industry-standard security and you control your data." },
      { q: "Can I cancel anytime?", a: "Absolutely. Cancel in a couple of clicks." },
    ],

    finalTitle: "Ready to get control back?",
    finalDesc: "Start free in under a minute. Upgrade anytime.",
    footer: `© ${new Date().getFullYear()} CashDuezy. All rights reserved.`,
  },
  // Future languages (zh, ja, etc.) can be added here.
};

export default function HomePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const t = translations[lang] || translations.en;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-700/10 to-transparent" />
        <Image
          src="/cashduezy_logo.png"
          alt="CashDuezy Logo"
          width={80}
          height={80}
          className="mb-6"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.heroTitle}</h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl">{t.heroDesc}</p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-lg font-medium inline-flex items-center gap-2"
          >
            {t.ctaStart} <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/pricing"
            className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 text-lg font-medium"
          >
            {t.ctaPro}
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {t.alreadyHave}{" "}
          <Link
            href="/login"
            className="underline text-violet-400 hover:text-violet-300"
          >
            {t.login}
          </Link>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Shield className="w-3.5 h-3.5" /> Bank-style security
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5" /> Privacy first
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Built for simplicity
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">{t.featureTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.map((f) => (
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

      {/* Steps */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">{t.stepsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              >
                <div className="text-violet-300 text-sm font-semibold">
                  Step {s.step}
                </div>
                <h3 className="text-xl font-semibold mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Pricing --- */}
      <section className="bg-gray-950 py-24" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            {t.pricingTitle}
          </h2>
          <p className="text-center text-gray-400 mb-12">{t.pricingDesc}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free card */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 md:p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="text-sm text-gray-400 mt-1 mb-5">
                Everything to get started and build the habit.
              </p>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Track up to 3 subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Spending insights & charts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Renewal reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 text-rose-500" />
                  <span>No advanced analytics</span>
                </li>
              </ul>

              <Link
                href="/login"
                className="mt-6 w-full px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition inline-block text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro card */}
            <div
              className="rounded-2xl p-6 md:p-8
                   bg-gradient-to-b from-gray-900/70 to-gray-900/40
                   border border-violet-500/30 ring-1 ring-violet-500/40
                   shadow-[0_0_0_1px_rgba(139,92,246,0.25)]"
            >
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="text-sm text-gray-400 mt-1 mb-5">
                Unlock unlimited power and automation.
              </p>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Unlimited subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Priority renewal alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <Link
                href="/pricing"
                className="mt-6 inline-flex w-full items-center justify-center
                     rounded-lg bg-emerald-600 hover:bg-emerald-500
                     text-white font-medium py-2.5 transition"
              >
                Upgrade to Pro – $5/month
              </Link>

              <p className="text-center text-xs text-gray-500 mt-2">
                Cancel anytime. Zero hassle, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-8 md:p-10">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-300 p-2 border border-emerald-700/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.securityTitle}</h3>
                <p className="text-sm text-gray-400 mb-4">{t.securityDesc}</p>
                <ul className="grid sm:grid-cols-3 gap-3 text-sm">
                  {t.secPoints.map((p) => (
                    <li
                      key={p}
                      className="rounded-lg border border-gray-800 bg-gray-900/70 p-3"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">{t.faqTitle}</h2>
          <div className="space-y-3">
            {t.faqs.map(({ q, a }) => (
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
          <h2 className="text-3xl font-bold mb-3">{t.finalTitle}</h2>
          <p className="text-gray-400 mb-6">{t.finalDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium inline-flex items-center gap-2"
            >
              {t.ctaStart} <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg bg-gray-950 border border-gray-800 hover:bg-gray-900 text-gray-200 font-medium"
            >
              {t.ctaPro}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        {t.footer}
      </footer>
    </main>
  );
}
