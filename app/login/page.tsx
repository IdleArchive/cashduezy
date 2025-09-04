"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const MIN_PASSWORD_LEN = 6;

export default function LoginPage() {
  const router = useRouter();

  // ----- State -----
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isProSignup, setIsProSignup] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Captcha
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Prefill returning user email
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lastAuthEmail");
      if (stored) {
        setLoginForm((p) => ({ ...p, email: stored }));
        setForgotEmail(stored);
      }
    } catch {}
  }, []);

  const maybeRememberEmail = (email: string) => {
    try {
      if (rememberEmail && email) {
        localStorage.setItem("lastAuthEmail", email);
      }
    } catch {}
  };

  // ----- Helpers -----
  const verifyCaptchaServerSide = async (token: string) => {
    const res = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return res.json();
  };

  // ----- Auth Actions -----
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const { email, password } = loginForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoading(false);
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
      setLoading(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setLoading(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify.success) {
        toast.error("Captcha failed");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        toast.error(error?.message || "Login failed");
      } else {
        maybeRememberEmail(email);
        toast.success("Logged in successfully");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);

    const { email, password } = signUpForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoading(false);
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
      setLoading(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setLoading(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify.success) {
        toast.error("Captcha failed");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data?.user) {
        toast.error(error?.message || "Sign up failed");
      } else {
        maybeRememberEmail(email);
        toast.success("Account created!");
        router.push(isProSignup ? "/upgrade" : "/dashboard");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  const handleForgotPassword = async () => {
    if (loading) return;
    setLoading(true);

    const email = forgotEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Please enter your email");
      setLoading(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setLoading(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify.success) {
        toast.error("Captcha failed");
        setLoading(false);
        return;
      }

      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) console.error(error);
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotMode(false);
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  // ----- UI -----
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isForgotMode ? "Reset Password" : isSignUpMode ? "Sign Up" : "Log In"}
        </h1>

        {/* Remember email */}
        <label className="flex items-center gap-2 text-xs text-gray-300 mb-4">
          <input
            type="checkbox"
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
            className="accent-violet-500"
          />
          Remember my email
        </label>

        {/* LOGIN */}
        {!isSignUpMode && !isForgotMode && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              autoComplete="username"
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              required
            />
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
                required
                minLength={MIN_PASSWORD_LEN}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div className="text-sm text-center mt-3 space-y-2">
              <button type="button" onClick={() => setIsForgotMode(true)} className="underline text-violet-400">
                Forgot password?
              </button>
              <p>
                Don’t have an account?{" "}
                <button type="button" onClick={() => setIsSignUpMode(true)} className="underline text-violet-400">
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* SIGN UP */}
        {isSignUpMode && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              placeholder="Email"
              value={signUpForm.email}
              onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
              autoComplete="username"
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              required
            />
            <div className="relative">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
                required
                minLength={MIN_PASSWORD_LEN}
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={isProSignup}
                onChange={(e) => setIsProSignup(e.target.checked)}
                className="accent-emerald-500"
              />
              Upgrade to Pro after sign up
            </label>

            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating..." : "Sign Up"}
            </button>

            <div className="text-sm text-center mt-3">
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignUpMode(false)} className="underline text-violet-400">
                Log In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT */}
        {isForgotMode && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoComplete="username"
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              required
            />

            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-sm text-center mt-3">
              <button type="button" onClick={() => setIsForgotMode(false)} className="underline text-violet-400">
                Back to Login
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-[11px] text-gray-400 text-center">
          This site is protected by hCaptcha and its{" "}
          <a href="https://www.hcaptcha.com/privacy" target="_blank" className="underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://www.hcaptcha.com/terms" target="_blank" className="underline">
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
