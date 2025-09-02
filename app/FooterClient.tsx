// app/FooterClient.tsx
"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * FooterClient — Unified site-wide legal link handler
 *
 * PURPOSE:
 * - Show Privacy Policy and Terms of Service consistently everywhere.
 * - Avoid sending users to raw `/` homepage with no context.
 * - If already inside `/dashboard`, trigger the DashboardContent modal directly.
 * - If outside dashboard, push to `/dashboard?legal=privacy|terms` so
 *   the guard + modal logic inside DashboardContent can auto-open.
 * - Works both for logged-in and logged-out users.
 *
 * USAGE:
 * Place <FooterClient /> in your layout/footer. Styling can be customized
 * via the `className` or `linkClassName` props.
 */
type FooterClientProps = {
  className?: string;
  linkClassName?: string;
};

export default function FooterClient({
  className = "flex gap-6 justify-center md:justify-end text-sm",
  linkClassName = "hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded transition-colors duration-150",
}: FooterClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect if user is on any dashboard sub-route (/dashboard or /dashboard/*)
  const isOnDashboard = useMemo(
    () => (pathname || "").startsWith("/dashboard"),
    [pathname]
  );

  /**
   * Open modal helper
   *
   * - If already on dashboard: dispatch an event → DashboardContent listens.
   * - If off dashboard: push a URL with ?legal=privacy|terms → triggers auto-open useEffect.
   */
  const handleOpen = useCallback(
    (type: "privacy" | "terms") => {
      if (typeof window === "undefined") return;

      if (isOnDashboard) {
        // Inside dashboard → directly fire custom event
        window.dispatchEvent(
          new CustomEvent("openFooterModal", { detail: type })
        );
      } else {
        // Outside dashboard → navigate with query param
        const next = new URLSearchParams(searchParams?.toString() ?? "");
        next.set("legal", type);
        router.push(`/dashboard?${next.toString()}`);
      }
    },
    [isOnDashboard, router, searchParams]
  );

  return (
    <footer
      className={className}
      role="contentinfo"
      aria-label="Legal and informational links"
    >
      {/* Privacy Policy Button */}
      <button
        type="button"
        onClick={() => handleOpen("privacy")}
        className={linkClassName}
        aria-label="View the Privacy Policy"
      >
        Privacy Policy
      </button>

      {/* Terms of Service Button */}
      <button
        type="button"
        onClick={() => handleOpen("terms")}
        className={linkClassName}
        aria-label="View the Terms of Service"
      >
        Terms of Service
      </button>
    </footer>
  );
}