"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function HideOnDashboard({ children }: PropsWithChildren) {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return <>{children}</>;
}