"use client";

import React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface SpendingChartProps {
  chartData: { name: string; amount: number }[];
  isDark: boolean;
  barYAxisMax: number;
  barYAxisTicks: number[];
  cardBg: string;
  cardBorder: string;
  ready: boolean;
  loading: boolean;
}

export default function SpendingChart({
  chartData,
  isDark,
  barYAxisMax,
  barYAxisTicks,
  cardBg,
  cardBorder,
  ready,
  loading,
}: SpendingChartProps) {
  return (
    <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      <h3 className="text-lg font-semibold mb-3">Spending by Service</h3>
      <div className="h-64">
        {ready && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 30, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#E5E7EB"}
              />
              <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
              <YAxis
                domain={[0, barYAxisMax]}
                ticks={barYAxisTicks}
                stroke={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
              <Bar
                dataKey="amount"
                fill={isDark ? "#8b5cf6" : "#6366F1"}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}