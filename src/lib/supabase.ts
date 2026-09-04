import { createClient } from '@supabase/supabase-js';

export const WORKING_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnc2xkc3FleW56eWR1am1pamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDQxOTAsImV4cCI6MjEwNDAyMDE5MH0.PHFlhCQyRyBCxy1nFR2GdYgwcraiQZu8wSho29qkpEA';

const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect and reject revoked or missing key
const isRevoked = !rawKey || rawKey.includes('U4W-pRo') || rawKey.includes('UfH3e_');
const supabaseAnonKey = isRevoked ? WORKING_SUPABASE_ANON_KEY : rawKey;

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://agsldsqeynzydujmijgc.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
