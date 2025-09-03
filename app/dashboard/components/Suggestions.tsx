// app/dashboard/components/Suggestions.tsx
"use client";

import React from "react";

interface SuggestionsProps {
  duplicateServices: [string, number][];
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  onCancelDuplicates: (name: string) => void;
  accentButton: (colour: "violet" | "emerald" | "rose") => string;
}

export default function Suggestions({
  duplicateServices,
  isDark,
  cardBg,
  cardBorder,
  onCancelDuplicates,
  accentButton,
}: SuggestionsProps) {
  if (duplicateServices.length === 0) return null;

  return (
    <div className={`mt-6 rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
      {duplicateServices.map(([name]) => (
        <div key={name} className="mb-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">
              Duplicate subscriptions for {name}
            </p>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              You have more than one {name} subscription. Consider cancelling
              duplicates.
            </p>
          </div>
          <button
            onClick={() => onCancelDuplicates(name)}
            className={`px-3 py-1.5 rounded-md text-sm ${accentButton("rose")}`}
          >
            Cancel duplicates
          </button>
        </div>
      ))}
    </div>
  );
}