"use client";

import { Crown } from "lucide-react";

interface UserAvatarProps {
  email: string | null;
  isPro?: boolean;
  size?: number;
}

const colors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-yellow-500",
  "bg-red-600",
];

export default function UserAvatar({ email, isPro = false, size = 32 }: UserAvatarProps) {
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  // Pick a consistent color per email
  const colorIndex = email
    ? email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  const bgColor = colors[colorIndex];
  const borderClass = isPro ? "border-2 border-yellow-400" : "";

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div
        className={`flex items-center justify-center rounded-full text-white font-bold ${bgColor} ${borderClass}`}
        style={{ width: size, height: size, fontSize: size / 2 }}
      >
        {initial}
      </div>

      {/* Crown overlay for Pro */}
      {isPro && (
        <div className="absolute -top-1 -right-1 bg-gray-900 border border-yellow-400 rounded-full p-0.5 shadow-md">
          <Crown className="w-3 h-3 text-yellow-400" />
        </div>
      )}
    </div>
  );
}