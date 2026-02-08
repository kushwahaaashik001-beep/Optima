import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Simple Type Definition (No complex database types)
export interface Lead {
  id: string;
  title: string;
  description: string;
  platform: 'twitter' | 'linkedin' | 'reddit' | 'discord' | 'email';
  category: string;
  skill: string;
  budget: string;
  budget_level: 'low' | 'medium' | 'high';
  url: string;
  match_score: number;
  is_verified: boolean;
  created_at: string;
  status?: 'pending' | 'applied' | 'closed';
  applied_at?: string | null;
}

// ✅ Singleton instance
let supabaseInstance: SupabaseClient | null = null;

// ✅ Initialize Supabase Client
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Check for environment variables in development
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing');
  }

  // ✅ Simple initialization without complex typing
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      fetch: (...args) => fetch(...args)
    }
  });

  return supabaseInstance;
};

// ✅ Main client export
export const supabase = getSupabaseClient();
export default supabase;
