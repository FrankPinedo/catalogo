-- ============================================================
-- ÓPTICA RK VISIÓN — Esquema de Base de Datos Supabase/PostgreSQL
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Tabla principal de precios del catálogo
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalog_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria   TEXT NOT NULL,           -- monofocales | bifocales | multifocales | fabricacion | descartables | anuales | servicios
  producto    TEXT NOT NULL,           -- nombre del producto / tratamiento
  material    TEXT NOT NULL DEFAULT '', -- cristal | resina | policarbonato | ai_1_6 | ai_1_67 | ai_1_74 | 1_7_cristal | 1_8_cristal | ''
  precio      NUMERIC(10,2),           -- NULL = no disponible (muestra "-")
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_catalog_prices_categoria ON public.catalog_prices(categoria);
CREATE INDEX IF NOT EXISTS idx_catalog_prices_producto  ON public.catalog_prices(producto);

-- ----------------------------------------------------------------
-- 2. Tabla de textos editables del catálogo
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalog_texts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       TEXT UNIQUE NOT NULL,    -- identificador único del texto, p.ej. "monofocal_uv_descripcion"
  valor       TEXT NOT NULL,           -- contenido del texto
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. Función para actualizar updated_at automáticamente
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS set_updated_at_prices ON public.catalog_prices;
CREATE TRIGGER set_updated_at_prices
  BEFORE UPDATE ON public.catalog_prices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_texts ON public.catalog_texts;
CREATE TRIGGER set_updated_at_texts
  BEFORE UPDATE ON public.catalog_texts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- 4. Row Level Security (RLS) — Lectura pública, escritura abierta
--    (Ajusta según tus necesidades de autenticación)
-- ----------------------------------------------------------------
ALTER TABLE public.catalog_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_texts  ENABLE ROW LEVEL SECURITY;

-- Políticas: cualquier usuario puede leer y actualizar
CREATE POLICY "Lectura pública de precios" ON public.catalog_prices
  FOR SELECT USING (true);

CREATE POLICY "Actualización de precios" ON public.catalog_prices
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Lectura pública de textos" ON public.catalog_texts
  FOR SELECT USING (true);

CREATE POLICY "Actualización de textos" ON public.catalog_texts
  FOR UPDATE USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------
