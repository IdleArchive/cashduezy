"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="prose prose-lg dark:prose-invert mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="italic text-gray-500">Effective Date: September 2, 2025</p>

      <h2>Your Privacy Matters</h2>
      <p>
        CashDuezy (“we”, “us”, or “our”) is committed to protecting your privacy.
        This Policy explains what information we collect, how we use it, and
        your rights under laws such as GDPR (EU), CCPA (California), and other
        applicable worldwide privacy frameworks. By using our Service, you agree
        to the practices described here.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Information:</strong> Email, password, and optional
          profile details when you register.
        </li>
        <li>
          <strong>Subscription Data:</strong> Services you track in CashDuezy
          (names, costs, billing cycles, categories).
        </li>
        <li>
          <strong>Payment Information:</strong> Handled securely by{" "}
          <Link
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Stripe
          </Link>
          . We do not store full credit card numbers.
        </li>
        <li>
          <strong>Bank Data (Optional):</strong> If you connect accounts via{" "}
          <Link
            href="https://plaid.com/legal/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Plaid
          </Link>
          , Plaid may share account and transaction details with us to identify
          recurring subscriptions. We never see your login credentials.
        </li>
        <li>
          <strong>Usage & Device Data:</strong> IP address, browser, OS,
          interactions with the Service, and cookies.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide, personalize, and improve the Service</li>
        <li>Send subscription reminders and account notifications</li>
        <li>Process payments and manage billing</li>
        <li>Analyze usage trends and improve performance</li>
        <li>Ensure security, prevent fraud, and enforce our Terms</li>
        <li>Comply with legal obligations and financial regulations</li>
      </ul>

      <h2>3. How We Share Information</h2>
      <ul>
        <li>
          <strong>Service Providers:</strong> Hosting, email delivery,
          analytics, and customer support platforms.
        </li>
        <li>
          <strong>Stripe:</strong> For payment processing. Card data goes
          directly to Stripe.
        </li>
        <li>
          <strong>Plaid:</strong> For optional bank connections. Data shared is
          limited to identifying subscriptions.
        </li>
        <li>
          <strong>Legal & Safety:</strong> To comply with laws, enforce Terms,
          or respond to lawful requests.
        </li>
        <li>
          <strong>Business Transfers:</strong> If we merge, sell, or are
          acquired, your data may transfer as part of that transaction.
        </li>
        <li>
          <strong>With Your Consent:</strong> If we ever share beyond these
          purposes, we’ll ask first.
        </li>
      </ul>

      <h2>4. Cookies & Tracking</h2>
      <p>
        We use cookies to keep you logged in, remember preferences (like dark
        mode), and measure site usage. You may block cookies in your browser,
        though some features may not work properly.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We protect your data with encryption (TLS in transit, AES at rest),
        secure hosting, and strict access controls. Payments are PCI-DSS
        compliant via Stripe. Plaid connections are encrypted and secure. No
        method of transmission is 100% secure, but we take all reasonable steps
        to protect your information.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We keep your information as long as your account is active. You may
        delete your account at any time, and we will erase or anonymize your
        data except where retention is required by law (e.g., payment records).
      </p>

      <h2>7. Your Rights</h2>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request corrections or updates</li>
        <li>Delete your account and data (“Right to be Forgotten”)</li>
        <li>Export your data (portability)</li>
        <li>Opt-out of marketing emails anytime</li>
        <li>
          California & EU users: additional rights under CCPA and GDPR apply
        </li>
      </ul>

      <h2>8. International Transfers</h2>
      <p>
        CashDuezy is based in the U.S. By using our Service, you consent to the
        transfer and processing of your data in the U.S. and other countries
        where we operate. We rely on safeguards such as Standard Contractual
        Clauses (SCCs) for EU data transfers.
      </p>

      <h2>9. Children’s Privacy</h2>
      <p>
        Our Service is not directed to children under 18. We do not knowingly
        collect data from children under 13. If we learn we have, we’ll delete
        it promptly.
      </p>

      <h2>10. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. If changes are
        significant, we will notify you via email or in-app notice. Continued
        use after updates means you accept the revised Policy.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        Questions? Email us at{" "}
        <Link href="mailto:support@cashduezy.com" className="text-blue-600 underline">
          support@cashduezy.com
        </Link>
        .
      </p>
    </main>
  );
}
