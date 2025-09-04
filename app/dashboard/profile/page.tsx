"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  LogOut,
  UserCircle,
  KeyRound,
  Mail,
  Loader2,
  Trash2,
  ArrowLeft,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

/** Reusable button with variants */
function ActionButton({
  type = "button",
  onClick,
  loading,
  children,
  variant = "primary",
  className = "",
  ariaLabel,
}: {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  ariaLabel?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-100 focus:ring-gray-600",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "text-gray-300 hover:text-gray-100 focus:ring-gray-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

/** Basic confirm modal for destructive actions */
function ConfirmModal({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-red-400">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <ActionButton variant="secondary" onClick={onCancel}>
            {cancelText}
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            ariaLabel="Confirm destructive action"
          >
            {confirmText}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  // Displayed values
  const [email, setEmail] = useState<string>("");

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Loading states
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch current user info
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to fetch user");
        return;
      }
      setEmail(data.user?.email ?? "");
    })();
  }, []);

  // ===== Handlers =====
  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      await supabase.auth.signOut();
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Enter a new email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setLoadingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Email update requested. Check your inbox.");
      setEmail(newEmail);
      setNewEmail("");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      setLoadingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated successfully");
      setNewPassword("");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoadingDelete(true);

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast.error("Failed to fetch user");
        return;
      }

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete account");
        return;
      }

      toast.success("Account deleted successfully");
      setShowDeleteConfirm(false);

      await supabase.auth.signOut();
      router.push("/goodbye");
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoadingDelete(false);
    }
  };

  // ===== UI =====
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-start justify-center px-4 py-8 md:items-center md:px-6 md:py-12">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-gray-800 px-6 py-5 md:px-8">
            <UserCircle className="h-10 w-10 text-blue-400 md:h-12 md:w-12" />
            <div>
              <h1 className="text-xl font-bold md:text-2xl">Account Settings</h1>
              <p className="text-sm text-gray-400">
                Manage your personal details and security.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 px-6 py-6 md:px-8 md:py-8">
            {/* Current email */}
            <section className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4" />
                Current Email
              </label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-400"
              />
            </section>

            {/* Update email */}
            <section className="space-y-3">
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <div className="flex-1">
                  <input
                    id="newEmail"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <ActionButton type="submit" loading={loadingEmail} variant="primary">
                  Save
                </ActionButton>
              </form>
              <p className="text-xs text-gray-500">
                We'll send a verification link to confirm your new email.
              </p>
            </section>

            {/* Update password */}
            <section className="space-y-3">
              <form onSubmit={handlePasswordSubmit} className="flex gap-2">
                <div className="flex-1">
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <ActionButton type="submit" loading={loadingPassword} variant="primary">
                  Save
                </ActionButton>
              </form>
              <p className="text-xs text-gray-500">
                Use at least 8 characters with a mix of letters, numbers, and symbols.
              </p>
            </section>

            {/* Blog Admin (only for your email) */}
            {email === "b.sasuta@gmail.com" && (
              <section className="border-t border-gray-800 pt-6">
                <Link
                  href="/blog/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  <FileText className="h-4 w-4" />
                  Write New Blog Post
                </Link>
              </section>
            )}

            {/* Account actions */}
            <section className="flex items-center justify-between border-t border-gray-800 pt-6">
              <ActionButton
                onClick={handleLogout}
                loading={loadingLogout}
                variant="secondary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </ActionButton>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-5 w-5" />
                Delete Account
              </button>
            </section>

            {/* Back link */}
            <div className="pt-2 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        title="Confirm Account Deletion"
        description="This action cannot be undone. All your data and settings will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        open={showDeleteConfirm}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={loadingDelete}
      />
    </main>
  );
}
