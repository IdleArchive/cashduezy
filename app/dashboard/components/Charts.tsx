"use client";

import React from "react";
import SpendingChart from "./SpendingChart";
import ProjectionChart from "./ProjectionChart";

interface ChartsProps {
  sideBySide: boolean;
  toggleSideBySide: () => void;
  accentButton: (colour: "violet" | "emerald" | "rose") => string;
  // Props passed down
  chartData: { name: string; amount: number }[];
  barYAxisMax: number;
  barYAxisTicks: number[];
  projectionData: { month: string; spending: number }[];
  lineYAxisMax: number;
  lineYAxisTicks: number[];
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  ready: boolean;
  loading: boolean;
}

export default function Charts({
  sideBySide,
  toggleSideBySide,
  accentButton,
  chartData,
  barYAxisMax,
  barYAxisTicks,
  projectionData,
  lineYAxisMax,
  lineYAxisTicks,
  isDark,
  cardBg,
  cardBorder,
  ready,
  loading,
}: ChartsProps) {
  return (
    <>
      <div className="flex justify-end my-4">
        <button
          onClick={toggleSideBySide}
          className={`px-4 py-2 rounded-lg transition ${accentButton("violet")}`}
        >
          Toggle Charts {sideBySide ? "(Stacked)" : "(Side-by-Side)"}
        </button>
      </div>
      <div
        className={`${
          sideBySide
            ? "grid grid-cols-1 md:grid-cols-2 gap-6"
            : "flex flex-col gap-6"
        }`}
      >
        <SpendingChart
          chartData={chartData}
          isDark={isDark}
          barYAxisMax={barYAxisMax}
          barYAxisTicks={barYAxisTicks}
          cardBg={cardBg}
          cardBorder={cardBorder}
          ready={ready}
          loading={loading}
        />
        <ProjectionChart
          projectionData={projectionData}
          isDark={isDark}
          lineYAxisMax={lineYAxisMax}
          lineYAxisTicks={lineYAxisTicks}
          cardBg={cardBg}
          cardBorder={cardBorder}
          ready={ready}
          loading={loading}
        />
      </div>
    </>
  );
}
