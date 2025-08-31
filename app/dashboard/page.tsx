// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPageWrapper() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // 🚪 If no session, send back to homepage
        router.push("/");
      } else {
        setLoggedIn(true);
      }
      setChecking(false);
    };

    checkSession();
  }, [router]);

  if (checking) {
    return <div className="p-8 text-center">Checking session...</div>;
  }

  if (!loggedIn) {
    return <div className="p-8 text-center">Redirecting...</div>;
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}