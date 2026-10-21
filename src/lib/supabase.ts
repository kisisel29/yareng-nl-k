import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const PEOPLE_IMAGES_BUCKET = 'people-images';

/**
 * Yüklenen her dosya benzersiz (UUID) bir adla saklanır ve içeriği
 * hiç değişmez; bu yüzden tarayıcı 1 yıl önbellekten okuyabilir.
 * Sayfa her açıldığında aynı fotoğraf tekrar indirilmez.
 */
export const IMAGE_CACHE_CONTROL = '31536000';
