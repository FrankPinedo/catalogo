import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// Forzar ejecución dinámica — nunca pre-renderizar esta ruta en build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/precios?categoria=monofocales
export async function GET(request: Request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')

    let query = supabase.from('catalog_prices').select('*').order('id')
    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/precios — Actualiza precios en lote (UPDATE directo, sin historial)
export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const updates: { id: string; precio: number | null }[] = body.updates

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No se recibieron actualizaciones' }, { status: 400 })
    }

    const results = await Promise.all(
      updates.map(async ({ id, precio }) => {
        const { error } = await supabase
          .from('catalog_prices')
          .update({ precio: precio ?? null })
          .eq('id', id)
        return { id, ok: !error, error: error?.message }
      })
    )

    const successCount = results.filter((r) => r.ok).length
    const failCount = results.filter((r) => !r.ok).length

    return NextResponse.json({
      message: `${successCount} precio(s) actualizados, ${failCount} error(es)`,
      success: successCount,
      errors: failCount,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/precios — Actualiza un precio individual
export async function PATCH(request: Request) {
  try {
    const supabase = getSupabase()
    const { id, precio } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Se requiere el campo id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('catalog_prices')
      .update({ precio: precio ?? null })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Precio actualizado correctamente' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
