export {
  getSupabase,
  isSupabaseConfigured,
  requireSupabase,
  checkSupabaseConnection,
} from '../../lib/supabase-client';

// Re-export a convenience singleton for backwards compatibility
import { getSupabase } from '../../lib/supabase-client';
export const supabase = getSupabase();
