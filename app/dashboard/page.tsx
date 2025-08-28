import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabaseServer'

export default async function Dashboard() {
  const supabase = getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('id, name, currency, cadence, next_charge_date')
    .eq('user_id', session.user.id)
    .order('next_charge_date', { ascending: true })

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Subscriptions</h1>
      {error && <div className="text-red-600">Error: {error.message}</div>}
      <ul className="space-y-2">
        {subscriptions?.map((s) => (
          <li key={s.id} className="rounded-lg border p-4 shadow">
            <div className="font-semibold">{s.name}</div>
            <div>{s.currency ?? ''} · {s.cadence ?? ''} · Next: {s.next_charge_date ?? '—'}</div>
          </li>
        ))}
        {!subscriptions?.length && <li className="text-gray-600">No subscriptions yet.</li>}
      </ul>
    </div>
  )
}
