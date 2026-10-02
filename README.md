# Óptica RK Visión — Catálogo Digital Interactivo

Aplicación web completa para gestión y visualización del tarifario de **Óptica RK Visión**.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | **Next.js 14** (App Router) + **React 18** |
| Estilos | **Tailwind CSS** |
| Base de datos | **Supabase** (PostgreSQL) |
| Despliegue | **Vercel** |
| PDF Export | **jsPDF** + **html2canvas** |

## 📁 Estructura del Proyecto

```
catalogo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raíz con fuentes y metadata
│   │   ├── page.tsx            # Página principal del catálogo (7 pestañas)
│   │   ├── globals.css         # Estilos globales + print media query
│   │   └── api/
│   │       └── precios/
│   │           └── route.ts    # API REST (GET, POST batch, PATCH)
│   ├── components/             # Componentes reutilizables (futuro)
│   └── lib/
│       └── supabase.ts         # Cliente Supabase + tipos + queries
├── supabase_schema.sql         # Schema completo + datos iniciales
├── .env.example                # Variables de entorno requeridas
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar entorno
```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
```

### 3. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al **SQL Editor** de tu proyecto
3. Ejecuta el contenido de `supabase_schema.sql`
4. Copia la **URL** y la **anon key** en `.env.local`

### 4. Ejecutar en desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

## 🗄️ Base de Datos

El archivo `supabase_schema.sql` crea:

- **`catalog_prices`** — Todos los precios del catálogo (7 categorías)
- **`catalog_texts`** — Textos editables de la interfaz
- **Triggers** de `updated_at` automático
- **RLS** (Row Level Security) con políticas de lectura pública

### Categorías incluidas
1. `monofocales` — 14 tratamientos × 8 materiales
2. `bifocales` — Flat-Top e Invisible
3. `multifocales` — Over View, Alfa View, Alfa Premium
4. `fabricacion` — Recargos por rango de graduación
5. `descartables` — Lentes de contacto descartables
6. `anuales` — Lentes de contacto anuales
7. `servicios` — Servicios y accesorios

## ✏️ Edición de Precios

- **Clic directo** sobre cualquier celda de precio para editarla inline
- Los cambios se marcan visualmente (borde ámbar)
- Botón **"Guardar Cambios"** hace `UPDATE` directo en Supabase (sin historial)
- Confirmación visual con toast notification

## 📄 Exportar PDF (A4)

- Botón **"Exportar PDF"** en el header
- Captura únicamente la tabla activa (sin nav, botones ni UI)
- Formato A4, orientación automática (landscape si la tabla es ancha)
- Nombre de archivo: `Catalogo_RK_{Tab}.pdf`

## 🌐 Despliegue en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel desplegará automáticamente en cada push

## 🔧 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave anónima de Supabase | ✅ |

---

**Óptica RK Visión** • Sistema Web Interactivo
