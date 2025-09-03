// app/dashboard/components/SubscriptionsList.tsx
"use client";

import React, { ChangeEvent } from "react";
import { Edit, Trash2 } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cadence: "monthly" | "yearly";
  status?: "active" | "cancelled";
  next_charge_date?: string | null;
}

type SortOption = "name" | "amountAsc" | "amountDesc" | "renewalAsc" | "renewalDesc";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  displaySubscriptions: Subscription[];
  filterTerm: string;
  setFilterTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  neutralButton: string;
  hasAny: boolean;
  renewalMeta: (sub: Subscription) => { dueLabel: string };
  handleEdit: (sub: Subscription) => void;
  handleUndoCancel: (id: string, name: string) => void;
  handleCancel: (id: string, name: string) => void;
  handleInitiateDelete: (sub: Subscription) => void;
  deletingId: string | null;
  openAddModal: () => void;
}

export default function SubscriptionsList({
  subscriptions,
  displaySubscriptions,
  filterTerm,
  setFilterTerm,
  sortOption,
  setSortOption,
  isDark,
  cardBg,
  cardBorder,
  neutralButton,
  hasAny,
  renewalMeta,
  handleEdit,
  handleUndoCancel,
  handleCancel,
  handleInitiateDelete,
  deletingId,
  openAddModal,
}: SubscriptionsListProps) {
  return (
    <section className={`lg:col-span-2 rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      <h2 className="text-lg font-semibold mb-3">Your Subscriptions</h2>

      {subscriptions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          {/* Filter */}
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-md text-sm border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
          />

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSortOption(e.target.value as SortOption)
            }
            className={`px-3 py-2 rounded-md text-sm border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-gray-100 border-gray-300 text-gray-800"
            }`}
          >
            <option value="name">Sort by Name</option>
            <option value="amountAsc">Amount (Low → High)</option>
            <option value="amountDesc">Amount (High → Low)</option>
            <option value="renewalAsc">Renewal (Soonest)</option>
            <option value="renewalDesc">Renewal (Farthest)</option>
          </select>
        </div>
      )}

      {/* Empty state */}
      {subscriptions.length === 0 ? (
        <p className="text-sm">
          You have no subscriptions yet.{" "}
          <button
            onClick={openAddModal}
            className={`underline ${
              isDark
                ? "text-violet-400 hover:text-violet-300"
                : "text-indigo-600 hover:text-indigo-500"
            }`}
          >
            Add your first subscription →
          </button>
        </p>
      ) : (
        <ul className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
          {displaySubscriptions.map((sub) => {
            const meta = renewalMeta(sub);
            return (
              <li
                key={sub.id}
                className={`py-3 flex justify-between items-center gap-3 ${
                  sub.status === "cancelled" ? "opacity-60 line-through" : ""
                }`}
              >
                {/* Left side: service name + cadence */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`${
                      isDark ? "text-violet-300" : "text-indigo-600"
                    } font-medium`}
                  >
                    {sub.name}
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } text-xs capitalize`}
                  >
                    {sub.cadence} • {meta.dueLabel}
                  </p>
                </div>

                {/* Right side: price + actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isDark ? "text-emerald-400" : "text-green-600"
                    } font-semibold whitespace-nowrap`}
                  >
                    {sub.currency} {sub.amount.toFixed(2)}
                  </span>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(sub)}
                    className={`p-2 rounded-md ${neutralButton}`}
                    aria-label={`Edit ${sub.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Cancel / Undo */}
                  {sub.status === "cancelled" ? (
                    <button
                      onClick={() => handleUndoCancel(sub.id, sub.name)}
                      className={`p-2 rounded-md ${
                        isDark
                          ? "bg-green-900/40 hover:bg-green-900/60 text-green-300 border border-green-800/40"
                          : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                      }`}
                      aria-label={`Undo cancel for ${sub.name}`}
                    >
                      ↺
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancel(sub.id, sub.name)}
                      className={`p-2 rounded-md ${
                        isDark
                          ? "bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 border border-yellow-800/40"
                          : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300"
                      }`}
                      aria-label={`Cancel ${sub.name}`}
                    >
                      ✕
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleInitiateDelete(sub)}
                    disabled={deletingId === sub.id}
                    className={`p-2 rounded-md ${
                      isDark
                        ? "bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                        : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                    }`}
                    aria-label={`Delete ${sub.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}