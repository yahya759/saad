import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://znuopbnujggmvprajobo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudW9wYm51amdnbXZwcmFqb2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODA0MTAsImV4cCI6MjA5NjA1NjQxMH0.GY1QQm6zq5XQ9OlCkHPgXQ_DPYU5SObSbTPxyecAJdA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
