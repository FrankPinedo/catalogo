import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ─── Cliente lazy (se instancia solo en runtime, no en build) ─────────────
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Crea un archivo .env.local con esas variables (ver .env.example).'
    )
  }

  _supabase = createClient(url, key)
  return _supabase
}

// ─── Types ────────────────────────────────────────────────
export type CatalogPrice = {
  id: string
  categoria: string
  producto: string
  material: string
  precio: number | null
  updated_at: string
}

export type CatalogText = {
  id: string
  clave: string
  valor: string
  updated_at: string
}

// ─── Queries ──────────────────────────────────────────────

/** Obtiene todos los precios */
export async function getAllPrices(): Promise<CatalogPrice[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('catalog_prices')
    .select('*')
    .order('categoria')
    .order('id')

  if (error) {
    console.error('Error fetching prices:', error)
    return []
  }
  return data ?? []
}

/** Actualiza un precio individual (UPDATE directo, sin historial) */
export async function updatePrice(id: string, precio: number | null): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('catalog_prices')
    .update({ precio })
    .eq('id', id)

  if (error) {
    console.error('Error updating price:', error)
    return false
  }
  return true
}

/** Actualiza múltiples precios en lote */
export async function batchUpdatePrices(
  updates: { id: string; precio: number | null }[]
): Promise<{ success: number; errors: number }> {
  let success = 0
  let errors = 0

  await Promise.all(
    updates.map(async ({ id, precio }) => {
      const ok = await updatePrice(id, precio)
      if (ok) success++
      else errors++
    })
  )

  return { success, errors }
}

/** Obtiene todos los textos editables */
export async function getAllTexts(): Promise<CatalogText[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('catalog_texts').select('*')

  if (error) {
    console.error('Error fetching texts:', error)
    return []
  }
  return data ?? []
}

/** Actualiza un texto editable */
export async function updateText(clave: string, valor: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('catalog_texts')
    .update({ valor })
    .eq('clave', clave)

  if (error) {
    console.error('Error updating text:', error)
    return false
  }
  return true
}
