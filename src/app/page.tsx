'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { CatalogPrice } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────
type PriceMap = Record<string, Record<string, Record<string, number | null>>>
// priceMap[categoria][producto][material] = precio | null

type PendingChange = { id: string; precio: number | null }

const TABS = [
  { id: 'monofocales', label: '1. Monofocales', icon: 'fa-circle-dot' },
  { id: 'bifocales', label: '2. Bifocales', icon: 'fa-regular fa-eye' },
  { id: 'multifocales', label: '3. Multifocales', icon: 'fa-arrows-split-up-and-left' },
  { id: 'fabricacion', label: '4. Fabricación & Índices', icon: 'fa-industry' },
  { id: 'descartables', label: '5. Contacto Descartables', icon: 'fa-box-archive' },
  { id: 'anuales', label: '6. Contacto Anuales', icon: 'fa-calendar-check' },
  { id: 'servicios', label: '7. Servicios & Accesorios', icon: 'fa-screwdriver-wrench' },
]

// ─── Utilitario de formato ─────────────────────────────────
function fmt(precio: number | null, isRecargo = false): string {
  if (precio === null) return ''
  return isRecargo ? `+S/ ${precio}` : `S/ ${precio}`
}

function parsePrice(text: string): number | null {
  const clean = text.replace(/[^0-9.]/g, '').trim()
  if (!clean) return null
  const num = parseFloat(clean)
  return isNaN(num) ? null : num
}

// ─── Componente de celda precio editable ──────────────────
function PriceCell({
  id,
  precio,
  categoria,
  producto,
  material = '',
  isRecargo = false,
  colorClass = '',
  onEdit,
}: {
  id?: string
  precio: number | null
  categoria?: string
  producto?: string
  material?: string
  isRecargo?: boolean
  colorClass?: string
  onEdit: (
    identifier: string,
    newPrecio: number | null,
    meta?: { categoria?: string; producto?: string; material?: string }
  ) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [val, setVal] = useState(precio !== null ? String(precio) : '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setVal(precio !== null ? String(precio) : '')
  }, [precio])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleCommit = () => {
    setIsEditing(false)
    const parsed = parsePrice(val)
    if (parsed !== precio) {
      const cellId = id || `new_${producto}||${material}`
      onEdit(cellId, parsed, { categoria, producto, material })
    }
    if (parsed !== null) {
      setVal(String(parsed))
    } else {
      setVal('')
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step="any"
        placeholder="0.00"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCommit()
          if (e.key === 'Escape') {
            setVal(precio !== null ? String(precio) : '')
            setIsEditing(false)
          }
        }}
        className="w-20 px-2 py-1 text-center font-bold text-xs bg-amber-100 border-2 border-teal-600 rounded shadow-inner outline-none text-slate-800"
      />
    )
  }

  const hasValue = precio !== null && precio !== undefined

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Clic para editar o ingresar precio"
      className={`price-editable ${colorClass} ${
        !hasValue ? 'text-slate-400 font-normal italic hover:text-slate-800' : ''
      } cursor-pointer hover:bg-yellow-200 hover:ring-2 hover:ring-amber-400 transition-all select-none`}
    >
      {hasValue ? fmt(parsePrice(val) ?? precio, isRecargo) : '—'}
    </span>
  )
}

// ─── Toast ────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 transition-opacity duration-300 z-50 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <i className="fa-solid fa-check-circle text-emerald-400 text-lg" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

// ─── Tabla Monofocales ────────────────────────────────────
const MONOFOCAL_PRODUCTS = [
  'UV (TRANSPARENTE)',
  'ANTIREFLEJO (UV + AR VERDE)',
  'BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)',
  'FOTOCROMATICO UV (MARRON - GRIS)',
  'FOTOCROMATICO AR (MARRON - GRIS)',
  'FOTOCROMATICO BLUE AR (MARRON - GRIS)',
  'FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)',
  'FOTO DRIVE - FREE (AMARILLO A GRIS)',
  'TRANSITION AR',
  'TRANSITION BLUE',
  'TRANSITION POLARIZADO',
]
const SOL_PRODUCTS = [
  'SOL UV PLANO',
  'SOL UV CURVO',
  'SOL POLARIZADO',
  'SOL ESPEJADO Y POLARIZADO',
]
const MONO_MATERIALS = ['cristal', 'resina', 'policarbonato', 'ai_1_6', 'ai_1_67', 'ai_1_74', 'cristal_1_7', 'cristal_1_8']
const MONO_HEADERS = ['Cristal', 'Resina', 'Poli-carbonato', 'AI 1.6', 'AI 1.67', 'AI 1.74', '1.7 Cristal', '1.8 Cristal']
const HEADER_COLORS = [
  'bg-[#0097a7]', 'bg-[#00796b]', 'bg-[#5e35b1]',
  'bg-[#8d6e63]', 'bg-[#8d6e63]', 'bg-[#8d6e63]',
  'bg-[#5d4037]', 'bg-[#5d4037]',
]

