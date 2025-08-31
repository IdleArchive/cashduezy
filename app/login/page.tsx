// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      toast.error("Login failed. Please check your email and password.");
      setLoading(false);
      return;
    }

    // ✅ If login works, cookies should now be set by Supabase
    toast.success("Login successful!");

    // Check if we had a redirect param (like /login?redirect=/dashboard)
    const redirectTo = searchParams.get("redirect") || "/dashboard";

    // ✅ Push user into dashboard (or intended page)
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">CashDuezy Login</h1>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
        />

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Your Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
