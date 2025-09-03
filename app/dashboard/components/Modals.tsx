// app/dashboard/components/Modals.tsx
"use client";

import React from "react";
import { LogIn, UserPlus, Download, Trash2 } from "lucide-react";

// === Modal State Shape ===
export interface ModalState {
  add: boolean;
  edit: boolean;
  delete: boolean;
  login: boolean;
  signup: boolean;
  forgot: boolean;
  link: boolean;
  upload: boolean;
  alerts: boolean;
  share: boolean;
  export: boolean;
  footer: null | "about" | "contact" | "privacy" | "terms";
  isPro: boolean;
}

// === Props from DashboardContent ===
interface ModalsProps {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;

  // Styling
  cardBg: string;
  cardBorder: string;
  neutralButton: string;
  accentButton: (c: "violet" | "emerald" | "rose") => string;
  isDark: boolean;

  // Data
  form: any;
  setForm: (v: any) => void;
  customName: string;
  setCustomName: (v: string) => void;
  editingSubscription: any;
  subscriptionToDelete: any;
  saving: boolean;
  loginForm: { email: string; password: string };
  signUpForm: { email: string; password: string };
  forgotEmail: string;
  forgotSaving: boolean;
  signUpSaving: boolean;
  loginSaving: boolean;
  showLoginPassword: boolean;
  showSignUpPassword: boolean;
  isPro: boolean;

  // Footer content
  aboutContent: React.ReactNode;
  contactContent: React.ReactNode;
  privacyContent: React.ReactNode;
  termsContent: React.ReactNode;

  // Handlers
  setEditingSubscription: (v: any) => void;
  handleAddSubscription: () => void;
  handleUpdateSubscription: () => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  setLoginForm: (v: any) => void;
  handleLogin: () => void;
  setSignUpForm: (v: any) => void;
  handleSignUp: () => void;
  setForgotEmail: (v: string) => void;
  handleForgotPassword: () => void;
  handleExportCSV: () => void;
  handleExportPDF: () => void;
}

// === Component ===
export default function Modals({
  modalState,
  setModalState,

  cardBg,
  cardBorder,
  neutralButton,
  accentButton,
  isDark,

  form,
  setForm,
  customName,
  setCustomName,
  editingSubscription,
  subscriptionToDelete,
  saving,
  loginForm,
  signUpForm,
  forgotEmail,
  forgotSaving,
  signUpSaving,
  loginSaving,
  showLoginPassword,
  showSignUpPassword,
  isPro,

  aboutContent,
  contactContent,
  privacyContent,
  termsContent,

  setEditingSubscription,
  handleAddSubscription,
  handleUpdateSubscription,
  handleConfirmDelete,
  handleCancelDelete,
  setLoginForm,
  handleLogin,
  setSignUpForm,
  handleSignUp,
  setForgotEmail,
  handleForgotPassword,
  handleExportCSV,
  handleExportPDF,
}: ModalsProps) {
  return (
    <>
      {/* === Add Subscription Modal === */}
      {modalState.add && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4">Add Subscription</h2>
            {!isPro && (
              <p className="text-sm text-red-500 mb-2">
                Free users can only add up to 3 subscriptions.
              </p>
            )}
            <button
              onClick={handleAddSubscription}
              disabled={saving}
              className={`${accentButton("emerald")} px-4 py-2 rounded-md`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, add: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Edit Subscription Modal === */}
      {modalState.edit && editingSubscription && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4">Edit Subscription</h2>
            <button
              onClick={handleUpdateSubscription}
              disabled={saving}
              className={`${accentButton("violet")} px-4 py-2 rounded-md`}
            >
              {saving ? "Updating..." : "Update"}
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, edit: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Delete Subscription Modal === */}
      {modalState.delete && subscriptionToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4">Delete Subscription</h2>
            <p className="text-sm mb-4">
              Are you sure you want to delete this subscription?
            </p>
            <button
              onClick={handleConfirmDelete}
              className={`${accentButton("rose")} px-4 py-2 rounded-md`}
            >
              Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Login Modal === */}
      {modalState.login && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5" /> Log In
            </h2>
            <button
              onClick={handleLogin}
              disabled={loginSaving}
              className={`${accentButton("emerald")} px-4 py-2 rounded-md`}
            >
              {loginSaving ? "Logging in..." : "Log In"}
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, login: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Signup Modal === */}
      {modalState.signup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Sign Up
            </h2>
            <button
              onClick={handleSignUp}
              disabled={signUpSaving}
              className={`${accentButton("violet")} px-4 py-2 rounded-md`}
            >
              {signUpSaving ? "Signing up..." : "Sign Up"}
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, signup: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Forgot Password Modal === */}
      {modalState.forgot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
            <button
              onClick={handleForgotPassword}
              disabled={forgotSaving}
              className={`${accentButton("emerald")} px-4 py-2 rounded-md`}
            >
              {forgotSaving ? "Sending..." : "Send Reset Email"}
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, forgot: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Export Modal === */}
      {modalState.export && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${cardBg} ${cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" /> Export Data
            </h2>
            <button
              onClick={handleExportCSV}
              className={`${accentButton("emerald")} px-4 py-2 rounded-md`}
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className={`${accentButton("violet")} px-4 py-2 rounded-md ml-2`}
            >
              Export PDF
            </button>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, export: false }))}
              className={`${neutralButton} px-4 py-2 rounded-md ml-2`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === Footer Modals === */}
      {modalState.footer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-lg ${cardBg} ${cardBorder}`}>
            {modalState.footer === "about" && aboutContent}
            {modalState.footer === "contact" && contactContent}
            {modalState.footer === "privacy" && privacyContent}
            {modalState.footer === "terms" && termsContent}
            <button
              onClick={() => setModalState((prev) => ({ ...prev, footer: null }))}
              className={`${neutralButton} px-4 py-2 rounded-md mt-4`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}