import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";

export const dynamic = "force-dynamic";

export default async function WhoAmIPage() {
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  const admin = user ? await isAdmin() : false;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Debug: whoami</h1>
      <pre className="rounded-lg border bg-black/5 p-4 text-sm">
        {JSON.stringify({ user, admin, error: error?.message ?? null }, null, 2)}
      </pre>
    </main>
  );
}
