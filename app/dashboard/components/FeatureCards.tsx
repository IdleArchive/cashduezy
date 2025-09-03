"use client";

import React from "react";
import { Link as LinkIcon, UploadCloud, Bell, Users, Download } from "lucide-react";
import FeatureCard from "./FeatureCard";

interface FeatureCardsProps {
  cardBg: string;
  cardBorder: string;
  accentButton: (colour: "violet" | "emerald" | "rose") => string;

  // Handlers + state passed from DashboardContent
  onLink: () => void;
  onUpload: () => void;
  onAlerts: () => void;
  onShare: () => void;
  onExport: () => void;
  linkedAccounts: string[];
  isDark: boolean;
}

// ✅ Update FeatureCard’s expected type (fix for the error)
export interface FeatureCardProps {
  title: React.ReactNode; // was string before, now supports JSX
  description: string;
  cardBg: string;
  cardBorder: string;
  children?: React.ReactNode;
}

export default function FeatureCards({
  cardBg,
  cardBorder,
  accentButton,
  onLink,
  onUpload,
  onAlerts,
  onShare,
  onExport,
  linkedAccounts,
  isDark,
}: FeatureCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* --- Account Linking & Import --- */}
      <FeatureCard
        title={
          <span className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" /> Account Linking &amp; Import
          </span>
        }
        description="Connect your bank accounts or upload a CSV to automatically detect recurring charges."
        cardBg={cardBg}
        cardBorder={cardBorder}
      >
        <button
          onClick={onLink}
          className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("emerald")}`}
        >
          <LinkIcon className="w-4 h-4" /> Link Account
        </button>
        <button
          onClick={onUpload}
          className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}
        >
          <UploadCloud className="w-4 h-4" /> Import CSV
        </button>
        {linkedAccounts.length > 0 && (
          <ul className="mt-3 text-xs list-disc pl-4">
            {linkedAccounts.map((acc, idx) => (
              <li key={idx} className={isDark ? "text-gray-400" : "text-gray-600"}>
                {acc}
              </li>
            ))}
          </ul>
        )}
      </FeatureCard>

      {/* --- Alerts & Notifications --- */}
      <FeatureCard
        title={
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Alerts &amp; Notifications
          </span>
        }
        description="Stay on top of renewals, overspending and free trials with customizable alerts."
        cardBg={cardBg}
        cardBorder={cardBorder}
      >
        <button
          onClick={onAlerts}
          className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}
        >
          <Bell className="w-4 h-4" /> Manage Alerts
        </button>
      </FeatureCard>

      {/* --- Account Sharing --- */}
      <FeatureCard
        title={
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Account Sharing
          </span>
        }
        description="Invite family members or housemates to share your dashboard and collaborate."
        cardBg={cardBg}
        cardBorder={cardBorder}
      >
        <button
          onClick={onShare}
          className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}
        >
          <Users className="w-4 h-4" /> Share Dashboard
        </button>
      </FeatureCard>

      {/* --- Data Export --- */}
      <FeatureCard
        title={
          <span className="flex items-center gap-2">
            <Download className="w-5 h-5" /> Data Export
          </span>
        }
        description="Export your subscription data for budgeting or record keeping."
        cardBg={cardBg}
        cardBorder={cardBorder}
      >
        <button
          onClick={onExport}
          className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("emerald")}`}
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </FeatureCard>
    </div>
  );
}
