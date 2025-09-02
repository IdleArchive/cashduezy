"use client";

export default function FAQPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      {/* Page Header */}
      <header>
        <h1 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-400">
          Have a question? You’ll likely find the answer below. If not, reach out at{" "}
          <a
            href="mailto:support@cashduezy.com"
            className="underline hover:text-violet-400 transition-colors"
          >
            support@cashduezy.com
          </a>
          .
        </p>
      </header>

      {/* FAQ Sections */}
      <div className="space-y-10 text-gray-200">
        {/* Pricing */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">How does pricing work?</h2>
          <p>
            Subscriptions are billed monthly. You can upgrade, downgrade, or cancel
            anytime — no hidden fees or long-term contracts.
          </p>
        </section>

        {/* Free Trial */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Do you offer a free trial?</h2>
          <p>
            Yes! New users get a free trial to explore CashDuezy’s features before
            committing. No credit card required to start.
          </p>
        </section>

        {/* Data Privacy */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Is my data secure?</h2>
          <p>
            Absolutely. We use industry-standard encryption and never sell your data.
            Your subscription details stay private and safe.
          </p>
        </section>

        {/* Billing */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">When will I be charged?</h2>
          <p>
            Billing happens at the start of your cycle. You’ll always know the amount
            in advance, and we send reminders before renewals.
          </p>
        </section>

        {/* Refunds */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Do you offer refunds?</h2>
          <p>
            Refunds are handled case-by-case. If you experience issues, reach out to
            us — we’re here to help.
          </p>
        </section>

        {/* Cancellation */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">How do I cancel?</h2>
          <p>
            Automated cancellation is coming soon. For now, simply email{" "}
            <a
              href="mailto:support@cashduezy.com"
              className="underline hover:text-violet-400 transition-colors"
            >
              support@cashduezy.com
            </a>{" "}
            and we’ll take care of it promptly.
          </p>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Will I get reminders about renewals?
          </h2>
          <p>
            Yes. CashDuezy notifies you ahead of time so you never miss an upcoming
            charge — or get surprised by one.
          </p>
        </section>

        {/* Accounts */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Can I use CashDuezy with multiple accounts?
          </h2>
          <p>
            Yes. You can track subscriptions across multiple services and logins, all
            in one dashboard.
          </p>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">How do I get support?</h2>
          <p>
            Our team is just an email away at{" "}
            <a
              href="mailto:support@cashduezy.com"
              className="underline hover:text-violet-400 transition-colors"
            >
              support@cashduezy.com
            </a>
            . We aim to respond within 24 hours.
          </p>
        </section>
      </div>
    </main>
  );
}