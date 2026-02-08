import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Database Type Definition
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
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
          applied_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          platform: 'twitter' | 'linkedin' | 'reddit' | 'discord' | 'email';
          category: string;
          skill: string;
          budget: string;
          budget_level: 'low' | 'medium' | 'high';
          url: string;
          match_score?: number;
          is_verified?: boolean;
          created_at?: string;
          status?: 'pending' | 'applied' | 'closed';
          applied_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          platform?: 'twitter' | 'linkedin' | 'reddit' | 'discord' | 'email';
          category?: string;
          skill?: string;
          budget?: string;
          budget_level?: 'low' | 'medium' | 'high';
          url?: string;
          match_score?: number;
          is_verified?: boolean;
          created_at?: string;
          status?: 'pending' | 'applied' | 'closed';
          applied_at?: string;
        };
      };
    };
  };
}

// ✅ Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;

// ✅ Initialize Supabase Client
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Check for environment variables in development
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing');
  }

  // ✅ Fixed: Proper initialization with global fetch
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      // ✅ Fixed: fetch function inside global object
      fetch: (...args) => fetch(...args)
    }
  });

  return supabaseInstance;
};

// ✅ Main client export
export const supabase = getSupabaseClient();
export default supabase;
