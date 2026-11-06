import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default supabase

/**
 * Returns the shared Supabase client.
 * Provided as a named export so tests can inject a fake client
 * via the _supabase parameter without touching module defaults.
 * @returns {import('@supabase/supabase-js').SupabaseClient} Shared Supabase client
 */
export function getSupabaseClient() {
  return supabase
}
