"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  // Login modal state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginSaving, setLoginSaving] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup modal state
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ email: "", password: "" });
  const [signUpSaving, setSignUpSaving] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isProSignup, setIsProSignup] = useState(false); // NEW: track free vs pro

  // Forgot password
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSaving, setForgotSaving] = useState(false);

  // Handle login
  const handleLogin = async () => {
    setLoginSaving(true);
    const { email, password } = loginForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoginSaving(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      toast.error(error?.message || "Login failed");
      setLoginSaving(false);
      return;
    }
    toast.success("Logged in successfully");
    setIsLoginOpen(false);
    router.push("/dashboard");
    setLoginSaving(false);
  };

  // Handle signup (free or pro)
  const handleSignUp = async (isPro = false) => {
    setSignUpSaving(true);
    const { email, password } = signUpForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setSignUpSaving(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data?.user) {
      toast.error(error?.message || "Sign up failed");
      setSignUpSaving(false);
      return;
    }

    toast.success("Account created successfully!");
    setIsSignUpOpen(false);

    if (isPro) {
      try {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: data.user.id,
            email,       // ✅ pass email to Stripe
            plan: "pro",
          }),
        });

        const { url } = await res.json();
        if (url) {
          window.location.href = url; // redirect to Stripe checkout
          return;
        }
      } catch (err) {
        console.error("Stripe checkout error:", err);
      }
    }

    // fallback: free users or Stripe error → dashboard
    router.push("/dashboard");
    setSignUpSaving(false);
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    setForgotSaving(true);
    if (!forgotEmail) {
      toast.error("Please enter your email");
      setForgotSaving(false);
      return;
    }
    try {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo });
      if (error) console.error("Reset password error:", error);
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotOpen(false);
    } catch (err) {
      console.error(err);
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotOpen(false);
    } finally {
      setForgotSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
        <Image src="/cashduezy_logo.png" alt="CashDuezy Logo" width={80} height={80} className="mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Take Control of Your Subscriptions</h1>
        <p className="text-lg text-gray-400 mb-8 max-w-xl">
          CashDuezy helps you track, manage, and save money on recurring services — all in one place.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsProSignup(false);
              setIsSignUpOpen(true);
            }}
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-lg font-medium"
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-lg font-medium flex items-center gap-2"
          >
            <LogIn className="w-5 h-5" /> Log In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Track Subscriptions</h2>
            <p className="text-gray-400">Manage and track all your recurring services in one place.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">Spending Insights</h2>
            <p className="text-gray-400">Visualize your spending with charts and monthly projections.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">Duplicate Alerts</h2>
            <p className="text-gray-400">Identify and cancel duplicate subscriptions easily.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">Customizable Theme</h2>
            <p className="text-gray-400">Switch between light and dark mode to match your style.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pricing</h2>
          <p className="text-gray-400 mb-12">
            Start free today. Upgrade to Pro anytime for more power and flexibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Get started with essential features.</p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Track up to 3 subscriptions</li>
                <li>✅ Spending insights & charts</li>
                <li>✅ Renewal reminders</li>
                <li>❌ No advanced analytics</li>
              </ul>
              <button
                onClick={() => {
                  setIsProSignup(false);
                  setIsSignUpOpen(true);
                }}
                className="mt-auto px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-900 border border-violet-600 rounded-2xl p-8 flex flex-col shadow-lg">
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">Unlock unlimited power.</p>
              <ul className="text-left space-y-3 mb-8">
                <li>✅ Unlimited subscriptions</li>
                <li>✅ Advanced spending analytics</li>
                <li>✅ Priority renewal reminders</li>
                <li>✅ Access to upcoming features first</li>
              </ul>
              <button
                onClick={() => {
                  setIsProSignup(true);
                  setIsSignUpOpen(true);
                }}
                className="mt-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Upgrade to Pro – $5/month
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © 2025 CashDuezy. All rights reserved.
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Log In</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3"
            />
            <div className="relative mb-3">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotOpen(true);
                  setForgotEmail(loginForm.email);
                }}
                className="text-sm underline text-violet-400 hover:text-violet-300"
              >
                Forgot your password?
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsLoginOpen(false)} className="px-4 py-2 rounded-md bg-gray-700">
                Cancel
              </button>
              <button
                onClick={handleLogin}
                disabled={loginSaving}
                className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500"
              >
                {loginSaving ? "Logging in..." : "Log In"}
              </button>
            </div>
            <div className="text-sm text-center mt-4">
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsSignUpOpen(true);
                }}
                className="underline text-violet-400 hover:text-violet-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignUpOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
            <input
              type="email"
              placeholder="Email"
              value={signUpForm.email}
              onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3"
            />
            <div className="relative mb-3">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsSignUpOpen(false)} className="px-4 py-2 rounded-md bg-gray-700">
                Cancel
              </button>
              <button
                onClick={() => handleSignUp(isProSignup)}
                disabled={signUpSaving}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500"
              >
                {signUpSaving ? "Creating..." : isProSignup ? "Sign Up & Upgrade" : "Sign Up"}
              </button>
            </div>
            <div className="text-sm text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUpOpen(false);
                  setIsLoginOpen(true);
                }}
                className="underline text-violet-400 hover:text-violet-300"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsForgotOpen(false)} className="px-4 py-2 rounded-md bg-gray-700">
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={forgotSaving}
                className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500"
              >
                {forgotSaving ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </main>
  );
}