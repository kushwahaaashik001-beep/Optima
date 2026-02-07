import { createClient } from '@supabase/supabase-js';

// Kisi bhi type clash se bachne ke liye instance ko 'any' rakha hai
let supabaseInstance: any = null;

/**
 * Advanced Supabase Configuration:
 * Sabhi logics (Singleton, Real-time, Performance) yahan maujood hain.
 */
export const getSupabaseClient = (): any => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  // Client Initialization with your advanced logic
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-application-name': 'optima-pro',
        'x-application-version': '1.0.0',
        'x-client-type': 'web',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 50,
        heartbeatIntervalMs: 10000,
      },
    },
    // Your 30s timeout and cache logic
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      return fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      }).finally(() => clearTimeout(timeoutId));
    },
  });

  return supabaseInstance;
};

// Main client export
export const supabase = getSupabaseClient();

/**
 * Admin client for server-side operations
 */
export const getAdminClient = (): any => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

/**
 * Realtime lead notification (Logic preserved)
 */
export const subscribeToNewLeads = (category: string, onNewLead: (lead: any) => void) => {
  return supabase
    .channel(`leads-${category}-${Date.now()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads', filter: `category=eq.${category}` }, 
    (payload: any) => onNewLead(payload.new))
    .subscribe();
};

/**
 * Batch insert for high-performance (Logic preserved)
 */
export const batchInsert = async (table: string, data: any[], batchSize: number = 100) => {
  try {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase.from(table).insert(batch);
      if (error) throw error;
      if (i + batchSize < data.length) await new Promise(r => setTimeout(r, 100));
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Paginated query builder (Logic preserved)
 */
export const paginatedQuery = async (table: string, options: any = {}) => {
  const { select = '*', page = 1, pageSize = 20, orderBy = { column: 'created_at', ascending: false } } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderBy.column, { ascending: orderBy.ascending })
    .range(from, to);

  if (error) throw error;
  return { data, total: count, page, pageSize, totalPages: Math.ceil((count || 0) / pageSize) };
};

export default supabase;
