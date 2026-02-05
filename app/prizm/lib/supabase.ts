/**
 * Supabase client configuration for the Prizm Lounge app
 *
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance
 * Returns null if environment variables are not configured
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Running in offline mode.');
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
export function requireSupabase(): SupabaseClient<Database> {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return client;
}

export const supabase = getSupabase();
