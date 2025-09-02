"use client";

export default function FAQPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <div className="space-y-6 text-gray-200">
        <section>
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p>Subscriptions are billed monthly. You can upgrade or downgrade anytime.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Data Privacy</h2>
          <p>We never sell your data. Your information is stored securely.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Billing</h2>
          <p>Billing happens at the start of your cycle. Refunds are handled case-by-case.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Support</h2>
          <p>
            Questions? Reach us at{" "}
            <a href="mailto:support@cashduezy.com" className="underline">
              support@cashduezy.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}