import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Óptica RK Visión — Catálogo de Tarifas y Servicios',
  description:
    'Tarifario digital interactivo de Óptica RK Visión. Lentes monofocales, bifocales, multifocales, lentes de contacto y servicios.',
  keywords: ['óptica', 'lentes', 'tarifario', 'RK Visión', 'monofocales', 'multifocales'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Poppins cargado vía <link> para evitar dependencia de next/font/google en build sin red */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
