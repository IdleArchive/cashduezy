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
  supportTitle: string;
  supportIntro: string;
  contactTitle: string;
  contactDesc: string;
  faqTitle: string;
  faqDesc: string;
  emailCta: string;
  faqCta: string;
};

// --- English source strings (Support content) ---
const englishStrings: TranslationKeys = {
  supportTitle: "Need Help? We’re Here for You",
  supportIntro:
    "Whether it’s a billing issue, technical problem, or a quick question, our support team is ready to assist.",
  contactTitle: "Contact Support",
  contactDesc:
    "Reach us directly by email and we’ll get back to you as soon as possible.",
  faqTitle: "Check Our FAQ",
  faqDesc:
    "Find quick answers to the most common questions in our FAQ section.",
  emailCta: "Email Us",
  faqCta: "View FAQ",
};

export default function LocaleSupportPage({ params }: { params: { locale: string } }) {
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
    <main className="px-6 py-12 max-w-3xl mx-auto text-center">
      {/* Page Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        {translated.supportTitle}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-12">
        {translated.supportIntro}
      </p>

      {/* Contact Section */}
      <section className="mb-12 p-6 border rounded-2xl shadow text-left">
        <h2 className="text-2xl font-semibold mb-2">{translated.contactTitle}</h2>
        <p className="text-gray-700 mb-4">{translated.contactDesc}</p>
        <a
          href="mailto:support@cashduezy.com"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow"
        >
          {translated.emailCta}
        </a>
      </section>

      {/* FAQ Section */}
      <section className="p-6 border rounded-2xl shadow text-left">
        <h2 className="text-2xl font-semibold mb-2">{translated.faqTitle}</h2>
        <p className="text-gray-700 mb-4">{translated.faqDesc}</p>
        <a
          href={`/${locale}/faq`}
          className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow"
        >
          {translated.faqCta}
        </a>
      </section>
    </main>
  );
}
