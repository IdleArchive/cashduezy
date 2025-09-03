// app/dashboard/components/StatsSection.tsx
"use client";

import React from "react";

// === Types ===
interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cadence: "monthly" | "yearly";
  status?: "active" | "cancelled";
  next_charge_date?: string | null;
}

interface StatsSectionProps {
  subscriptions: Subscription[];
  isPro: boolean;
}

// === Individual Stat Card ===
function StatCard({
  title,
  value,
  colour,
  statTextColours,
  cardBg,
  cardBorder,
}: {
  title: string;
  value: string;
  colour: "violet" | "blue" | "emerald" | "rose";
  statTextColours: Record<string, string>;
  cardBg: string;
  cardBorder: string;
}) {
  const colourClass = statTextColours[colour];
  return (
    <div
      className={`rounded-xl shadow-sm p-4 flex flex-col border ${cardBg} ${cardBorder}`}
    >
      <span className={`text-3xl font-bold mb-1 ${colourClass}`}>{value}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    </div>
  );
}

// === Main StatsSection Component ===
export default function StatsSection({ subscriptions, isPro }: StatsSectionProps) {
  // --- Derived Values ---
  const total = subscriptions.length;
  const active = subscriptions.filter((s) => s.status !== "cancelled").length;

  const monthlyTotal = subscriptions
    .filter((s) => s.cadence === "monthly" && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.amount, 0);

  const yearlyTotal = subscriptions
    .filter((s) => s.cadence === "yearly" && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.amount, 0);

  // --- Colour Classes ---
  const statTextColours: Record<string, string> = {
    violet: "text-violet-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
  };

  // --- Shared Card Styles ---
  const cardBg = "bg-gray-900";
  const cardBorder = "border border-gray-700";

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total subscriptions */}
      <StatCard
        title="Total Subscriptions"
        value={total.toString()}
        colour="violet"
        statTextColours={statTextColours}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />

      {/* Active subscriptions */}
      <StatCard
        title="Active Services"
        value={active.toString()}
        colour="blue"
        statTextColours={statTextColours}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />

      {/* Monthly total */}
      <StatCard
        title="Monthly Spending"
        value={`$${monthlyTotal.toFixed(2)}`}
        colour="emerald"
        statTextColours={statTextColours}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />

      {/* Yearly total */}
      <StatCard
        title="Yearly Projection"
        value={`$${yearlyTotal.toFixed(2)}`}
        colour="rose"
        statTextColours={statTextColours}
        cardBg={cardBg}
        cardBorder={cardBorder}
      />

      {/* Pro message (spans full width) */}
      {isPro && (
        <div className="col-span-2 md:col-span-4 mt-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700 text-emerald-300 text-sm text-center">
          ✅ Pro features unlocked – enjoy advanced insights & unlimited tracking!
        </div>
      )}
    </section>
  );
}