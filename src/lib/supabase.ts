import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://agsldsqeynzydujmijgc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnc2xkc3FleW56eWR1am1pamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNjg5MzIsImV4cCI6MjA1NTc0NDkzMn0.UfH3e_D4o01t79oZ9KkQ0G57H96jV1q5fWd8U4W-pRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
