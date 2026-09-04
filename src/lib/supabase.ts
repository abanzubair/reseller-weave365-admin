import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://agsldsqeynzydujmijgc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnc2xkc3FleW56eWR1am1pamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDQxOTAsImV4cCI6MjEwNDAyMDE5MH0.PHFlhCQyRyBCxy1nFR2GdYgwcraiQZu8wSho29qkpEA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
