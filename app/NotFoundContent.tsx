"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-3xl font-bold">Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      {from && (
        <p className="text-xs text-gray-500">
          You were redirected here from <code>{from}</code>
        </p>
      )}
    </div>
  );
}