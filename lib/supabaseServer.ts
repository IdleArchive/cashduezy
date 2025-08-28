import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function getSupabaseServer() {
  return createServerComponentClient(
    { cookies },
    {
      supabaseUrl: "https://rycuzfjyskutskuyojym.supabase.co",
      supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Y3V6Zmp5c2t1dHNrdXlvanltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwOTQyNDMsImV4cCI6MjA3MTY3MDI0M30.QvRUxpbn3dyMx-_rNvwPO7gnc35RaVMZCiYbfCRGKSk"
    }
  )
}