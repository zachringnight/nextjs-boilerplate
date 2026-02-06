/**
 * Supabase client configuration for the Prizm Lounge app
 *
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance
 * Returns null if environment variables are not configured
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Running in offline mode.');
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Get Supabase client or throw error if not configured
 */
export function requireSupabase(): SupabaseClient {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return client;
}

/**
 * Verify Supabase connectivity.
 * Returns true when the client can reach Supabase successfully.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.auth.getSession();
    if (error) {
      console.warn('Supabase connection check failed:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
}

export const supabase = getSupabase();
