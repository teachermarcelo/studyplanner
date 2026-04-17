import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://rvgcniaowzmsudzliozf.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2NuaWFvd3ptc3Vkemxpb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjQxNzQsImV4cCI6MjA5MTQwMDE3NH0.uwwKFLuK-XyPoXPrB6_CseRTiD9d-iyMQSPWrFw-l-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
