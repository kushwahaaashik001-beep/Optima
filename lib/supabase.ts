import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Type Definitions
export interface Lead {
  id: string;
  title: string;
  description: string;
  platform: 'twitter' | 'linkedin' | 'reddit' | 'discord' | 'email';
  category: string;
  skill: string;
  budget: string;
  budget_level: 'low' | 'medium' | 'high' | 'quantum';
  url: string;
  match_score: number;
  is_verified: boolean;
  created_at: string;
  status?: 'pending' | 'applied' | 'closed' | 'processing';
  applied_at?: string | null;
  tier?: 'basic' | 'premium' | 'quantum';
  ai_confidence?: number;
  source_engine?: string;
  proxy_used?: string;
  processing_time?: number;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'QUANTUM' | 'VACUUM';
  message: string;
  module: string;
  timestamp: string;
  data?: any;
}

export interface EngineState {
  mode: 'vacuum' | 'targeted' | 'hybrid';
  active_threads: number;
  processed_today: number;
  avg_response_time: number;
  success_rate: number;
  memory_usage: number;
  last_health_check: string;
}

// ✅ Singleton pattern
let supabaseInstance: SupabaseClient | null = null;

// ✅ Initialize Supabase Client
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      fetch: (...args: Parameters<typeof fetch>) => fetch(...args)
    }
  });

  return supabaseInstance;
};

// ✅ Real-time subscription helpers
export const subscribeToLeads = (
  callback: (lead: Lead) => void,
  errorCallback?: (error: any) => void
) => {
  const supabase = getSupabaseClient();
  
  const channel = supabase
    .channel('quantum-leads')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'leads',
      },
      (payload: any) => {
        if (payload.new) {
          callback(payload.new as Lead);
        }
      }
    )
    .subscribe((status: any) => {
      if (status === 'SUBSCRIBED') {
        console.log('🎯 Quantum lead subscription active');
      }
      if (status === 'CHANNEL_ERROR') {
        errorCallback?.(new Error('Subscription error'));
      }
    });

  return channel;
};

// ✅ Main client export
export const supabase = getSupabaseClient();
export default supabase;
