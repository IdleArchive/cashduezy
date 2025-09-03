"use client";

import React from "react";

export interface FeatureCardProps {
  title: React.ReactNode; // ✅ was string, now accepts JSX or plain text
  description: string;
  children: React.ReactNode;
  cardBg: string;
  cardBorder: string;
}

export default function FeatureCard({
  title,
  description,
  children,
  cardBg,
  cardBorder,
}: FeatureCardProps) {
  return (
    <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      {/* Title */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>

      {/* Buttons / extra content */}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}