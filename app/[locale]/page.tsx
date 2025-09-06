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
  "en-IN": "EN", // fallback
  "en-CA": "EN",
  "en-AU": "EN",
};

// --- Define type for translations ---
type TranslationKeys = {
  heroTitle: string;
  heroDesc: string;
  ctaStart: string;
  ctaPro: string;
  featuresTitle: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  stepsTitle: string;
  step1: string;
  step2: string;
  step3: string;
};

// --- English source strings (your marketing copy) ---
const englishStrings: TranslationKeys = {
  heroTitle: "Take control of your bills and subscriptions",
  heroDesc:
    "CashDuezy automatically tracks your bills, alerts you before renewals, and helps you cancel unwanted subscriptions.",
  ctaStart: "Get Started Free",
  ctaPro: "Upgrade to Pro",
  featuresTitle: "Why Choose CashDuezy?",
  feature1: "Automatic bill tracking across currencies",
  feature2: "Smart alerts before payments renew",
  feature3: "Easy cancellation of unwanted subscriptions",
  feature4: "One dashboard for all your finances",
  stepsTitle: "How It Works",
  step1: "Sign up and connect your accounts",
  step2: "Let CashDuezy detect your bills & subscriptions",
  step3: "Receive alerts and take action instantly",
};

export default function LocaleHomePage({ params }: { params: { locale: string } }) {
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
    <main className="px-6 py-12 max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4">{translated.heroTitle}</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">{translated.heroDesc}</p>

      <div className="flex justify-center gap-4 mb-12">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow">
          {translated.ctaStart}
        </button>
        <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow">
          {translated.ctaPro}
        </button>
      </div>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">{translated.featuresTitle}</h2>
        <ul className="grid md:grid-cols-2 gap-6 text-left">
          <li className="p-4 border rounded-lg shadow">{translated.feature1}</li>
          <li className="p-4 border rounded-lg shadow">{translated.feature2}</li>
          <li className="p-4 border rounded-lg shadow">{translated.feature3}</li>
          <li className="p-4 border rounded-lg shadow">{translated.feature4}</li>
        </ul>
      </section>

      {/* Steps Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">{translated.stepsTitle}</h2>
        <ol className="space-y-4 text-left">
          <li className="p-4 border rounded-lg shadow">{translated.step1}</li>
          <li className="p-4 border rounded-lg shadow">{translated.step2}</li>
          <li className="p-4 border rounded-lg shadow">{translated.step3}</li>
        </ol>
      </section>
    </main>
  );
}
