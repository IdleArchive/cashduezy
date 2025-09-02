"use client";

import Link from "next/link";

export default function SupportPage() {
  const supportEmail = "support@cashduezy.com";

  // Prefilled mailto links for convenience
  const generalSubject = encodeURIComponent("CashDuezy Support Request");
  const generalBody = encodeURIComponent(
    `Hi CashDuezy Support,

I need help with: (briefly describe the issue)

Account email:
Device/Browser (optional):
Screenshots (optional):`
  );

  const cancelSubject = encodeURIComponent("Cancel My CashDuezy Subscription");
  const cancelBody = encodeURIComponent(
    `Hi CashDuezy Support,

Please cancel my subscription.

Account email:
Reason for cancel (optional):
Anything else you’d like us to know (optional):`
  );

  const deleteSubject = encodeURIComponent("Data Deletion Request");
  const deleteBody = encodeURIComponent(
    `Hi CashDuezy Support,

I’d like to delete my account data.

Account email:
(If you want an export first, please request it before deletion.)`
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Support & Cancellation</h1>
        <p className="text-gray-400">
          We’re here to help. If you can’t find what you need below, email us at{" "}
          <a href={`mailto:${supportEmail}`} className="underline">
            {supportEmail}
          </a>
          . We aim to reply within <strong>24 hours (Mon–Fri, PT)</strong>.
        </p>
      </header>

      {/* Quick actions */}
      <section className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${supportEmail}?subject=${generalSubject}&body=${generalBody}`}
          className="block rounded-lg border border-gray-700/60 p-4 hover:bg-gray-800/40 transition"
        >
          <h2 className="font-semibold">Contact Support</h2>
          <p className="text-sm text-gray-400">
            Get help with setup, billing, notifications, or anything else.
          </p>
        </a>

        <a
          href={`mailto:${supportEmail}?subject=${cancelSubject}&body=${cancelBody}`}
          className="block rounded-lg border border-gray-700/60 p-4 hover:bg-gray-800/40 transition"
        >
          <h2 className="font-semibold">Request Cancellation</h2>
          <p className="text-sm text-gray-400">
            Manual cancellation while in-app automation is being built.
          </p>
        </a>
      </section>

      {/* Cancellation (honest + simple) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How cancellation works (for now)</h2>
        <div className="rounded-lg border border-gray-700/60 p-4 space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-gray-200">
            <li>
              Email{" "}
              <a href={`mailto:${supportEmail}?subject=${cancelSubject}&body=${cancelBody}`} className="underline">
                {supportEmail}
              </a>{" "}
              with the subject <em>“Cancel My CashDuezy Subscription”</em>. Please include
              your <strong>account email</strong>.
            </li>
            <li>
              We’ll confirm by email and cancel your next renewal. You’ll keep access
              through the end of your current billing period.
            </li>
            <li>
              Refunds: handled <strong>case-by-case</strong>. If you were charged in error
              or something isn’t right, let us know and we’ll review promptly.
            </li>
          </ol>
          <p className="text-sm text-gray-400">
            Automated in-app cancellation is coming soon. We’ll announce it on our{" "}
            <Link href="/changelog" className="underline">
              Changelog
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Data export / deletion */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data export & deletion</h2>
        <div className="rounded-lg border border-gray-700/60 p-4 space-y-2">
          <ul className="list-disc list-inside space-y-2 text-gray-200">
            <li>
              <strong>Export:</strong> You can export your data from the Dashboard (CSV / PDF).
            </li>
            <li>
              <strong>Deletion:</strong> Want your data deleted? Email{" "}
              <a
                href={`mailto:${supportEmail}?subject=${deleteSubject}&body=${deleteBody}`}
                className="underline"
              >
                {supportEmail}
              </a>{" "}
              from your account email with the subject <em>“Data Deletion Request”</em>.
            </li>
            <li>
              We never sell your data. Learn more on our{" "}
              <Link href="/faq" className="underline">
                FAQ
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* More help */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">More help</h2>
        <div className="rounded-lg border border-gray-700/60 p-4 space-y-2">
          <ul className="list-disc list-inside space-y-2 text-gray-200">
            <li>
              Read the{" "}
              <Link href="/faq" className="underline">
                FAQ
              </Link>{" "}
              for pricing, privacy, billing, and notifications.
            </li>
            <li>
              See what’s shipped and what’s next on the{" "}
              <Link href="/changelog" className="underline">
                Changelog
              </Link>
              .
            </li>
            <li>
              Can’t find the answer? Email{" "}
              <a href={`mailto:${supportEmail}?subject=${generalSubject}&body=${generalBody}`} className="underline">
                {supportEmail}
              </a>{" "}
              and we’ll help you out.
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-500">
          Last updated: Sept 1, 2025 · Times are Pacific Time (PT).
        </p>
      </section>
    </main>
  );
}