// app/FooterClient.tsx
"use client";

import Link from "next/link";

export default function FooterClient() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-sm py-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Links */}
        <div>
          <h3 className="font-semibold mb-2 text-white">Company</h3>
          <ul className="space-y-1 text-white">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/changelog" className="hover:underline">Changelog</Link></li>
            <li><Link href="/support" className="hover:underline">Support</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2 text-white">Contact</h3>
          <a href="mailto:support@cashduezy.com" className="underline text-white">
            support@cashduezy.com
          </a>
        </div>

        {/* Legal */}
        <div className="text-gray-500 md:text-right space-y-2">
          <p>&copy; {new Date().getFullYear()} CashDuezy. All rights reserved.</p>
          <div className="flex gap-4 justify-center md:justify-end text-sm">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}