import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Advanced Type Definitions matching your backend
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

export interface SystemHealth {
  id: string;
  metric: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
}

export interface ScraperConfig {
  id: string;
  key: string;
  value: any;
  category: 'quantum' | 'proxy' | 'ai' | 'database' | 'performance';
  description: string;
  last_updated: string;
}

// ✅ Quantum Engine States
export interface EngineState {
  mode: 'vacuum' | 'targeted' | 'hybrid';
  active_threads: number;
  processed_today: number;
  avg_response_time: number;
  success_rate: number;
  memory_usage: number;
  last_health_check: string;
}

// ✅ Singleton instance
let supabaseInstance: SupabaseClient | null = null;

// ✅ Initialize Quantum Supabase Client
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Quantum-grade initialization
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'quantum-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Quantum-Client': 'Optima-Pro-Frontend',
        'X-Client-Version': '2.0.0',
      },
      fetch: (...args) => fetch(...args),
    },
    db: {
      schema: 'public',
    },
  });

  return supabaseInstance;
};

// ✅ Real-time subscription helpers
export const subscribeToLeads = (
  callback: (lead: Lead) => void,
  errorCallback?: (error: any) => void
) => {
  const supabase = getSupabaseClient();
  
  return supabase
    .channel('quantum-leads')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'leads',
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Lead);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'leads',
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Lead);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('🎯 Quantum lead subscription active');
      }
      if (status === 'CHANNEL_ERROR') {
        errorCallback?.(new Error('Subscription error'));
      }
    });
};

export const subscribeToLogs = (callback: (log: SystemLog) => void) => {
  const supabase = getSupabaseClient();
  
  return supabase
    .channel('quantum-logs')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'system_logs',
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as SystemLog);
        }
      }
    )
    .subscribe();
};

// ✅ Main client export
export const supabase = getSupabaseClient();
export default supabase;
