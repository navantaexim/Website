
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // We don't throw immediately to allow build time, but functions will fail if called
  console.warn('Missing Supabase Service Role Key. Private storage operations will fail.')
}

// Note: This client has admin privileges. Use carefully!
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey || 'mock-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
