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
  faqTitle: string;
  faqIntro: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  q4: string;
  a4: string;
};

// --- English source strings (FAQ content) ---
const englishStrings: TranslationKeys = {
  faqTitle: "Frequently Asked Questions",
  faqIntro: "Here are answers to some of the most common questions about CashDuezy.",
  q1: "What is CashDuezy?",
  a1: "CashDuezy is a subscription and bill tracker that helps you manage recurring payments and avoid unwanted charges.",
  q2: "Is CashDuezy free to use?",
  a2: "Yes! Our Free plan lets you track up to 10 subscriptions. You can upgrade to Pro for unlimited tracking and smart alerts.",
  q3: "How do I cancel a subscription with CashDuezy?",
  a3: "You’ll receive alerts with cancellation options. We provide step-by-step guides and quick links to cancellation pages when available.",
  q4: "Is my data secure?",
  a4: "Absolutely. We use bank-level encryption and never sell your personal data. Your security and privacy are our top priority.",
};

export default function LocaleFaqPage({ params }: { params: { locale: string } }) {
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
    <main className="px-6 py-12 max-w-3xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
        {translated.faqTitle}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-12 text-center">
        {translated.faqIntro}
      </p>

      {/* FAQ List */}
      <div className="space-y-8 text-left">
        <div>
          <h2 className="text-xl font-semibold mb-2">{translated.q1}</h2>
          <p className="text-gray-700">{translated.a1}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">{translated.q2}</h2>
          <p className="text-gray-700">{translated.a2}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">{translated.q3}</h2>
          <p className="text-gray-700">{translated.a3}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">{translated.q4}</h2>
          <p className="text-gray-700">{translated.a4}</p>
        </div>
      </div>
    </main>
  );
}
