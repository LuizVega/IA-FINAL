
import { createClient } from '@supabase/supabase-js';

// Helper to access environment variables safely across different environments
const getEnvVar = (key: string): string | undefined => {
  // 1. Try process.env
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // 2. Try import.meta.env
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  return undefined;
};

// Credenciales proporcionadas por el usuario
const PROVIDED_URL = 'https://ebesrhejronqwewuwbsd.supabase.co';
const PROVIDED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXNyaGVqcm9ucXdld3V3YnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDQ1MDEsImV4cCI6MjA4NjE4MDUwMX0.3BVqpvG5psRVZZYMd0bI2rmnCuKzMSn7filcl_IPw9c';

// Intentar obtener las variables de entorno, si no existen, usar las proporcionadas
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || PROVIDED_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || PROVIDED_ANON_KEY;

// Solo está configurado si AMBAS variables tienen valores reales y no son placeholders
export const isSupabaseConfigured = !!supabaseUrl && 
                                   !!supabaseAnonKey && 
                                   supabaseUrl !== 'https://example.supabase.co' &&
                                   supabaseAnonKey !== 'public-anon-key';

if (!isSupabaseConfigured) {
  console.warn("Supabase no detectado o credenciales incompletas. Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben estar configuradas.");
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co', 
  supabaseAnonKey || 'public-anon-key'
);
