"use client";

import React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface ProjectionChartProps {
  projectionData: { month: string; spending: number }[];
  isDark: boolean;
  lineYAxisMax: number;
  lineYAxisTicks: number[];
  cardBg: string;
  cardBorder: string;
  ready: boolean;
  loading: boolean;
}

export default function ProjectionChart({
  projectionData,
  isDark,
  lineYAxisMax,
  lineYAxisTicks,
  cardBg,
  cardBorder,
  ready,
  loading,
}: ProjectionChartProps) {
  return (
    <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
      <h3 className="text-lg font-semibold mb-3">Monthly Projection</h3>
      <div className="h-64">
        {ready && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectionData}
              margin={{ top: 5, right: 20, bottom: 30, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#E5E7EB"}
              />
              <XAxis dataKey="month" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
              <YAxis
                domain={[0, lineYAxisMax]}
                ticks={lineYAxisTicks}
                stroke={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="spending"
                stroke={isDark ? "#10B981" : "#047857"}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