-- 5. Datos iniciales — Monofocales (14 tratamientos × 8 materiales)
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
-- UV TRANSPARENTE
('monofocales','UV (TRANSPARENTE)','cristal',110),
('monofocales','UV (TRANSPARENTE)','resina',70),
('monofocales','UV (TRANSPARENTE)','policarbonato',140),
('monofocales','UV (TRANSPARENTE)','ai_1_6',380),
('monofocales','UV (TRANSPARENTE)','ai_1_67',800),
('monofocales','UV (TRANSPARENTE)','ai_1_74',1000),
('monofocales','UV (TRANSPARENTE)','cristal_1_7',450),
('monofocales','UV (TRANSPARENTE)','cristal_1_8',800),
-- ANTIREFLEJO
('monofocales','ANTIREFLEJO (UV + AR VERDE)','cristal',150),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','resina',100),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','policarbonato',180),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','ai_1_6',550),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','ai_1_67',950),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','ai_1_74',1200),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','cristal_1_7',700),
('monofocales','ANTIREFLEJO (UV + AR VERDE)','cristal_1_8',1000),
-- BLUE DEFENSE
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','cristal',NULL),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','resina',180),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','policarbonato',260),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','ai_1_6',800),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','ai_1_67',1200),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','ai_1_74',1500),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','cristal_1_7',NULL),
('monofocales','BLUE DEFENSE (UV + AR + FILTRO LUZ AZUL)','cristal_1_8',NULL),
-- FOTOCROMATICO UV
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','cristal',180),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','resina',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','policarbonato',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','ai_1_6',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','ai_1_67',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','ai_1_74',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','cristal_1_7',NULL),
('monofocales','FOTOCROMATICO UV (MARRON - GRIS)','cristal_1_8',NULL),
-- FOTOCROMATICO AR
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','cristal',320),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','resina',320),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','policarbonato',NULL),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','ai_1_6',NULL),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','ai_1_67',NULL),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','ai_1_74',NULL),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','cristal_1_7',NULL),
('monofocales','FOTOCROMATICO AR (MARRON - GRIS)','cristal_1_8',NULL),
-- FOTOCROMATICO BLUE AR
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','cristal',NULL),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','resina',400),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','policarbonato',NULL),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','ai_1_6',1200),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','ai_1_67',1500),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','ai_1_74',1700),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','cristal_1_7',NULL),
('monofocales','FOTOCROMATICO BLUE AR (MARRON - GRIS)','cristal_1_8',NULL),
-- FOTO FREE BLUE
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','cristal',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','resina',500),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','policarbonato',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','ai_1_6',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','ai_1_67',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','ai_1_74',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','cristal_1_7',NULL),
('monofocales','FOTO - FREE BLUE (ROSADO-PURPURA-AZUL-VERDE)','cristal_1_8',NULL),
-- FOTO DRIVE FREE
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','cristal',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','resina',700),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','policarbonato',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','ai_1_6',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','ai_1_67',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','ai_1_74',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','cristal_1_7',NULL),
('monofocales','FOTO DRIVE - FREE (AMARILLO A GRIS)','cristal_1_8',NULL),
-- TRANSITION UV
('monofocales','TRANSITION UV','cristal',NULL),
('monofocales','TRANSITION UV','resina',700),
('monofocales','TRANSITION UV','policarbonato',900),
('monofocales','TRANSITION UV','ai_1_6',NULL),
('monofocales','TRANSITION UV','ai_1_67',NULL),
('monofocales','TRANSITION UV','ai_1_74',1900),
('monofocales','TRANSITION UV','cristal_1_7',NULL),
('monofocales','TRANSITION UV','cristal_1_8',NULL),
-- TRANSITION AR
('monofocales','TRANSITION AR','cristal',NULL),
('monofocales','TRANSITION AR','resina',800),
('monofocales','TRANSITION AR','policarbonato',1000),
('monofocales','TRANSITION AR','ai_1_6',NULL),
('monofocales','TRANSITION AR','ai_1_67',1700),
('monofocales','TRANSITION AR','ai_1_74',NULL),
('monofocales','TRANSITION AR','cristal_1_7',NULL),
('monofocales','TRANSITION AR','cristal_1_8',NULL),
-- SOL UV PLANO
('monofocales','SOL UV PLANO','cristal',NULL),
('monofocales','SOL UV PLANO','resina',140),
('monofocales','SOL UV PLANO','policarbonato',NULL),
('monofocales','SOL UV PLANO','ai_1_6',NULL),
('monofocales','SOL UV PLANO','ai_1_67',NULL),
('monofocales','SOL UV PLANO','ai_1_74',NULL),
('monofocales','SOL UV PLANO','cristal_1_7',NULL),
('monofocales','SOL UV PLANO','cristal_1_8',NULL),
-- SOL UV CURVO
('monofocales','SOL UV CURVO','cristal',NULL),
('monofocales','SOL UV CURVO','resina',240),
('monofocales','SOL UV CURVO','policarbonato',NULL),
('monofocales','SOL UV CURVO','ai_1_6',NULL),
('monofocales','SOL UV CURVO','ai_1_67',NULL),
('monofocales','SOL UV CURVO','ai_1_74',NULL),
('monofocales','SOL UV CURVO','cristal_1_7',NULL),
('monofocales','SOL UV CURVO','cristal_1_8',NULL),
-- SOL POLARIZADO
('monofocales','SOL POLARIZADO','cristal',NULL),
('monofocales','SOL POLARIZADO','resina',350),
('monofocales','SOL POLARIZADO','policarbonato',550),
('monofocales','SOL POLARIZADO','ai_1_6',NULL),
('monofocales','SOL POLARIZADO','ai_1_67',NULL),
('monofocales','SOL POLARIZADO','ai_1_74',NULL),
('monofocales','SOL POLARIZADO','cristal_1_7',NULL),
('monofocales','SOL POLARIZADO','cristal_1_8',NULL),
-- SOL ESPEJADO Y POLARIZADO
('monofocales','SOL ESPEJADO Y POLARIZADO','cristal',NULL),
('monofocales','SOL ESPEJADO Y POLARIZADO','resina',450),
('monofocales','SOL ESPEJADO Y POLARIZADO','policarbonato',800),
('monofocales','SOL ESPEJADO Y POLARIZADO','ai_1_6',NULL),
('monofocales','SOL ESPEJADO Y POLARIZADO','ai_1_67',NULL),
('monofocales','SOL ESPEJADO Y POLARIZADO','ai_1_74',NULL),
('monofocales','SOL ESPEJADO Y POLARIZADO','cristal_1_7',NULL),
('monofocales','SOL ESPEJADO Y POLARIZADO','cristal_1_8',NULL)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 6. Bifocales
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('bifocales','FLAPTOP UV (TRANSPARENTE)','cristal',200),
('bifocales','FLAPTOP UV (TRANSPARENTE)','resina',140),
('bifocales','FLAPTOP UV (TRANSPARENTE)','policarbonato',250),
('bifocales','INVISIBLE UV (TRANSPARENTE)','cristal',NULL),
('bifocales','INVISIBLE UV (TRANSPARENTE)','resina',190),
('bifocales','INVISIBLE UV (TRANSPARENTE)','policarbonato',NULL),
('bifocales','FLAPTOP ANTIREFLEJO (TRANSPARENTE)','cristal',600),
('bifocales','FLAPTOP ANTIREFLEJO (TRANSPARENTE)','resina',350),
('bifocales','FLAPTOP ANTIREFLEJO (TRANSPARENTE)','policarbonato',400),
('bifocales','INVISIBLE ANTIREFLEJO (TRANSPARENTE)','cristal',NULL),
('bifocales','INVISIBLE ANTIREFLEJO (TRANSPARENTE)','resina',420),
('bifocales','INVISIBLE ANTIREFLEJO (TRANSPARENTE)','policarbonato',NULL),
('bifocales','FLAPTOP BLUE DEFENSE (LUZ AZUL)','cristal',NULL),
('bifocales','FLAPTOP BLUE DEFENSE (LUZ AZUL)','resina',400),
('bifocales','FLAPTOP BLUE DEFENSE (LUZ AZUL)','policarbonato',NULL),
('bifocales','INVISIBLE BLUE DEFENSE (LUZ AZUL)','cristal',NULL),
('bifocales','INVISIBLE BLUE DEFENSE (LUZ AZUL)','resina',500),
('bifocales','INVISIBLE BLUE DEFENSE (LUZ AZUL)','policarbonato',NULL),
('bifocales','FLAPTOP FOTOCROMATICO UV (CAMBIA A GRIS O MARRON)','cristal',450),
('bifocales','FLAPTOP FOTOCROMATICO UV (CAMBIA A GRIS O MARRON)','resina',400),
('bifocales','FLAPTOP FOTOCROMATICO UV (CAMBIA A GRIS O MARRON)','policarbonato',NULL),
('bifocales','FLAPTOP FOTOCROMATICO AR (UV + AR VERDE CAMBIA)','cristal',900),
('bifocales','FLAPTOP FOTOCROMATICO AR (UV + AR VERDE CAMBIA)','resina',500),
('bifocales','FLAPTOP FOTOCROMATICO AR (UV + AR VERDE CAMBIA)','policarbonato',NULL),
('bifocales','INVISIBLE FOTOCROMATICO BLUE DEFENSE','cristal',NULL),
('bifocales','INVISIBLE FOTOCROMATICO BLUE DEFENSE','resina',630),
('bifocales','INVISIBLE FOTOCROMATICO BLUE DEFENSE','policarbonato',NULL)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 7. Multifocales
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('multifocales','OVER VIEW UV (TRANSPARENTE)','resina',350),
('multifocales','OVER VIEW UV (TRANSPARENTE)','policarbonato',550),
('multifocales','OVER VIEW UV (TRANSPARENTE)','ai_1_67',1000),
('multifocales','OVER VIEW UV (TRANSPARENTE)','ai_1_74',1200),
('multifocales','ALFA VIEW UV (TRANSPARENTE)','resina',650),
('multifocales','ALFA VIEW UV (TRANSPARENTE)','policarbonato',750),
('multifocales','ALFA VIEW UV (TRANSPARENTE)','ai_1_67',1200),
('multifocales','ALFA VIEW UV (TRANSPARENTE)','ai_1_74',1400),
('multifocales','ALFA PREMIUM UV (TRANSPARENTE)','resina',950),
('multifocales','ALFA PREMIUM UV (TRANSPARENTE)','policarbonato',1300),
('multifocales','ALFA PREMIUM UV (TRANSPARENTE)','ai_1_67',1600),
('multifocales','ALFA PREMIUM UV (TRANSPARENTE)','ai_1_74',1800),
('multifocales','OVER VIEW AR (UV + AR VERDE)','resina',600),
('multifocales','OVER VIEW AR (UV + AR VERDE)','policarbonato',750),
('multifocales','OVER VIEW AR (UV + AR VERDE)','ai_1_67',1250),
('multifocales','OVER VIEW AR (UV + AR VERDE)','ai_1_74',1400),
('multifocales','ALFA VIEW AR (UV + AR VERDE)','resina',800),
('multifocales','ALFA VIEW AR (UV + AR VERDE)','policarbonato',900),
('multifocales','ALFA VIEW AR (UV + AR VERDE)','ai_1_67',1400),
('multifocales','ALFA VIEW AR (UV + AR VERDE)','ai_1_74',1600),
('multifocales','ALFA PREMIUM AR (UV + AR VERDE)','resina',1400),
('multifocales','ALFA PREMIUM AR (UV + AR VERDE)','policarbonato',1700),
('multifocales','ALFA PREMIUM AR (UV + AR VERDE)','ai_1_67',1800),
('multifocales','ALFA PREMIUM AR (UV + AR VERDE)','ai_1_74',2000),
('multifocales','OVER VIEW BLUE DEFENSE (LUZ AZUL)','resina',800),
('multifocales','OVER VIEW BLUE DEFENSE (LUZ AZUL)','policarbonato',900),
('multifocales','OVER VIEW BLUE DEFENSE (LUZ AZUL)','ai_1_67',1400),
('multifocales','OVER VIEW BLUE DEFENSE (LUZ AZUL)','ai_1_74',1600),
('multifocales','ALFA VIEW BLUE DEFENSE (LUZ AZUL)','resina',1000),
('multifocales','ALFA VIEW BLUE DEFENSE (LUZ AZUL)','policarbonato',1100),
('multifocales','ALFA VIEW BLUE DEFENSE (LUZ AZUL)','ai_1_67',1500),
('multifocales','ALFA VIEW BLUE DEFENSE (LUZ AZUL)','ai_1_74',1800),
('multifocales','ALFA PREMIUM BLUE DEFENSE (LUZ AZUL)','resina',1300),
('multifocales','ALFA PREMIUM BLUE DEFENSE (LUZ AZUL)','policarbonato',1400),
('multifocales','ALFA PREMIUM BLUE DEFENSE (LUZ AZUL)','ai_1_67',1800),
('multifocales','ALFA PREMIUM BLUE DEFENSE (LUZ AZUL)','ai_1_74',2100),
('multifocales','OVER VIEW FOTOCROMATICO UV (GRIS O MARRON)','resina',800),
('multifocales','OVER VIEW FOTOCROMATICO UV (GRIS O MARRON)','policarbonato',900),
('multifocales','OVER VIEW FOTOCROMATICO UV (GRIS O MARRON)','ai_1_67',1500),
('multifocales','OVER VIEW FOTOCROMATICO UV (GRIS O MARRON)','ai_1_74',1900),
('multifocales','ALFA VIEW FOTOCROMATICO UV (GRIS O MARRON)','resina',1100),
('multifocales','ALFA VIEW FOTOCROMATICO UV (GRIS O MARRON)','policarbonato',1200),
('multifocales','ALFA VIEW FOTOCROMATICO UV (GRIS O MARRON)','ai_1_67',1700),
('multifocales','ALFA VIEW FOTOCROMATICO UV (GRIS O MARRON)','ai_1_74',2100),
('multifocales','ALFA PREMIUM FOTOCROMATICO UV','resina',1500),
('multifocales','ALFA PREMIUM FOTOCROMATICO UV','policarbonato',1600),
('multifocales','ALFA PREMIUM FOTOCROMATICO UV','ai_1_67',1900),
('multifocales','ALFA PREMIUM FOTOCROMATICO UV','ai_1_74',2300),
('multifocales','OVER VIEW FOTOCROMATICO AR','resina',1000),
('multifocales','OVER VIEW FOTOCROMATICO AR','policarbonato',1100),
('multifocales','OVER VIEW FOTOCROMATICO AR','ai_1_67',1700),
('multifocales','OVER VIEW FOTOCROMATICO AR','ai_1_74',2100),
('multifocales','ALFA VIEW FOTOCROMATICO AR','resina',1300),
('multifocales','ALFA VIEW FOTOCROMATICO AR','policarbonato',1400),
('multifocales','ALFA VIEW FOTOCROMATICO AR','ai_1_67',1900),
('multifocales','ALFA VIEW FOTOCROMATICO AR','ai_1_74',2300),
('multifocales','ALFA PREMIUM FOTOCROMATICO AR','resina',1800),
('multifocales','ALFA PREMIUM FOTOCROMATICO AR','policarbonato',1900),
('multifocales','ALFA PREMIUM FOTOCROMATICO AR','ai_1_67',2100),
('multifocales','ALFA PREMIUM FOTOCROMATICO AR','ai_1_74',2500),
('multifocales','OVER VIEW FOTOCROMATICO BLUE AR','resina',1200),
('multifocales','OVER VIEW FOTOCROMATICO BLUE AR','policarbonato',NULL),
('multifocales','OVER VIEW FOTOCROMATICO BLUE AR','ai_1_67',2000),
('multifocales','OVER VIEW FOTOCROMATICO BLUE AR','ai_1_74',2400),
('multifocales','ALFA VIEW FOTOCROMATICO BLUE AR','resina',1500),
('multifocales','ALFA VIEW FOTOCROMATICO BLUE AR','policarbonato',NULL),
('multifocales','ALFA VIEW FOTOCROMATICO BLUE AR','ai_1_67',2500),
('multifocales','ALFA VIEW FOTOCROMATICO BLUE AR','ai_1_74',2800),
('multifocales','ALFA PREMIUM FOTOCROMATICO BLUE AR','resina',1700),
('multifocales','ALFA PREMIUM FOTOCROMATICO BLUE AR','policarbonato',NULL),
('multifocales','ALFA PREMIUM FOTOCROMATICO BLUE AR','ai_1_67',2500),
('multifocales','ALFA PREMIUM FOTOCROMATICO BLUE AR','ai_1_74',2800)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 8. Fabricación & Índices (recargos por rango de graduación)
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('fabricacion','CRISTAL UV','esf_cil_2_25_4',25),
('fabricacion','CRISTAL UV','esf_cil_4_25_6',45),
('fabricacion','CRISTAL AR','esf_cil_2_25_4',35),
('fabricacion','CRISTAL AR','esf_cil_4_25_6',65),
('fabricacion','CRISTAL BLUE DEFENSE','esf_cil_2_25_4',NULL),
('fabricacion','CRISTAL BLUE DEFENSE','esf_cil_4_25_6',NULL),
('fabricacion','CRISTAL FOTOCROMATICO','esf_cil_2_25_4',25),
('fabricacion','CRISTAL FOTOCROMATICO','esf_cil_4_25_6',35),
('fabricacion','RESINA UV','esf_cil_2_25_4',35),
('fabricacion','RESINA UV','esf_cil_4_25_6',45),
('fabricacion','RESINA AR','esf_cil_2_25_4',40),
('fabricacion','RESINA AR','esf_cil_4_25_6',50),
('fabricacion','RESINA BLUE DEFENSE','esf_cil_2_25_4',35),
('fabricacion','RESINA BLUE DEFENSE','esf_cil_4_25_6',45),
('fabricacion','RESINA FOTOCROMATICO','esf_cil_2_25_4',45),
('fabricacion','RESINA FOTOCROMATICO','esf_cil_4_25_6',65),
('fabricacion','POLICARBONATO UV','esf_cil_2_25_4',50),
('fabricacion','POLICARBONATO UV','esf_cil_4_25_6',70),
('fabricacion','POLICARBONATO AR','esf_cil_2_25_4',40),
('fabricacion','POLICARBONATO AR','esf_cil_4_25_6',50),
('fabricacion','POLICARBONATO BLUE DEFENSE','esf_cil_2_25_4',35),
('fabricacion','POLICARBONATO BLUE DEFENSE','esf_cil_4_25_6',45),
('fabricacion','POLICARBONATO FOTOCROMATICO','esf_cil_2_25_4',45),
('fabricacion','POLICARBONATO FOTOCROMATICO','esf_cil_4_25_6',65)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 9. Lentes de Contacto Descartables
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('descartables','AIR OPTIX COLOR S/M (SOLO MIOPIA O HIPERMETROPIA)','',120),
('descartables','AIR OPTIX COLOR C/M (SOLO MIOPIA O HIPERMETROPIA)','',129),
('descartables','ESFÉRICOS (SOLO MIOPIA O HIPERMETROPIA)','',149),
('descartables','SILICONA (SOLO MIOPIA O HIPERMETROPIA)','',200),
('descartables','SOF LENS ASTIGMATISMO','',320),
('descartables','PURE VISION ASTIGMATISMO','',360),
('descartables','SOF LENS MULTIFOCAL','',360),
('descartables','AIR OPTIX VISION MULTIFOCAL','',400)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 10. Lentes de Contacto Anuales
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('anuales','ANUAL ESFÉRICO (MIOPIA/HIPERMETROPIA)','',380),
('anuales','ANUAL ASTIGMATISMO (TORICO)','',450),
('anuales','ANUAL MULTIFOCAL','',520),
('anuales','ANUAL COLOR ESFÉRICO','',420),
('anuales','ANUAL SILICONA HIDROGEL ESFÉRICO','',480),
('anuales','ANUAL SILICONA HIDROGEL TORICO','',550)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 11. Servicios & Accesorios
-- ----------------------------------------------------------------
INSERT INTO public.catalog_prices (categoria, producto, material, precio) VALUES
('servicios','EXAMEN DE VISTA COMPLETO','',0),
('servicios','ADAPTACIÓN DE LENTES DE CONTACTO','',30),
('servicios','TOPOGRAFÍA CORNEAL','',50),
('servicios','REPARACIÓN DE ARMAZÓN (SOLDADURA)','',20),
('servicios','AJUSTE Y TEMPLADO DE ARMAZÓN','',10),
('servicios','CAMBIO DE PATILLA','',15),
('servicios','CAMBIO DE NOSE PADS (PAR)','',5),
('servicios','PULIDO DE LENTES RAYADOS','',25),
('servicios','LÍQUIDO LIMPIADOR DE LENTES (120ml)','',15),
('servicios','ESTUCHE PARA LENTES','',10),
('servicios','CORREA ANTIDESLIZANTE','',8),
('servicios','PAÑO DE MICROFIBRA','',5),
('servicios','KIT REPARACIÓN DE TORNILLOS','',10),
('servicios','SOLUCIÓN PARA LC MENSUAL (120ml)','',25),
('servicios','ESTUCHE PARA LC','',8)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 12. Textos editables
-- ----------------------------------------------------------------
INSERT INTO public.catalog_texts (clave, valor) VALUES
('monofocales_subtitulo','Precios expresados en Soles Peruanos (S/). Haz clic sobre cualquier celda de precio para editarla.'),
('bifocales_subtitulo','Opciones Flat-Top & Invisible'),
('multifocales_subtitulo','Gamas Over View, Alfa View y Alfa Premium — Visión Cerca, Intermedia y Lejos'),
('fabricacion_subtitulo','Recargos según graduación — ESF. ±4.00'),
('descartables_subtitulo','Cajas y Blísters — Medidas y tiempo de entrega incluidos'),
('anuales_subtitulo','Lentes de contacto anuales y reemplazo programado'),
('servicios_subtitulo','Servicios ópticos y accesorios — Precios en S/')
ON CONFLICT (clave) DO NOTHING;
