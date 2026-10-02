import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Endpoint temporal de diagnóstico — muestra qué variables de entorno están disponibles
// ELIMINAR antes de ir a producción final
export async function GET() {
  const vars = {
    APP_SUPABASE_URL: process.env.APP_SUPABASE_URL ? '✅ definida' : '❌ ausente',
    APP_SUPABASE_SERVICE_KEY: process.env.APP_SUPABASE_SERVICE_KEY ? '✅ definida' : '❌ ausente',
    APP_SUPABASE_KEY: process.env.APP_SUPABASE_KEY ? '✅ definida' : '❌ ausente',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `✅ = ${process.env.NEXT_PUBLIC_SUPABASE_URL}`
      : '❌ ausente',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `✅ = ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...`
      : '❌ ausente',
    SUPABASE_URL: process.env.SUPABASE_URL ? `✅ = ${process.env.SUPABASE_URL}` : '❌ ausente',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `✅ = ${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)}...`
      : '❌ ausente',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      ? `✅ = ${process.env.SUPABASE_ANON_KEY?.slice(0, 20)}...`
      : '❌ ausente',
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY
      ? `✅ = ${process.env.SUPABASE_SECRET_KEY?.slice(0, 20)}...`
      : '❌ ausente',
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY
      ? `✅ = ${process.env.SUPABASE_PUBLISHABLE_KEY?.slice(0, 20)}...`
      : '❌ ausente',
  }

  return NextResponse.json(vars)
}
