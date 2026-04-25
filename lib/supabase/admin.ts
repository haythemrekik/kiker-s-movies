import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Note: This client should ONLY be used in Server Actions or Route Handlers
// never in Client Components, as it bypasses RLS using the Service Role Key.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
