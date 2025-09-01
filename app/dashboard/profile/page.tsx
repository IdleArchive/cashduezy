"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle, KeyRound, Mail, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current user info
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to fetch user");
      } else {
        setEmail(data.user?.email ?? "");
      }
    };
    getUser();
  }, []);

  // ===== Handlers =====
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  };

  const handleEmailUpdate = async () => {
    if (!newEmail) return toast.error("Enter a new email");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false);

    if (error) toast.error(error.message);
    else {
      toast.success("Email update requested. Check your inbox.");
      setEmail(newEmail);
      setNewEmail("");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) return toast.error("Enter a new password");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    toast("Account deletion coming soon", { icon: "⚠️" });
    // Option: add a Supabase edge function later to securely delete
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <UserCircle className="w-12 h-12 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Your Account</h1>
            <p className="text-gray-400">Manage email and password settings</p>
          </div>
        </div>

        {/* Current email */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" /> Current Email
          </label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400"
          />
        </div>

        {/* Update email */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Update Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
            />
            <button
              onClick={handleEmailUpdate}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        {/* Update password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Update Password
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
            />
            <button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        {/* Account actions */}
        <div className="flex justify-between items-center border-t border-gray-700 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 font-semibold"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
          >
            <Trash2 className="w-5 h-5" /> Delete Account
          </button>
        </div>

        {/* Back link */}
        <div className="pt-4 text-center">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}