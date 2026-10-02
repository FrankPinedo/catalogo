import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  // APP_SUPABASE_* son variables manuales definidas en Vercel que NO sobreescribe
  // la integración automática de Supabase. Tienen prioridad sobre las inyectadas.
  const url =
    process.env.APP_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL

  const key =
    process.env.APP_SUPABASE_SERVICE_KEY ||
    process.env.APP_SUPABASE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Faltan credenciales de Supabase en variables de entorno.')
  }

  // Desactivar auth persistence y realtime en entorno backend/servidor
  _supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return _supabase
}

export type CatalogPrice = {
  id: string
  categoria: string
  producto: string
  material: string
  precio: number | null
  updated_at: string
}
