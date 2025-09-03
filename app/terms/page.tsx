"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="prose prose-lg dark:prose-invert mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="italic text-gray-500">Effective Date: September 2, 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using the CashDuezy website and services
        (“Service”), you agree to these Terms of Service (“Terms”). CashDuezy
        (“we” or “us”) provides a subscription management platform, and these
        Terms govern your use of our Service. If you do not agree to these
        Terms, you must not use the Service. These Terms incorporate our{" "}
        <Link href="/privacy" className="text-blue-600 underline">
          Privacy Policy
        </Link>{" "}
        by reference.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        CashDuezy offers an online subscription management tool that helps you
        track, manage, and cancel your recurring subscriptions. We provide
        features like subscription tracking, spending insights, renewal
        reminders, and duplicate subscription alerts. Please note: CashDuezy is
        not a bank or financial institution and does not make payments on your
        behalf. The Service is provided for informational and organizational
        purposes only – it is not financial advice or a guarantee of savings.
      </p>

      <h2>3. Eligibility and Accounts</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your
        jurisdiction) to use CashDuezy. You are responsible for maintaining the
        confidentiality of your account credentials and for all activity under
        your account.
      </p>

      <h2>4. Subscription Plans & Payment</h2>
      <p>
        CashDuezy offers both a free plan and a premium “Pro” subscription at{" "}
        <strong>$5 USD/month</strong>. Pro subscriptions auto-renew until you
        cancel. Payments are processed securely via{" "}
        <Link
          href="https://stripe.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Stripe
        </Link>
        .
      </p>

      <h2>5. Cancellation & Refunds</h2>
      <p>
        You may cancel your Pro subscription anytime through account settings.
        Access remains until the end of the paid billing cycle. Fees are
        non-refundable except where required by law.
      </p>

      <h2>6. User Responsibilities</h2>
      <p>
        You must input accurate subscription data to receive accurate insights.
        CashDuezy may provide reminders, but you remain responsible for
        managing your own subscriptions and finances. If you connect your bank
        account via Plaid, you authorize us and Plaid to access your account
        information solely for providing the Service.
      </p>

      <h2>7. Prohibited Activities</h2>
      <ul>
        <li>Using the Service for unlawful purposes</li>
        <li>Attempting unauthorized access or security breaches</li>
        <li>Scraping or automated data-mining</li>
        <li>Reselling or exploiting the Service</li>
        <li>Infringing intellectual property or rights of others</li>
      </ul>

      <h2>8. Intellectual Property Rights</h2>
      <p>
        All content, software, and trademarks related to CashDuezy are our
        property. You retain ownership of the data you provide but grant us a
        license to process it in order to provide the Service.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        We may link to or integrate third-party services such as Plaid or
        Stripe. Use of such services is governed by their own terms and privacy
        policies.
      </p>

      <h2>10. No Financial Advice & Disclaimer</h2>
      <p>
        CashDuezy provides tools for informational purposes only. We are not
        financial advisors. The Service is provided “as-is” without warranties
        of any kind.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, CashDuezy shall not be liable
        for indirect, incidental, or consequential damages. Our total liability
        shall not exceed the greater of $50 USD or the fees you paid us in the
        prior 12 months.
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless CashDuezy against claims
        arising from your misuse of the Service or violation of these Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Washington State, USA. Disputes
        shall be resolved in the state or federal courts located in Washington.
      </p>

      <h2>14. International Use</h2>
      <p>
        CashDuezy is accessible worldwide. You are responsible for complying
        with local laws in your jurisdiction. Data may be processed in the U.S.
        and abroad.
      </p>

      <h2>15. Changes to Terms</h2>
      <p>
        We may update these Terms occasionally. If we make material changes, we
        will notify you via the Service or email. Continued use after changes
        constitutes acceptance.
      </p>

      <h2>16. Termination</h2>
      <p>
        You may stop using CashDuezy anytime. We reserve the right to suspend or
        terminate accounts that violate these Terms.
      </p>

      <h2>17. Contact Information</h2>
      <p>
        For questions about these Terms, contact us at{" "}
        <Link href="mailto:support@cashduezy.com" className="text-blue-600 underline">
          support@cashduezy.com
        </Link>
        .
      </p>
    </main>
  );
}
