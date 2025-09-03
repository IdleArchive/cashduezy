"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

  const resetCaptcha = () => {
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
  };

  const executeCaptcha = async () => {
    return new Promise<string>((resolve, reject) => {
      captchaRef.current?.execute();
      const check = setInterval(() => {
        if (captchaToken) {
          clearInterval(check);
          resolve(captchaToken);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(check);
        reject("Captcha timeout");
      }, 10000);
    });
  };

  // ----- Auth Actions -----
  const handleLogin = async () => {
    if (loginSaving) return;
    setLoginSaving(true);

    const { email, password } = loginForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoginSaving(false);
      resetCaptcha();
      return;
    }

    try {
      const token = await executeCaptcha();
      const res = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const verify = await res.json();
      if (!verify.success) {
        toast.error("Captcha verification failed");
        setLoginSaving(false);
        resetCaptcha();
        return;
      }
    } catch {
      toast.error("Captcha check error, please retry");
      setLoginSaving(false);
      resetCaptcha();
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      toast.error(error?.message || "Login failed");
      setLoginSaving(false);
      resetCaptcha();
      return;
    }

    toast.success("Logged in successfully");
    resetCaptcha();
    setTimeout(() => router.push("/dashboard"), 500);
    setLoginSaving(false);
  };

  const handleSignUp = async () => {
    if (signUpSaving) return;
    setSignUpSaving(true);

    const { email, password } = signUpForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setSignUpSaving(false);
      resetCaptcha();
      return;
    }

    try {
      const token = await executeCaptcha();
      const res = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const verify = await res.json();
      if (!verify.success) {
        toast.error("Captcha verification failed");
        setSignUpSaving(false);
        resetCaptcha();
        return;
      }
    } catch {
      toast.error("Captcha check error, please retry");
      setSignUpSaving(false);
      resetCaptcha();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data?.user) {
      toast.error(error?.message || "Sign up failed");
      setSignUpSaving(false);
      resetCaptcha();
      return;
    }

    toast.success("Account created successfully!");
    resetCaptcha();
    setTimeout(() => router.push("/dashboard"), 500);
    setSignUpSaving(false);
  };

  const handleForgotPassword = async () => {
    if (forgotSaving) return;
    setForgotSaving(true);

    if (!forgotEmail) {
      toast.error("Please enter your email");
      setForgotSaving(false);
      resetCaptcha();
      return;
    }

    try {
      const token = await executeCaptcha();
      const res = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const verify = await res.json();
      if (!verify.success) {
        toast.error("Captcha verification failed");
        setForgotSaving(false);
        resetCaptcha();
        return;
      }
    } catch {
      toast.error("Captcha check error, please retry");
      setForgotSaving(false);
      resetCaptcha();
      return;
    }

    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo });
      if (error) console.error("Reset password error:", error);
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotMode(false);
    } catch {
      toast.success("If an account exists, a reset link has been sent.");
      setIsForgotMode(false);
    } finally {
      setForgotSaving(false);
      resetCaptcha();
    }
  };

  // ----- Helpers -----
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void, disabled: boolean) => {
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      action();
    }
  };

  const ActionButton = ({
    onClick,
    disabled,
    saving,
    savingText,
    defaultText,
    color,
  }: {
    onClick: () => void;
    disabled: boolean;
    saving: boolean;
    savingText: string;
    defaultText: string;
    color: "violet" | "emerald";
  }) => {
    const base = color === "violet" ? "bg-violet-600 hover:bg-violet-500" : "bg-emerald-600 hover:bg-emerald-500";
    const disabledBase = color === "violet" ? "bg-violet-800" : "bg-emerald-800";

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
          disabled ? `${disabledBase} cursor-not-allowed opacity-80` : base
        }`}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin opacity-90 transition-opacity duration-200" />}
        <span className={`transition-transform duration-200 ${saving ? "translate-x-1 opacity-90" : "opacity-100"}`}>
          {saving ? savingText : defaultText}
        </span>
      </button>
    );
  };

  // ----- Form Transition Wrapper -----
  const TransitionWrapper = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
    return (
      <div
        className={`absolute top-0 left-0 w-full transition-all duration-300 ease-in-out transform ${
          show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
        }`}
      >
        {children}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full shadow-lg overflow-hidden min-h-[420px]">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isForgotMode ? "Reset Password" : isSignUpMode ? "Sign Up" : "Log In"}
        </h1>

        <div className="relative min-h-[280px]">
          {/* Login */}
          <TransitionWrapper show={!isSignUpMode && !isForgotMode}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, handleLogin, loginSaving)}
                autoComplete="username"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3 focus:ring-2 focus:ring-violet-500 transition-all"
              />
              <div className="relative mb-3">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, handleLogin, loginSaving)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <ActionButton
                onClick={handleLogin}
                disabled={loginSaving}
                saving={loginSaving}
                savingText="Logging in..."
                defaultText="Log In"
                color="violet"
              />
              <div className="text-sm text-center mt-4 space-y-2">
                <button onClick={() => setIsForgotMode(true)} className="underline text-violet-400 hover:text-violet-300 transition">
                  Forgot password?
                </button>
                <p>
                  Don’t have an account?{" "}
                  <button onClick={() => setIsSignUpMode(true)} className="underline text-violet-400 hover:text-violet-300 transition">
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </TransitionWrapper>

          {/* Signup */}
          <TransitionWrapper show={isSignUpMode}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, handleSignUp, signUpSaving)}
                autoComplete="username"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-3 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <div className="relative mb-3">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, handleSignUp, signUpSaving)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <ActionButton
                onClick={handleSignUp}
                disabled={signUpSaving}
                saving={signUpSaving}
                savingText="Creating..."
                defaultText={isProSignup ? "Sign Up & Upgrade" : "Sign Up"}
                color="emerald"
              />
              <div className="text-sm text-center mt-4">
                Already have an account?{" "}
                <button onClick={() => setIsSignUpMode(false)} className="underline text-violet-400 hover:text-violet-300 transition">
                  Log In
                </button>
              </div>
            </div>
          </TransitionWrapper>

          {/* Forgot Password */}
          <TransitionWrapper show={isForgotMode}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleForgotPassword, forgotSaving)}
                autoComplete="username"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 mb-4 focus:ring-2 focus:ring-violet-500 transition-all"
              />
              <ActionButton
                onClick={handleForgotPassword}
                disabled={forgotSaving}
                saving={forgotSaving}
                savingText="Sending..."
                defaultText="Send Reset Link"
                color="violet"
              />
              <div className="text-sm text-center mt-4">
                <button onClick={() => setIsForgotMode(false)} className="underline text-violet-400 hover:text-violet-300 transition">
                  Back to Login
                </button>
              </div>
            </div>
          </TransitionWrapper>
        </div>

        {/* Invisible Captcha */}
        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
          size="invisible"
          onVerify={(token: string) => setCaptchaToken(token)}
          ref={captchaRef}
        />
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