function TablaMonofocales({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['monofocales'] ?? {}

  const renderRow = (producto: string, alt: boolean) => {
    return (
      <tr key={producto} className={`${alt ? 'bg-teal-50/20 hover:bg-teal-50/60' : 'hover:bg-teal-50/50'} transition`}>
        <td className="p-3.5 font-semibold text-slate-800 text-xs">
          <span className="text-[#00838f] font-bold">{producto.split(' (')[0]}</span>
          {producto.includes('(') && (
            <span className="text-slate-500 font-normal"> ({producto.split('(')[1].replace(')', '')})</span>
          )}
        </td>
        {MONO_MATERIALS.map((mat) => {
          const key = `${producto}||${mat}`
          const id = idMap[key]
          const precio = cat[producto]?.[mat] ?? null
          return (
            <td key={mat} className="p-2.5 text-center">
              <PriceCell
                id={id}
                precio={precio}
                categoria="monofocales"
                producto={producto}
                material={mat}
                onEdit={onEdit}
              />
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <section id="tab-monofocales" className="tab-content active">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-glasses" /></span>
              CATÁLOGO DE LENTES MONOFOCALES
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Precios expresados en Soles Peruanos (S/). Haz clic sobre cualquier celda de precio para editarla.
            </p>
          </div>
          <div className="text-xs bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20">
            14 Tratamientos • 8 Opciones de Material
          </div>
        </div>
        <div className="overflow-x-auto" id="print-area-monofocales">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                <th className="p-3.5 bg-[#00838f] text-left w-72">Tratamiento / Descripción</th>
                {MONO_HEADERS.map((h, i) => (
                  <th key={h} className={`p-3 ${HEADER_COLORS[i]}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MONOFOCAL_PRODUCTS.map((p, i) => renderRow(p, i % 2 !== 0))}
              <tr className="bg-teal-500 text-white font-bold">
                <td className="p-2.5 pl-4 uppercase tracking-wide text-[11px]" colSpan={9}>
                  <i className="fa-solid fa-sun mr-2" /> Lentes de Sol con Protección Especial
                </td>
              </tr>
              {SOL_PRODUCTS.map((p, i) => renderRow(p, i % 2 !== 0))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ─── Tabla Bifocales ──────────────────────────────────────
const BIFOCAL_PRODUCTS = [
  'FLAPTOP UV (TRANSPARENTE)',
  'INVISIBLE UV (TRANSPARENTE)',
  'FLAPTOP ANTIREFLEJO (TRANSPARENTE)',
  'INVISIBLE ANTIREFLEJO (TRANSPARENTE)',
  'FLAPTOP BLUE DEFENSE (LUZ AZUL)',
  'INVISIBLE BLUE DEFENSE (LUZ AZUL)',
  'FLAPTOP FOTOCROMATICO UV (CAMBIA A GRIS O MARRON)',
  'FLAPTOP FOTOCROMATICO AR (UV + AR VERDE CAMBIA)',
  'INVISIBLE FOTOCROMATICO BLUE DEFENSE',
]
const BIF_MATERIALS = ['cristal', 'resina', 'policarbonato']
const BIF_HEADERS = ['Cristal', 'Resina', 'Policarbonato']

function TablaBifocales({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['bifocales'] ?? {}

  return (
    <section id="tab-bifocales" className="tab-content">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-regular fa-eye" /></span>
              TARIFARIO LENTES BIFOCALES
            </h2>
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Opciones Flat-Top & Invisible</span>
          </div>
          <div className="overflow-x-auto" id="print-area-bifocales">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 bg-[#00838f] text-left w-96">Tipo y Tratamiento</th>
                  {BIF_HEADERS.map((h, i) => (
                    <th key={h} className={`p-3 w-44 ${['bg-[#0097a7]', 'bg-[#00796b]', 'bg-[#5e35b1]'][i]}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {BIFOCAL_PRODUCTS.map((producto, idx) => (
                  <tr key={producto} className={`${idx % 2 !== 0 ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-slate-50'} transition`}>
                    <td className="p-3 font-semibold text-xs">
                      <span className={`font-bold ${producto.startsWith('FLAPTOP') ? 'text-[#00838f]' : 'text-[#0097a7]'}`}>
                        {producto.split(' (')[0]}
                      </span>
                      {producto.includes('(') && (
                        <span className="text-slate-500 font-normal"> ({producto.split('(')[1].replace(')', '')})</span>
                      )}
                    </td>
                    {BIF_MATERIALS.map((mat) => {
                      const key = `${producto}||${mat}`
                      const id = idMap[key]
                      const precio = cat[producto]?.[mat] ?? null
                      return (
                        <td key={mat} className="p-2.5 text-center">
                          <PriceCell
                            id={id}
                            precio={precio}
                            categoria="bifocales"
                            producto={producto}
                            material={mat}
                            onEdit={onEdit}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guía visual bifocales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="fa-solid fa-shapes text-[#0097a7]" /> Guía Visual: Tipos de Lentes Bifocales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-[#0097a7] uppercase mb-2">FLAT-TOP (Línea Visible)</span>
              <svg width="220" height="120" viewBox="0 0 220 120" className="my-2">
                <path d="M 20,40 Q 60,10 110,35 Q 160,10 200,40 Q 210,85 170,105 Q 110,115 110,60 Q 110,115 50,105 Q 10,85 20,40 Z" fill="none" stroke="#64748b" strokeWidth="3"/>
                <path d="M 130,75 L 185,75 A 28,28 0 0,1 130,75 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2"/>
                <text x="160" y="55" fontSize="11" fill="#475569" textAnchor="middle">Visión Lejos</text>
                <text x="158" y="90" fontSize="10" fontWeight="bold" fill="#0369a1" textAnchor="middle">Cerca</text>
              </svg>
              <p className="text-[11px] text-slate-500 mt-2">Posee una pestaña en forma de media luna visible con transición marcada para visión lejana y de lectura.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-[#00796b] uppercase mb-2">BIFOCAL INVISIBLE (Lente Suave)</span>
              <svg width="220" height="120" viewBox="0 0 220 120" className="my-2">
                <path d="M 20,40 Q 60,10 110,35 Q 160,10 200,40 Q 210,85 170,105 Q 110,115 110,60 Q 110,115 50,105 Q 10,85 20,40 Z" fill="none" stroke="#64748b" strokeWidth="3"/>
                <ellipse cx="158" cy="82" rx="26" ry="16" fill="#dcfce7" stroke="#16a34a" strokeDasharray="3,3" strokeWidth="2"/>
                <text x="160" y="55" fontSize="11" fill="#475569" textAnchor="middle">Visión Lejos</text>
                <text x="158" y="85" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">Cerca</text>
              </svg>
              <p className="text-[11px] text-slate-500 mt-2">La pastilla de cerca está pulida gradualmente sin corte brusco estético visible a simple vista.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Tabla Multifocales ───────────────────────────────────
const MULTI_PRODUCTS = [
  'OVER VIEW UV (TRANSPARENTE)',
  'ALFA VIEW UV (TRANSPARENTE)',
  'ALFA PREMIUM UV (TRANSPARENTE)',
  'OVER VIEW AR (UV + AR VERDE)',
  'ALFA VIEW AR (UV + AR VERDE)',
  'ALFA PREMIUM AR (UV + AR VERDE)',
  'OVER VIEW BLUE DEFENSE (LUZ AZUL)',
  'ALFA VIEW BLUE DEFENSE (LUZ AZUL)',
  'ALFA PREMIUM BLUE DEFENSE (LUZ AZUL)',
  'OVER VIEW FOTOCROMATICO UV (GRIS O MARRON)',
  'ALFA VIEW FOTOCROMATICO UV (GRIS O MARRON)',
  'ALFA PREMIUM FOTOCROMATICO UV',
  'OVER VIEW FOTOCROMATICO AR',
  'ALFA VIEW FOTOCROMATICO AR',
  'ALFA PREMIUM FOTOCROMATICO AR',
  'OVER VIEW FOTOCROMATICO BLUE AR',
  'ALFA VIEW FOTOCROMATICO BLUE AR',
  'ALFA PREMIUM FOTOCROMATICO BLUE AR',
]
const MULTI_MATERIALS = ['resina', 'policarbonato', 'ai_1_67', 'ai_1_74']
const MULTI_HEADERS = ['Resina', 'Policarbonato', 'AI 1.67', 'AI 1.74']

function TablaMultifocales({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['multifocales'] ?? {}

  const getProductLabel = (p: string) => {
    if (p.startsWith('OVER VIEW')) return { prefix: 'OVER VIEW', color: 'text-[#00838f]' }
    if (p.startsWith('ALFA VIEW')) return { prefix: 'ALFA VIEW', color: 'text-[#0097a7]' }
    return { prefix: 'ALFA PREMIUM', color: 'text-[#5e35b1]' }
  }

  return (
    <section id="tab-multifocales" className="tab-content">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-arrows-split-up-and-left" /></span>
              TARIFARIO LENTES MULTIFOCALES (PROGRESIVOS)
            </h2>
            <p className="text-xs text-teal-100">Gamas Over View, Alfa View y Alfa Premium</p>
          </div>
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Visión Cerca, Intermedia y Lejos</span>
        </div>
        <div className="overflow-x-auto" id="print-area-multifocales">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                <th className="p-3.5 bg-[#00838f] text-left w-80">Línea y Tratamiento</th>
                {MULTI_HEADERS.map((h, i) => (
                  <th key={h} className={`p-3 w-36 ${['bg-[#00796b]', 'bg-[#5e35b1]', 'bg-[#8d6e63]', 'bg-[#5d4037]'][i]}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MULTI_PRODUCTS.map((producto, idx) => {
                const { color } = getProductLabel(producto)
                const rowBg = idx % 2 !== 0 ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-slate-50'
                return (
                  <tr key={producto} className={`${rowBg} transition`}>
                    <td className="p-3 font-semibold text-xs">
                      <span className={`font-bold ${color}`}>{producto.split(' (')[0]}</span>
                      {producto.includes('(') && (
                        <span className="text-slate-500 font-normal"> ({producto.split('(')[1].replace(')', '')})</span>
                      )}
                    </td>
                    {MULTI_MATERIALS.map((mat) => {
                      const key = `${producto}||${mat}`
                      const id = idMap[key]
                      const precio = cat[producto]?.[mat] ?? null
                      return (
                        <td key={mat} className="p-2.5 text-center">
                          <PriceCell
                            id={id}
                            precio={precio}
                            categoria="multifocales"
                            producto={producto}
                            material={mat}
                            onEdit={onEdit}
                            colorClass={mat === 'policarbonato' ? 'text-[#5e35b1] bg-[#ede7f6]' : ''}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ─── Fabricación ──────────────────────────────────────────
const FAB_PRODUCTS = [
  'CRISTAL UV', 'CRISTAL AR', 'CRISTAL BLUE DEFENSE', 'CRISTAL FOTOCROMATICO',
  'RESINA UV', 'RESINA AR', 'RESINA BLUE DEFENSE', 'RESINA FOTOCROMATICO',
  'POLICARBONATO UV', 'POLICARBONATO AR', 'POLICARBONATO BLUE DEFENSE', 'POLICARBONATO FOTOCROMATICO',
]
const FAB_MATERIALS = ['esf_cil_2_25_4', 'esf_cil_4_25_6']

function TablaFabricacion({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['fabricacion'] ?? {}

  return (
    <section id="tab-fabricacion" className="tab-content">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-industry" /></span>
              COSTOS DE FABRICACIÓN POR RANGOS ESPECIALES
            </h2>
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Recargos según graduación</span>
          </div>
          <div className="overflow-x-auto" id="print-area-fabricacion">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 bg-[#00838f] text-left w-96">Material y Tratamiento</th>
                  <th className="p-3 bg-[#0097a7] w-60">
                    ESF. ±4.00<br /><span className="text-[10px] font-normal">CIL. -2.25 a -4.00</span>
                  </th>
                  <th className="p-3 bg-[#00796b] w-60">
                    ESF. ±4.00<br /><span className="text-[10px] font-normal">CIL. -4.25 a -6.00</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {FAB_PRODUCTS.map((producto, idx) => (
                  <tr key={producto} className={`${idx % 2 !== 0 ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-slate-50'} transition`}>
                    <td className="p-3 font-semibold text-xs">{producto}</td>
                    {FAB_MATERIALS.map((mat) => {
                      const key = `${producto}||${mat}`
                      const id = idMap[key]
                      const precio = cat[producto]?.[mat] ?? null
                      return (
                        <td key={mat} className="p-2.5 text-center">
                          <PriceCell
                            id={id}
                            precio={precio}
                            categoria="fabricacion"
                            producto={producto}
                            material={mat}
                            isRecargo
                            onEdit={onEdit}
                            colorClass={mat === 'esf_cil_2_25_4' ? 'text-[#00796b] bg-green-50' : 'text-emerald-800 bg-emerald-100'}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparador de índices */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-[#0097a7]" /> Comparador de Espesor según Índice de Refracción
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'No reducido', tag: 'Índice 1.50', color: 'slate', pct: 'Espesor Base (100%)', svgFill: '#38bdf8', svgStroke: '#0284c7', dPath: 'M 25,22 Q 50,22 75,22 Q 65,65 50,65 Q 35,65 25,22 Z' },
              { label: 'Fino', tag: 'Índice 1.60', color: 'teal', pct: '-20% Reducción', svgFill: '#2dd4bf', svgStroke: '#0d9488', dPath: 'M 25,22 Q 50,22 75,22 Q 62,56 50,56 Q 38,56 25,22 Z' },
              { label: 'Muy Fino', tag: 'Índice 1.67', color: 'emerald', pct: '-35% Reducción', svgFill: '#34d399', svgStroke: '#059669', dPath: 'M 25,22 Q 50,22 75,22 Q 60,48 50,48 Q 40,48 25,22 Z' },
              { label: 'Extra Fino', tag: 'Índice 1.74', color: 'purple', pct: '-45% Extra Delgado', svgFill: '#c084fc', svgStroke: '#7e22ce', dPath: 'M 25,22 Q 50,22 75,22 Q 58,40 50,40 Q 42,40 25,22 Z' },
            ].map(({ label, tag, pct, svgFill, svgStroke, dPath }) => (
              <div key={tag} className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">{label}</span>
                  <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded mt-1">{tag}</span>
                </div>
                <div className="my-5 flex justify-center">
                  <svg width="100" height="70" viewBox="0 0 100 70">
                    <path d="M 10,20 L 30,20 C 30,55 70,55 70,20 L 90,20" fill="none" stroke="#94a3b8" strokeWidth="2"/>
                    <path d={dPath} fill={svgFill} fillOpacity="0.4" stroke={svgStroke} strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-xs font-extrabold text-slate-600 bg-white py-1 rounded border border-slate-200">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Descartables ─────────────────────────────────────────
const DESC_PRODUCTS = [
  { nombre: 'AIR OPTIX COLOR S/M (SOLO MIOPIA O HIPERMETROPIA)', detalle: 'Medidas de +6.00 a -9.00 • Caja por 6 unidades', entrega: 'STOCK' },
  { nombre: 'AIR OPTIX COLOR C/M (SOLO MIOPIA O HIPERMETROPIA)', detalle: 'Estuche y líquido a partir de dos cajas', entrega: 'STOCK' },
  { nombre: 'ESFÉRICOS (SOLO MIOPIA O HIPERMETROPIA)', detalle: 'Medidas desde +4.00 hasta -8.00 (Estuche y líquido a partir de 2 cajas)', entrega: '7d HÁBILES' },
  { nombre: 'SILICONA (SOLO MIOPIA O HIPERMETROPIA)', detalle: 'Medidas de +8.00 a -12.00 • Caja por 6 unidades', entrega: 'STOCK' },
  { nombre: 'SOF LENS ASTIGMATISMO', detalle: 'Medidas de +6.00 a -9.00 CIL -0.75; -1.25; -1.75; -2.25; -2.75 Eje 10 a 180 pasos de 10', entrega: '30d HÁBILES' },
  { nombre: 'PURE VISION ASTIGMATISMO', detalle: 'Medidas de +6.00 a -9.00 CIL -0.75; -1.25; -1.75; -2.25 Eje 10 a 180 pasos de 10', entrega: '30d HÁBILES' },
  { nombre: 'SOF LENS MULTIFOCAL', detalle: 'Medidas de +6.00 a -10.00 • Caja por 6 unidades', entrega: '30d HÁBILES' },
  { nombre: 'AIR OPTIX VISION MULTIFOCAL', detalle: 'Medidas de +6.00 a -10.00 • Caja por 6 unidades', entrega: '30d HÁBILES' },
]

function TablaDescartables({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['descartables'] ?? {}

  return (
    <section id="tab-descartables" className="tab-content">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-box-archive" /></span>
            LENTES DE CONTACTO DESCARTABLES
          </h2>
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Cajas y Blísters</span>
        </div>
        <div className="overflow-x-auto" id="print-area-descartables">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                <th className="p-3.5 bg-[#00838f] text-left w-72">Producto</th>
                <th className="p-3 bg-[#0097a7] w-36">Precio</th>
                <th className="p-3 bg-[#00796b] text-left pl-6">Características y Graduación</th>
                <th className="p-3 bg-[#5e35b1] w-44">Tiempo de Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {DESC_PRODUCTS.map((p, idx) => {
                const key = `${p.nombre}||`
                const id = idMap[key]
                const precio = cat[p.nombre]?.[''] ?? null
                return (
                  <tr key={p.nombre} className={`${idx % 2 !== 0 ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-slate-50'} transition`}>
                    <td className="p-3.5 font-bold text-slate-800 text-xs">
                      {p.nombre.split(' (')[0]}
                      {p.nombre.includes('(') && (
                        <span className="text-[11px] block font-normal text-slate-500">({p.nombre.split('(')[1].replace(')', '')})</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <PriceCell
                        id={id}
                        precio={precio}
                        categoria="descartables"
                        producto={p.nombre}
                        onEdit={onEdit}
                      />
                    </td>
                    <td className="p-3 pl-6 text-xs text-slate-600">{p.detalle}</td>
                    <td className="p-2.5 text-center">
                      {p.entrega === 'STOCK' ? (
                        <span className="badge-stock">STOCK</span>
                      ) : (
                        <span className="badge-wait">{p.entrega}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* PALETA DE COLORES COSMÉTICOS SEGÚN DISEÑO STITCH */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <i className="fa-solid fa-palette text-[#0097a7]" /> Catálogo Visual de Tonos y Colores Cosméticos
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Colores Vibrantes</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-900 mb-2 relative flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Miel</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-emerald-500 via-green-600 to-teal-800 mb-2 relative flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Verde Esmeralda</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-slate-400 via-gray-600 to-slate-800 mb-2 relative flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Gris Intenso</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 mb-2 relative flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Azul Brillante</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-stone-400 to-sky-400" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Colores Sutiles</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow bg-gradient-to-br from-amber-700 to-stone-900 mb-2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">Café</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow bg-gradient-to-br from-sky-400 to-slate-700 mb-2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">Azul</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow bg-gradient-to-br from-emerald-400 to-stone-700 mb-2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">Verde</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow bg-gradient-to-br from-amber-400 to-amber-700 mb-2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">Pure Hazel</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow bg-gradient-to-br from-slate-300 to-slate-600 mb-2 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-black" />
                  </div>
                  <span className="text-xs font-medium text-slate-800">Gris</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Anuales ──────────────────────────────────────────────
const ANUAL_PRODUCTS_FULL = [
  { nombre: 'OPTIMA 38', detalle: 'Medidas de +5.00 a -12.00 • Blíster uno por unidad', entrega: '4d HÁBILES' },
  { nombre: 'LICRIL PERMANENTE', detalle: 'Medidas de Plano a -20.00 • Blíster uno por unidad', entrega: '4d HÁBILES' },
  { nombre: 'LICRIL 55XL', detalle: 'Medidas de +20.00 a -20.00 • Blíster uno por unidad', entrega: '4d HÁBILES' },
  { nombre: 'LICRIL TORIC I', detalle: 'ESF. +2.00 a -5.00 CIL. HASTA -2.75 • Blíster por 1 unidad', entrega: '7d HÁBILES' },
  { nombre: 'LICRIL TORIC II', detalle: 'ESF. +2.25 a +5.00 / -5.25 a -10.00 CIL. HASTA -4.00', entrega: '7d HÁBILES' },
  { nombre: 'LICRIL TORIC III', detalle: 'ESF. +5.25 a +20.00 / -10.25 a -20.00 CIL. HASTA -8.00', entrega: '7d HÁBILES' },
  { nombre: 'LUNA PUPILA NEGRA', detalle: 'Lente especial cosmético protésico / iris oclusión', entrega: '4d HÁBILES' },
  { nombre: 'ANUAL ESFÉRICO (MIOPIA/HIPERMETROPIA)', detalle: 'Par de lentes de contacto anuales estándar', entrega: '4d HÁBILES' },
  { nombre: 'ANUAL ASTIGMATISMO (TORICO)', detalle: 'Par de lentes de contacto anual tórico', entrega: '7d HÁBILES' },
  { nombre: 'ANUAL MULTIFOCAL', detalle: 'Par de lentes de contacto anual multifocal', entrega: '7d HÁBILES' },
  { nombre: 'ANUAL COLOR ESFÉRICO', detalle: 'Par de lentes cosméticos graduados', entrega: '4d HÁBILES' },
  { nombre: 'ANUAL SILICONA HIDROGEL ESFÉRICO', detalle: 'Alta oxigenación para uso prolongado', entrega: '7d HÁBILES' },
  { nombre: 'ANUAL SILICONA HIDROGEL TORICO', detalle: 'Silicona hidrogel para astigmatismo', entrega: '7d HÁBILES' },
]

function TablaAnuales({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['anuales'] ?? {}

  return (
    <section id="tab-anuales" className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-calendar-check" /></span>
            LENTES DE CONTACTO DE REEMPLAZO ANUAL
          </h2>
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Frascos y Blísters Unitarios</span>
        </div>
        <div className="overflow-x-auto" id="print-area-anuales">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-center font-bold text-white uppercase tracking-wider text-[11px]">
                <th className="p-3.5 bg-[#00838f] text-left w-72">Producto / Marca</th>
                <th className="p-3 bg-[#0097a7] w-36">Precio</th>
                <th className="p-3 bg-[#00796b] text-left pl-6">Características</th>
                <th className="p-3 bg-[#5e35b1] w-44">Tiempo de Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ANUAL_PRODUCTS_FULL.map((item, idx) => {
                const key = `${item.nombre}||`
                const id = idMap[key]
                const precio = cat[item.nombre]?.[''] ?? null
                return (
                  <tr key={item.nombre} className={`${idx % 2 !== 0 ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-slate-50'} transition`}>
                    <td className="p-3.5 font-bold text-slate-800 text-xs">
                      {item.nombre.split(' (')[0]}
                      {item.nombre.includes('(') && (
                        <span className="text-[11px] block font-normal text-slate-500">({item.nombre.split('(')[1].replace(')', '')})</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <PriceCell
                        id={id}
                        precio={precio}
                        categoria="anuales"
                        producto={item.nombre}
                        onEdit={onEdit}
                      />
                    </td>
                    <td className="p-3 pl-6 text-xs text-slate-600">{item.detalle}</td>
                    <td className="p-2.5 text-center">
                      <span className="text-xs font-semibold text-teal-700">{item.entrega}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESCALA DE TONOS OCULARES A1/5 A A8/45 DE STITCH */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-eye-dropper text-[#0097a7]" /> Escala de Tonos Oculares (A1/5 a A8/45)
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 text-center">
          {[
            { tag: 'A1/5', color: '#d7b594' },
            { tag: 'A2/10', color: '#bf926b' },
            { tag: 'A3/15', color: '#ab7a51' },
            { tag: 'A4/20', color: '#8f5d38' },
            { tag: 'A5/25', color: '#6a3f23' },
            { tag: 'A6/35', color: '#543019' },
            { tag: 'A7/40', color: '#402312' },
            { tag: 'A8/45', color: '#2c170a' },
          ].map((t) => (
            <div key={t.tag} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <div
                className="w-10 h-10 mx-auto rounded-full border-2 border-white shadow flex items-center justify-center mb-1"
                style={{ backgroundColor: t.color }}
              >
                <div className="w-4 h-4 rounded-full bg-black" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{t.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Servicios ─────────────────────────────────────────────
const SERV_SECTIONS = [
  {
    titulo: 'Servicios de Reparación y Montaje',
    icon: 'fa-wrench',
    items: [
      { nombre: 'SOLDADURA DE MONTURA (METAL)', desc: 'Reparación de puente o bisagras metálicas con soldadura de alta resistencia.' },
      { nombre: 'ADAPTACIÓN DE LUNAS MARCO CERRADO', desc: 'Corte y montaje de lunas en montura nueva (+S/ 10 para material policarbonato).' },
      { nombre: 'ADAPTACIÓN DE LUNAS MARCO SEMI AL AIRE', desc: 'Corte, ranurado y montaje en montura nueva (+S/ 10 para policarbonato).' },
      { nombre: 'MEDIDA DE VISTA COMPLETA', desc: 'Examen visual computarizado y refracción clínica completa por optometrista.' },
      { nombre: 'EXAMEN DE VISTA COMPLETO', desc: 'Examen preventivo de agudeza visual sin costo adicional.' },
      { nombre: 'ADAPTACIÓN DE LENTES DE CONTACTO', desc: 'Prueba y adaptación clínica con compra de lentes.' },
      { nombre: 'TOPOGRAFÍA CORNEAL', desc: 'Mapeo corneal computarizado para casos especiales.' },
      { nombre: 'AJUSTE Y TEMPLADO DE ARMAZÓN', desc: 'Nivelación de varillas, terminales y centrado ergonómico.' },
      { nombre: 'PULIDO DE LENTES RAYADOS', desc: 'Tratamiento de pulido superficial para remoción de micro-rayas.' },
    ],
  },
  {
    titulo: 'Repuestos y Mantenimiento',
    icon: 'fa-toolbox',
    items: [
      { nombre: 'CAMBIO DE PLAQUETAS (PAR) - PLÁSTICO', desc: 'Almohadillas para la nariz en material plástico de ajuste estándar.' },
      { nombre: 'CAMBIO DE PLAQUETAS (PAR) - SILICONA', desc: 'Almohadillas hipoalergénicas para la nariz en material de silicona suave.' },
      { nombre: 'CAMBIO DE NOSE PADS (PAR)', desc: 'Plaquetas nasales de repuesto con tornillo o presión.' },
      { nombre: 'CAMBIO DE TORNILLOS (C/U)', desc: 'Reemplazo de tornillos para brazo, charnela o plaqueta.' },
      { nombre: 'CAMBIO DE PATILLA', desc: 'Reemplazo o adaptación de varilla completa compatible.' },
      { nombre: 'CAMBIO DE TERMINALES (PAR)', desc: 'Cambio de terminales de brazo o patitas protectoras para lentes.' },
      { nombre: 'KIT REPARACIÓN DE TORNILLOS', desc: 'Estuche portátil de destornillador y surtido de tornillos.' },
    ],
  },
  {
    titulo: 'Accesorios, Estuches y Limpieza',
    icon: 'fa-bag-shopping',
    items: [
      { nombre: 'COLGADORES BÁSICOS', desc: 'Cordón sencillo de tela o nylon resistente.' },
      { nombre: 'COLGADORES CON DISEÑO', desc: 'Cordón tipo cadena, perlas decorativas y estilos modernos.' },
      { nombre: 'COLGADORES DE GOMA', desc: 'Cordón de goma elástica deportiva regulable.' },
      { nombre: 'CORREA ANTIDESLIZANTE', desc: 'Sujetador elástico de seguridad para deporte o niños.' },
      { nombre: 'PAÑOS MICROFIBRA', desc: 'Paño especial de alta densidad para limpieza sin rayaduras.' },
      { nombre: 'PAÑO DE MICROFIBRA', desc: 'Paño de limpieza suave para lunas con tratamiento antireflejo.' },
      { nombre: 'FUNDA DE TELA PARA SOLAR', desc: 'Bolsa de microfibra ligera para evitar rayones en lentes de sol.' },
      { nombre: 'ESTUCHE DURO SOLAR', desc: 'Protector rígido y amplio para lentes de sol grandes.' },
      { nombre: 'ESTUCHE OFTALMICO TIPO SOBRE', desc: 'Protector delgado y plano de ecocuero, ideal para bolsillos.' },
      { nombre: 'ESTUCHE PARA LENTES', desc: 'Estuche rígido estándar con bisagra para anteojos ópticos.' },
      { nombre: 'TOPES DE SILICONA', desc: 'Sujetadores antideslizantes para las varillas tras la oreja.' },
      { nombre: 'PARCHES OCULARES', desc: 'Protectores para terapias visuales o postoperatorios.' },
      { nombre: 'ESTUCHE DE LENTES DE CONTACTO', desc: 'Portalentes hermético para guardado y desinfección segura.' },
      { nombre: 'ESTUCHE PARA LC', desc: 'Estuche portalentes compacto para lentes de contacto.' },
      { nombre: 'PINZA PARA LENTES DE CONTACTO', desc: 'Herramienta de silicona suave para manipulación higiénica.' },
      { nombre: 'LÍQUIDO LIMPIADOR DE LUNAS (20 ML / 60 ML)', desc: 'Spray limpiador antiempañante para todo tipo de lunas y antireflejo.' },
      { nombre: 'LÍQUIDO LIMPIADOR DE LENTES (120ml)', desc: 'Spray limpiador formulado para lunas antireflejo y policarbonato.' },
      { nombre: 'SOLUCIÓN MULTIPROPÓSITO LENTES DE CONTACTO (60 ML / 100 ML / 150 ML)', desc: 'Solución estéril desinfectante, limpiadora y humectante.' },
      { nombre: 'SOLUCIÓN PARA LC MENSUAL (120ml)', desc: 'Líquido para conservación y enjuague de lentes blandos.' },
    ],
  },
]

function TablaServicios({
  prices,
  idMap,
  onEdit,
}: {
  prices: PriceMap
  idMap: Record<string, string>
  onEdit: (id: string, precio: number | null) => void
}) {
  const cat = prices['servicios'] ?? {}

  return (
    <section id="tab-servicios" className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0097a7] to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg"><i className="fa-solid fa-screwdriver-wrench" /></span>
              SERVICIOS DE TALLER ÓPTICO Y ACCESORIOS
            </h2>
            <p className="text-xs text-teal-100">Listado adaptado a lectura vertical optimizada</p>
          </div>
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Tarifario de Taller</span>
        </div>

        <div className="divide-y divide-slate-100 text-slate-700 text-xs" id="print-area-servicios">
          {SERV_SECTIONS.map((sec) => (
            <div key={sec.titulo}>
              <div className="bg-teal-50/60 px-6 py-2.5 font-bold text-[#00838f] uppercase tracking-wider text-[11px] flex items-center gap-2">
                <i className={`fa-solid ${sec.icon}`} /> {sec.titulo}
              </div>
              <div className="divide-y divide-slate-100">
                {sec.items.map((item) => {
                  const key = `${item.nombre}||`
                  const id = idMap[key]
                  const precio = cat[item.nombre]?.[''] ?? null
                  return (
                    <div
                      key={item.nombre}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                    >
                      <div className="max-w-xl">
                        <h4 className="font-bold text-slate-800 text-sm">{item.nombre}</h4>
                        <p className="text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriceCell
                          id={id}
                          precio={precio}
                          categoria="servicios"
                          producto={item.nombre}
                          onEdit={onEdit}
                          colorClass="text-[#0097a7] bg-teal-50 text-sm"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Página Principal ─────────────────────────────────────
export default function CatalogoPage() {
  const [activeTab, setActiveTab] = useState('monofocales')
  const [priceMap, setPriceMap] = useState<PriceMap>({})
  const [idMap, setIdMap] = useState<Record<string, string>>({})
  const [pendingChanges, setPendingChanges] = useState<Map<string, number | null>>(new Map())
  const [pendingMeta, setPendingMeta] = useState<
    Map<string, { categoria?: string; producto?: string; material?: string }>
  >(new Map())
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Carga inicial a través de la API local (segura, usa Supabase en el servidor)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/precios')
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || `Error ${res.status}: Fallo al conectar con el servidor`)
        }
        const typedData = (data ?? []) as CatalogPrice[]

        const pm: PriceMap = {}
        const im: Record<string, string> = {}
        typedData.forEach((row) => {
          if (!pm[row.categoria]) pm[row.categoria] = {}
          if (!pm[row.categoria][row.producto]) pm[row.categoria][row.producto] = {}
          pm[row.categoria][row.producto][row.material] = row.precio
          im[`${row.producto}||${row.material}`] = row.id
        })
        setPriceMap(pm)
        setIdMap(im)
      } catch (err: unknown) {
        console.error(err)
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        showToast(`⚠️ No se cargaron precios: ${msg}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3500)
  }, [])

  // Registra un cambio pendiente y actualiza la visualización
  const handleEdit = useCallback(
    (
      id: string,
      precio: number | null,
      meta?: { categoria?: string; producto?: string; material?: string }
    ) => {
      setPendingChanges((prev) => {
        const next = new Map(prev)
        next.set(id, precio)
        return next
      })

      if (meta && meta.producto) {
        setPendingMeta((prev) => {
          const next = new Map(prev)
          next.set(id, meta)
          return next
        })

        // Actualizar directamente en priceMap usando la metadata del producto
        const cat = meta.categoria || 'monofocales'
        const prod = meta.producto
        const mat = meta.material || ''

        setPriceMap((prev) => {
          const next = { ...prev }
          if (!next[cat]) next[cat] = {}
          if (!next[cat][prod]) next[cat][prod] = {}
          next[cat][prod][mat] = precio
          return { ...next }
        })
      } else {
        // Buscar por id existente
        setPriceMap((prev) => {
          const next = { ...prev }
          for (const cat in next) {
            for (const prod in next[cat]) {
              for (const mat in next[cat][prod]) {
                if (idMap[`${prod}||${mat}`] === id) {
                  next[cat][prod][mat] = precio
                  return { ...next }
                }
              }
            }
          }
          return next
        })
      }
    },
    [idMap]
  )

  // Guarda todos los cambios pendientes — UPDATE / INSERT directo sin historial
  const saveAllChanges = useCallback(async () => {
    if (pendingChanges.size === 0) {
      showToast('No hay cambios pendientes que guardar.')
      return
    }
    setSaving(true)
    try {
      const updates = Array.from(pendingChanges.entries()).map(([id, precio]) => {
        const meta = pendingMeta.get(id)
        return {
          id,
          precio,
          categoria: meta?.categoria,
          producto: meta?.producto,
          material: meta?.material,
        }
      })

      const res = await fetch('/api/precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result?.error || `Error ${res.status} al guardar en el servidor`)
      }

      if (result.errors > 0) {
        showToast(`⚠️ ${result.success} guardados, ${result.errors} con error.`)
      } else {
        showToast(`✅ ${result.success} precio(s) guardados correctamente en Supabase.`)
        setPendingChanges(new Map())
        setPendingMeta(new Map())

        // Actualizar idMap si se insertaron registros nuevos
        if (result.results && Array.isArray(result.results)) {
          setIdMap((prev) => {
            const next = { ...prev }
            result.results.forEach((r: { key?: string; id?: string }) => {
              if (r.key && r.id) {
                next[r.key] = r.id
              }
            })
            return next
          })
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      showToast(`❌ Error al guardar: ${msg}`)
    } finally {
      setSaving(false)
    }
  }, [pendingChanges, pendingMeta, showToast])

  // Exportar a PDF la tabla activa
  const exportToPdf = useCallback(async () => {
    const printAreaId = `print-area-${activeTab}`
    const element = document.getElementById(printAreaId)
    if (!element) {
      showToast('No se encontró la tabla para exportar.')
      return
    }

    // Importación dinámica para evitar SSR issues
    const [html2canvas, { jsPDF }] = await Promise.all([
      import('html2canvas').then((m) => m.default),
      import('jspdf'),
    ])

    showToast('Generando PDF, por favor espera...')

    try {
      // Captura de la tabla con alta resolución
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Ocultar elementos no-print dentro de la captura
        ignoreElements: (el) => el.classList.contains('no-print'),
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 8

      const availWidth = pdfWidth - margin * 2
      const availHeight = pdfHeight - margin * 2

      const imgRatio = canvas.width / canvas.height
      let renderWidth = availWidth
      let renderHeight = availWidth / imgRatio

      if (renderHeight > availHeight) {
        renderHeight = availHeight
        renderWidth = availHeight * imgRatio
      }

      const xOffset = (pdfWidth - renderWidth) / 2
      const yOffset = margin

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight)

      const tabName = TABS.find((t) => t.id === activeTab)?.label ?? activeTab
      pdf.save(`Catalogo_RK_${tabName.replace(/\s+/g, '_')}.pdf`)

      showToast('✅ PDF exportado correctamente.')
    } catch (err) {
      console.error(err)
      showToast('❌ Error al generar el PDF.')
    }
  }, [activeTab, showToast])

  // Imprimir limpio (solo tabla, sin UI)
  const printClean = useCallback(() => {
    window.print()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0097a7] to-[#00796b] flex items-center justify-center text-white shadow-md mx-auto mb-4">
            <i className="fa-solid fa-glasses text-xl animate-pulse" />
          </div>
          <p className="text-slate-600 text-sm font-medium">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  const hasPending = pendingChanges.size > 0

  return (
    <div className="min-h-screen text-slate-800 flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* ─── HEADER ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Marca */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0097a7] to-[#00796b] flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-glasses text-xl" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">ÓPTICA RK VISIÓN</h1>
                <span className="bg-[#e0f7fa] text-[#00838f] text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  Tarifario Digital
                </span>
                {hasPending && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                    {pendingChanges.size} cambio(s) sin guardar
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                SALUD PARA TUS OJOS • SISTEMA WEB INTERACTIVO
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="relative hidden md:block">
              <i className="fa-solid fa-search absolute left-3 top-2.5 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0097a7] w-56"
              />
            </div>

            {/* Indicador modo edición */}
            <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hidden sm:flex">
              <i className="fa-solid fa-pen-to-square mr-1.5 text-[#0097a7]" />
              <span>Clic en precio para editar</span>
            </div>

            {/* Botón Exportar PDF */}
            <button
              onClick={exportToPdf}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2 transition"
              title="Exportar tabla actual a PDF (A4)"
            >
              <i className="fa-solid fa-file-pdf" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>

            {/* Botón Guardar */}
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className={`${
                hasPending
                  ? 'bg-[#0097a7] hover:bg-[#00838f] shadow-md ring-2 ring-amber-300'
                  : 'bg-[#0097a7] hover:bg-[#00838f]'
              } text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 transition disabled:opacity-60`}
            >
              {saving ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                <i className="fa-solid fa-cloud-arrow-up" />
              )}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <nav className="bg-slate-50 border-t border-slate-200 overflow-x-auto no-print">
          <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2 py-1.5 whitespace-nowrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition ${
                  activeTab === tab.id
                    ? 'bg-[#0097a7] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 font-medium'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div id="print-area">
          {activeTab === 'monofocales' && (
            <TablaMonofocales prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'bifocales' && (
            <TablaBifocales prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'multifocales' && (
            <TablaMultifocales prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'fabricacion' && (
            <TablaFabricacion prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'descartables' && (
            <TablaDescartables prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'anuales' && (
            <TablaAnuales prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
          {activeTab === 'servicios' && (
            <TablaServicios prices={priceMap} idMap={idMap} onEdit={handleEdit} />
          )}
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 no-print">
        © {new Date().getFullYear()} Óptica RK Visión — Tarifario Digital Interactivo
      </footer>

      {/* ─── Toast ─── */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}
