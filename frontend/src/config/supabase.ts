import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ldiiiklxjokzhtnmfjcx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaWlpa2x4am9remh0bm1mamN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Mjk3NzcsImV4cCI6MjEwMjAwNTc3N30.lQ6XMveFK4J5P7-_O76zaZyMEwko3vBWHYefBGvD7_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
