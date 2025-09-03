// app/dashboard/components/UpcomingPayments.tsx
"use client";

import React from "react";

interface UpcomingItem {
  name: string;
  next: Date;
  currency: string;
  amount: number;
  dueLabel: string;
  isOverdue: boolean;
}

interface UpcomingPaymentsProps {
  upcoming: UpcomingItem[];
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  next30DaysSpending: number;
}

export default function UpcomingPayments({
  upcoming,
  isDark,
  cardBg,
  cardBorder,
  next30DaysSpending,
}: UpcomingPaymentsProps) {
  return (
    <aside className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      <h3 className="text-lg font-semibold mb-3">Upcoming Payments</h3>

      {upcoming.length === 0 ? (
        <p className="text-sm">No upcoming payments.</p>
      ) : (
        <>
          <ul
            className={`divide-y ${
              isDark ? "divide-gray-800" : "divide-gray-200"
            }`}
          >
            {upcoming.map((item) => (
              <li
                key={`${item.name}-${item.next.toISOString()}`}
                className="py-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className={`${
                        isDark ? "text-violet-300" : "text-indigo-600"
                      } text-sm font-medium`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } text-xs`}
                    >
                      {item.dueLabel}
                    </p>
                  </div>
                  <div
                    className={`${
                      isDark ? "text-emerald-400" : "text-green-600"
                    } text-sm font-semibold`}
                  >
                    {item.currency} {item.amount.toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {next30DaysSpending > 0 && (
            <div
              className={`mt-4 text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Total due next 30 days:
              <span
                className={`${
                  isDark ? "text-emerald-400" : "text-green-600"
                } font-semibold ml-1`}
              >
                ${next30DaysSpending.toFixed(2)}
              </span>
            </div>
          )}
        </>
      )}
    </aside>
  );
}