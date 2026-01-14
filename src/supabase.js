import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwioycvmrhqgxzcwsjsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aW95Y3ZtcmhxZ3h6Y3dzanNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTA3OTAsImV4cCI6MjA4Mzg4Njc5MH0.hmq05LsqHU4AbDWUWn62CSmO2wymOiT20K_xsiwO9Gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
