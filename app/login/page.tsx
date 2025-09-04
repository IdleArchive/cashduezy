"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import HCaptcha from "@hcaptcha/react-hcaptcha";

type BtnColor = "violet" | "emerald";
const MIN_PASSWORD_LEN = 6;

export default function LoginPage() {
  const router = useRouter();

  // ---------- State ----------
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

  // Remember email UX
  const [rememberEmail, setRememberEmail] = useState(true);

  // ---------- Captcha ----------
  const captchaRef = useRef<HCaptcha | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaMessage, setCaptchaMessage] = useState<{
    text: string;
    tone: "info" | "success" | "warning" | "error";
  }>({ text: "Please complete the captcha to continue.", tone: "info" });

  const resetCaptcha = () => {
    try {
      captchaRef.current?.resetCaptcha();
    } catch {}
    setCaptchaToken(null);
    setCaptchaMessage({
      text: "Please complete the captcha to continue.",
      tone: "info",
    });
  };

  // ---------- Focus management ----------
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const signupEmailRef = useRef<HTMLInputElement | null>(null);
  const forgotEmailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Autofocus the first visible field on mode change
    const t = setTimeout(() => {
      if (isForgotMode) {
        forgotEmailRef.current?.focus();
      } else if (isSignUpMode) {
        signupEmailRef.current?.focus();
      } else {
        loginEmailRef.current?.focus();
      }
    }, 30);
    return () => clearTimeout(t);
  }, [isForgotMode, isSignUpMode]);

  // ---------- Prefill returning user email ----------
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lastAuthEmail");
      if (stored) {
        setLoginForm((p) => ({ ...p, email: stored }));
        setForgotEmail(stored);
      }
    } catch {}
  }, []);

  // If already logged in, send to dashboard
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) router.replace("/dashboard");
      } catch {}
    })();
  }, [router]);

  // Save email on success
  const maybeRememberEmail = (email: string) => {
    try {
      if (rememberEmail && email) {
        localStorage.setItem("lastAuthEmail", email);
      }
    } catch {}
  };

  // Clear captcha when switching flows (so user must verify for each sensitive action)
  useEffect(() => {
    resetCaptcha();
  }, [isForgotMode, isSignUpMode]);

  // ---------- Helpers ----------
  const sanitizeEmail = (v: string) => v.trim().toLowerCase();
  const sanitizePassword = (v: string) => v.trim();

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void, disabled: boolean) => {
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      action();
    }
  };

  // Small label under captcha to show status
  const CaptchaStatus = () => {
    const toneToColor: Record<typeof captchaMessage.tone, string> = {
      info: "text-gray-300",
      success: "text-emerald-400",
      warning: "text-amber-400",
      error: "text-rose-400",
    };
    return (
      <div className="flex items-center justify-between mt-2">
        <p className={`text-xs ${toneToColor[captchaMessage.tone]}`} aria-live="polite" role="status">
          {captchaMessage.text}
        </p>
        <button
          type="button"
          onClick={resetCaptcha}
          className="text-xs underline text-gray-400 hover:text-gray-200"
          title="Reset captcha"
          aria-label="Reset captcha"
        >
          Reset
        </button>
      </div>
    );
  };

  // Reusable button
  const ActionButton = ({
    onClick,
    disabled,
    saving,
    savingText,
    defaultText,
    color,
    type = "button",
  }: {
    onClick: () => void;
    disabled: boolean;
    saving: boolean;
    savingText: string;
    defaultText: string;
    color: BtnColor;
    type?: "button" | "submit";
  }) => {
    const base =
      color === "violet"
        ? "bg-violet-600 hover:bg-violet-500"
        : "bg-emerald-600 hover:bg-emerald-500";
    const disabledBase = color === "violet" ? "bg-violet-800" : "bg-emerald-800";

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
          disabled ? `${disabledBase} cursor-not-allowed opacity-80` : base
        }`}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin opacity-90" />}
        <span className={`transition-transform duration-200 ${saving ? "translate-x-1" : ""}`}>
          {saving ? savingText : defaultText}
        </span>
      </button>
    );
  };

  // Transition wrapper (unmounts when hidden to avoid multiple hCaptcha instances)
  const TransitionWrapper = ({
    show,
    children,
  }: {
    show: boolean;
    children: (live: boolean) => React.ReactNode;
  }) => {
    if (!show) return null;
    return (
      <div className="transition-all duration-300 ease-in-out transform opacity-100 translate-x-0">
        {children(true)}
      </div>
    );
  };

  // ---------- Derived "can submit" flags ----------
  const canLogin =
    !!loginForm.email &&
    !!loginForm.password &&
    loginForm.password.length >= MIN_PASSWORD_LEN &&
    !!captchaToken &&
    !loginSaving &&
    !isSignUpMode &&
    !isForgotMode;

  const canSignUp =
    !!signUpForm.email &&
    !!signUpForm.password &&
    signUpForm.password.length >= MIN_PASSWORD_LEN &&
    !!captchaToken &&
    !signUpSaving &&
    isSignUpMode;

  const canForgot = !!forgotEmail && !!captchaToken && !forgotSaving && isForgotMode;

  // ---------- API helpers ----------
  const verifyCaptchaServerSide = async (token: string) => {
    const res = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return res.json();
  };

  // ---------- Auth Actions ----------
  const handleLogin = async () => {
    if (loginSaving) return;
    setLoginSaving(true);

    const email = sanitizeEmail(loginForm.email);
    const password = sanitizePassword(loginForm.password);

    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoginSaving(false);
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
      setLoginSaving(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setLoginSaving(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify?.success) {
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

    maybeRememberEmail(email);
    toast.success("Logged in successfully");
    resetCaptcha();
    setTimeout(() => router.push("/dashboard"), 400);
    setLoginSaving(false);
  };

  const handleSignUp = async () => {
    if (signUpSaving) return;
    setSignUpSaving(true);

    const email = sanitizeEmail(signUpForm.email);
    const password = sanitizePassword(signUpForm.password);

    if (!email || !password) {
      toast.error("Please provide both email and password");
      setSignUpSaving(false);
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LEN} characters`);
      setSignUpSaving(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setSignUpSaving(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify?.success) {
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

    maybeRememberEmail(email);
    toast.success("Account created successfully!");
    resetCaptcha();

    // Pro-redirect edge
    setTimeout(() => {
      if (isProSignup) {
        router.push("/upgrade");
      } else {
        router.push("/dashboard");
      }
    }, 400);

    setSignUpSaving(false);
  };

  const handleForgotPassword = async () => {
    if (forgotSaving) return;
    setForgotSaving(true);

    const email = sanitizeEmail(forgotEmail);
    if (!email) {
      toast.error("Please enter your email");
      setForgotSaving(false);
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      setForgotSaving(false);
      return;
    }

    try {
      const verify = await verifyCaptchaServerSide(captchaToken);
      if (!verify?.success) {
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
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/update-password` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
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

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full shadow-lg overflow-hidden">
        <h1 className="text-2xl font-bold text-center mb-2">
          {isForgotMode ? "Reset Password" : isSignUpMode ? "Sign Up" : "Log In"}
        </h1>

        {/* Helper subheader / remember email */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="accent-violet-500"
              aria-label="Remember my email on this device"
            />
            Remember my email on this device
          </label>
          <span className="text-[11px] text-gray-400">
            {isSignUpMode ? "Create your account" : isForgotMode ? "Get a reset link" : "Welcome back"}
          </span>
        </div>

        {/* LOGIN */}
        <TransitionWrapper show={!isSignUpMode && !isForgotMode}>
          {(live) => (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canLogin) handleLogin();
              }}
              className="space-y-3"
              aria-live="polite"
            >
              <input
                ref={loginEmailRef}
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, handleLogin, !canLogin)}
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                inputMode="email"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-violet-500 transition-all"
                aria-label="Email address"
                required
              />

              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, handleLogin, !canLogin)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-violet-500 transition-all"
                  aria-label="Password"
                  required
                  minLength={MIN_PASSWORD_LEN}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  aria-pressed={showLoginPassword}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Visible Captcha */}
              <div className="mt-1">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                  onVerify={(token: string) => {
                    setCaptchaToken(token);
                    setCaptchaMessage({ text: "Captcha verified.", tone: "success" });
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha expired. Please verify again.", tone: "warning" });
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha error. Please retry or reset.", tone: "error" });
                  }}
                  ref={captchaRef}
                />
                <CaptchaStatus />
              </div>

              <ActionButton
                type="submit"
                onClick={() => {}}
                disabled={!canLogin}
                saving={loginSaving}
                savingText="Logging in..."
                defaultText="Log In"
                color="violet"
              />

              <div className="text-sm text-center mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                  }}
                  className="underline text-violet-400 hover:text-violet-300 transition"
                >
                  Forgot password?
                </button>
                <p className="text-gray-300">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(true);
                    }}
                    className="underline text-violet-400 hover:text-violet-300 transition"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}
        </TransitionWrapper>

        {/* SIGN UP */}
        <TransitionWrapper show={isSignUpMode}>
          {(live) => (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSignUp) handleSignUp();
              }}
              className="space-y-3"
            >
              <input
                ref={signupEmailRef}
                type="email"
                placeholder="Email"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, handleSignUp, !canSignUp)}
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                inputMode="email"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-emerald-500 transition-all"
                aria-label="Email address"
                required
              />

              <div className="relative">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, handleSignUp, !canSignUp)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-emerald-500 transition-all"
                  aria-label="Set a password"
                  required
                  minLength={MIN_PASSWORD_LEN}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword((s) => !s)}
                  aria-pressed={showSignUpPassword}
                  aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  id="pro-upgrade"
                  type="checkbox"
                  checked={isProSignup}
                  onChange={(e) => setIsProSignup(e.target.checked)}
                  className="accent-emerald-500"
                />
                <label htmlFor="pro-upgrade" className="cursor-pointer">
                  I want to upgrade to Pro after sign up
                </label>
              </div>

              {/* Visible Captcha */}
              <div className="mt-1">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                  onVerify={(token: string) => {
                    setCaptchaToken(token);
                    setCaptchaMessage({ text: "Captcha verified.", tone: "success" });
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha expired. Please verify again.", tone: "warning" });
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha error. Please retry or reset.", tone: "error" });
                  }}
                  ref={captchaRef}
                />
                <CaptchaStatus />
              </div>

              <ActionButton
                type="submit"
                onClick={() => {}}
                disabled={!canSignUp}
                saving={signUpSaving}
                savingText="Creating..."
                defaultText={isProSignup ? "Sign Up & Upgrade" : "Sign Up"}
                color="emerald"
              />

              <div className="text-sm text-center mt-3">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="underline text-violet-400 hover:text-violet-300 transition"
                >
                  Log In
                </button>
              </div>
            </form>
          )}
        </TransitionWrapper>

        {/* FORGOT PASSWORD */}
        <TransitionWrapper show={isForgotMode}>
          {(live) => (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canForgot) handleForgotPassword();
              }}
              className="space-y-3"
            >
              <input
                ref={forgotEmailRef}
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleForgotPassword, !canForgot)}
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                inputMode="email"
                className="w-full px-3 py-2 rounded-md border bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-violet-500 transition-all"
                aria-label="Email for reset link"
                required
              />

              {/* Visible Captcha */}
              <div className="mt-1">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                  onVerify={(token: string) => {
                    setCaptchaToken(token);
                    setCaptchaMessage({ text: "Captcha verified.", tone: "success" });
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha expired. Please verify again.", tone: "warning" });
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    setCaptchaMessage({ text: "Captcha error. Please retry or reset.", tone: "error" });
                  }}
                  ref={captchaRef}
                />
                <CaptchaStatus />
              </div>

              <ActionButton
                type="submit"
                onClick={() => {}}
                disabled={!canForgot}
                saving={forgotSaving}
                savingText="Sending..."
                defaultText="Send Reset Link"
                color="violet"
              />

              <div className="text-sm text-center mt-3">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="underline text-violet-400 hover:text-violet-300 transition"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </TransitionWrapper>

        {/* Footer fine print for hCaptcha / privacy */}
        <p className="mt-6 text-[11px] text-gray-400 text-center">
          This site is protected by hCaptcha and its{" "}
          <a
            href="https://www.hcaptcha.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-200"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://www.hcaptcha.com/terms"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-200"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
