"use client";

import { useEffect, useState } from "react";
import { autoTranslate } from "@/lib/translate";

// Map Next.js locales → DeepL language codes
const langMap: Record<string, string> = {
  "en-US": "EN",
  "en-GB": "EN-GB",
  "fr-FR": "FR",
  "de-DE": "DE",
  "es-ES": "ES",
  "it-IT": "IT",
  "ja-JP": "JA",
  "zh-CN": "ZH",
  "pt-BR": "PT-BR",
  "ko-KR": "KO",
  "en-IN": "EN",
  "en-CA": "EN",
  "en-AU": "EN",
};

// --- Define type for translations ---
type TranslationKeys = {
  pricingTitle: string;
  pricingDesc: string;
  freeTitle: string;
  freePrice: string;
  freeFeature1: string;
  freeFeature2: string;
  freeFeature3: string;
  proTitle: string;
  proPrice: string;
  proFeature1: string;
  proFeature2: string;
  proFeature3: string;
  ctaFree: string;
  ctaPro: string;
};

// --- English source strings (source of truth) ---
const englishStrings: TranslationKeys = {
  pricingTitle: "Choose the plan that fits your needs",
  pricingDesc: "CashDuezy offers simple, transparent pricing for everyone.",
  freeTitle: "Free Plan",
  freePrice: "$0 / month",
  freeFeature1: "Track up to 10 subscriptions",
  freeFeature2: "Basic reminders before renewals",
  freeFeature3: "Cancel anytime, no credit card required",
  proTitle: "Pro Plan",
  proPrice: "$5 / month",
  proFeature1: "Unlimited subscription tracking",
  proFeature2: "Smart alerts & advanced analytics",
  proFeature3: "Priority support & early access to new features",
  ctaFree: "Get Started Free",
  ctaPro: "Upgrade to Pro",
};

export default function LocalePricingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const deeplCode = langMap[locale] || "EN";

  const [translated, setTranslated] = useState<TranslationKeys>(englishStrings);

  useEffect(() => {
    async function translateAll() {
      if (deeplCode === "EN" || deeplCode === "EN-GB") {
        setTranslated(englishStrings);
        return;
      }

      const translatedEntries = await Promise.all(
        Object.entries(englishStrings).map(async ([key, value]) => {
          const t = await autoTranslate(value, deeplCode);
          return [key, t] as [string, string];
        })
      );

      setTranslated(Object.fromEntries(translatedEntries) as TranslationKeys);
    }

    translateAll();
  }, [deeplCode]);

  return (
    <main className="px-6 py-12 max-w-5xl mx-auto text-center">
      {/* Page Heading */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4">{translated.pricingTitle}</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-12">{translated.pricingDesc}</p>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="p-6 border rounded-2xl shadow text-left">
          <h2 className="text-2xl font-semibold mb-2">{translated.freeTitle}</h2>
          <p className="text-3xl font-bold mb-4">{translated.freePrice}</p>
          <ul className="space-y-2 mb-6">
            <li>✅ {translated.freeFeature1}</li>
            <li>✅ {translated.freeFeature2}</li>
            <li>✅ {translated.freeFeature3}</li>
          </ul>
          <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow">
            {translated.ctaFree}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="p-6 border rounded-2xl shadow text-left bg-gray-50">
          <h2 className="text-2xl font-semibold mb-2">{translated.proTitle}</h2>
          <p className="text-3xl font-bold mb-4">{translated.proPrice}</p>
          <ul className="space-y-2 mb-6">
            <li>✨ {translated.proFeature1}</li>
            <li>✨ {translated.proFeature2}</li>
            <li>✨ {translated.proFeature3}</li>
          </ul>
          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow">
            {translated.ctaPro}
          </button>
        </div>
      </div>
    </main>
  );
}
