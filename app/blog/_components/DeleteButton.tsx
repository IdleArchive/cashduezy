// /app/blog/_components/DeleteButton.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  action,
  label = "Delete",
}: {
  action: () => Promise<void>; // server action is passed bound
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const ok = typeof window === "undefined" ? true : confirm("Delete this post? This cannot be undone.");
          if (!ok) return;
          await action();
          // server action handles revalidate/redirect. If it didn't redirect,
          // refreshing ensures the list updates immediately.
          router.refresh();
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-md border border-red-400 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
