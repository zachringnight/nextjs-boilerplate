import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type UntypedSupabaseClient = ReturnType<typeof createClient<any, 'public', any>>;

let serviceClient: UntypedSupabaseClient | null = null;
let verifierClient: UntypedSupabaseClient | null = null;

function requireServerEnv(): void {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase server env vars. Expected NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

export function getServiceSupabaseClient(): UntypedSupabaseClient {
  requireServerEnv();
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serviceClient;
}

export function getVerifierSupabaseClient(): UntypedSupabaseClient {
  requireServerEnv();
  if (!verifierClient) {
    verifierClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return verifierClient;
}

export function parseBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function getUserFromBearerToken(token: string): Promise<User | null> {
  const verifier = getVerifierSupabaseClient();
  const { data, error } = await verifier.auth.getUser(token);
  if (error) return null;
  return data.user;
}
