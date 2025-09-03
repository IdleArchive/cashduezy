"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function LoginPage() {
  const router = useRouter();

  // ----- State -----
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginSaving, setLoginSaving] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signUpForm, setSignUpForm] = useState({ email: "", password: "" });
  const [signUpSaving, setSignUpSaving] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isProSignup, setIsProSignup] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSaving, setForgotSaving] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // ----- Captcha -----
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // ----- Login -----
  const handleLogin = async () => {
    setLoginSaving(true);
    const { email, password } = loginForm;

    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoginSaving(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      toast.error(error?.message || "Login failed");
      setLoginSaving(false);
      return;
    }

    toast.success("Logged in successfully");
    setTimeout(() => router.push("/dashboard"), 500);
    setLoginSaving(false);
  };

  // ----- Sign Up -----
  const handleSignUp = async () => {
    setSignUpSaving(true);
    const { email, password } = signUpForm;

    if (!email || !password) {
      toast.error("Please provide both email and password");
      setSignUpSaving(false);
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the Captcha");
      setSignUpSaving(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken, // ✅ pass captcha token to Supabase
      },
    });

    if (error || !data?.user) {
      toast.error(error?.message || "Sign up failed");
      setSignUpSaving(false);
      return;
    }

    toast.success("Account created successfully!");
    setTimeout(() => router.push("/dashboard"), 500);
    setSignUpSaving(false);
  };

  // ----- Forgot Password -----
  const handleForgotPassword = async () => {
    setForgotSaving(true);
    if (!forgotEmail) {
      toast.error("Please enter your email");
      setForgotSaving(false);
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the Captcha");
      setForgotSaving(false);
      return;
    }

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/update-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo,
        captchaToken, // ✅ pass captcha token
      });

      if (error) console.error("Reset password error:", error);
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotMode(false);
    } catch {
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotMode(false);
    } finally {
      setForgotSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isForgotMode ? "Reset Password" : isSignUpMode ? "Sign Up" : "Log In"}
        </h1>

        {/* Login */}
        {!isSignUpMode && !isForgotMode && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3"
            />
            <div className="relative mb-3">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showLoginPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={loginSaving}
              className="w-full py-2 rounded-md bg-violet-600 hover:bg-violet-500 font-medium"
            >
              {loginSaving ? "Logging in..." : "Log In"}
            </button>
            <div className="text-sm text-center mt-4 space-y-2">
              <button
                onClick={() => setIsForgotMode(true)}
                className="underline text-violet-400"
              >
                Forgot password?
              </button>
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsSignUpMode(true)}
                  className="underline text-violet-400"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </>
        )}

        {/* Signup */}
        {isSignUpMode && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={signUpForm.email}
              onChange={(e) =>
                setSignUpForm({ ...signUpForm, email: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3"
            />
            <div className="relative mb-3">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpForm.password}
                onChange={(e) =>
                  setSignUpForm({ ...signUpForm, password: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showSignUpPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* ✅ Captcha Widget */}
            <div className="mb-3">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={(token: string) => setCaptchaToken(token)}
                ref={captchaRef}
              />
            </div>

            <button
              onClick={handleSignUp}
              disabled={signUpSaving}
              className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 font-medium"
            >
              {signUpSaving
                ? "Creating..."
                : isProSignup
                ? "Sign Up & Upgrade"
                : "Sign Up"}
            </button>
            <div className="text-sm text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUpMode(false)}
                className="underline text-violet-400"
              >
                Log In
              </button>
            </div>
          </>
        )}

        {/* Forgot Password */}
        {isForgotMode && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-4"
            />

            {/* ✅ Captcha Widget */}
            <div className="mb-3">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={(token: string) => setCaptchaToken(token)}
                ref={captchaRef}
              />
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={forgotSaving}
              className="w-full py-2 rounded-md bg-violet-600 hover:bg-violet-500 font-medium"
            >
              {forgotSaving ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-sm text-center mt-4">
              <button
                onClick={() => setIsForgotMode(false)}
                className="underline text-violet-400"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
