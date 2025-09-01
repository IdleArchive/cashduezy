"use client";

interface UserAvatarProps {
  email: string | null;
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

export default function UserAvatar({ email, size = 32 }: UserAvatarProps) {
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  // Deterministic color based on email hash
  const colorIndex = email
    ? email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length
    : 0;

  const bgColor = colors[colorIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold ${bgColor}`}
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      {initial}
    </div>
  );
}