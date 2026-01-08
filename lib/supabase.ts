
import { createClient } from '@supabase/supabase-js';

// Credenziali fornite dall'utente per il progetto Lumina
const supabaseUrl = 'https://zoaienlaeabptjfftuua.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYWllbmxhZWFicHRqZmZ0dXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzMzMzksImV4cCI6MjA4MzEwOTMzOX0.W16GylmQDsToahRAGU_9xUTowe2j4gt3iBoA1FwoDcM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
