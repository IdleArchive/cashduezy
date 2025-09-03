"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardContent from "./DashboardContent";

export default function DashboardPageWrapper() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // 🚪 If no session, send user back to homepage
          router.replace("/");
        } else {
          setLoggedIn(true);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  // --- Loading state while checking session ---
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-200">
        Checking session...
      </div>
    );
  }

  // --- Redirecting state ---
  if (!loggedIn) {
    return null; // ✅ Don’t render anything while redirecting
  }

  // --- Dashboard with suspense fallback ---
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-200">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}