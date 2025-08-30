// app/dashboard/page.tsx
import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
