import { Suspense } from "react";
import DashboardContent from "./DashboardContent"; // using the real file

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}