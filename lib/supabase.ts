
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pthnupbilsukeuuhcvib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aG51cGJpbHN1a2V1dWhjdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjQxODgsImV4cCI6MjA4NjA0MDE4OH0.fEoRKcwcTbtMIovincx30mPctvslFu_oVScQAyyrWyg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
