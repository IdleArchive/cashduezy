// /app/blog/_components/AdminButtons.tsx
import Link from "next/link";
import { isAdmin } from "@/lib/isAdmin";
import DeleteButton from "./DeleteButton";
import { deleteBlogById } from "@/app/blog/actions";

export default async function AdminButtons({
  postId,
  slug,
  redirectAfterDelete = false,
}: {
  postId: number;
  slug: string;
  redirectAfterDelete?: boolean;
}) {
  const admin = await isAdmin();
  if (!admin) return null;

  const boundDelete = deleteBlogById.bind(null, postId, redirectAfterDelete ? "/blog" : undefined);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Link
        href={`/blog/${slug}/edit`}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
      >
        Edit
      </Link>

      <DeleteButton action={boundDelete} />
    </div>
  );
}
