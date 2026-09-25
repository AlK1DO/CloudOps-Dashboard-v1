-- ==============================================================================
-- CloudOps Dashboard: Esquema Semiestructurado para PostgreSQL (Supabase)
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/zhkirqhvpqjlfgbtgrrz/sql
-- ==============================================================================

-- 1. Tabla de Perfiles de Clientes / Usuarios
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dni TEXT,                            -- Documento de Identidad / DNI
    company TEXT,
    phone TEXT,
    email TEXT,
    region TEXT DEFAULT 'Lima',
    district TEXT DEFAULT 'Cercado de Lima',
    ip TEXT,                             -- IP pública real de registro
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,  -- Datos semiestructurados
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Consultas Técnicas y Presupuestarias Generadas con Coordenadas Reales
CREATE TABLE IF NOT EXISTS public.client_consultations (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_dni TEXT,
    client_ip TEXT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Presentada',
    estimated_monthly_cost NUMERIC(12, 2) DEFAULT 0.00,
    estimated_annual_cost NUMERIC(12, 2) DEFAULT 0.00,
    selected_region TEXT NOT NULL,
    district_execution TEXT NOT NULL,
    latitude NUMERIC(10, 6) DEFAULT -12.0460,   -- Coordenada GPS real
    longitude NUMERIC(10, 6) DEFAULT -77.0305,  -- Coordenada GPS real
    services_payload JSONB DEFAULT '[]'::jsonb,       -- Semiestructurado: catálogo y cantidades de servicios AWS
    architecture_payload JSONB DEFAULT '{}'::jsonb,   -- Semiestructurado: datos de la arquitectura
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Bitácora / Auditoría (Módulo Auditorio)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,         -- 'Creación de Usuario', 'Generación de Consulta', 'Exportación', 'Eliminación', etc.
    entity_type TEXT NOT NULL,    -- 'Usuario', 'Consulta', 'Sistema'
    entity_id TEXT,
    user_name TEXT,
    region TEXT,
    district TEXT,
    details JSONB DEFAULT '{}'::jsonb, -- Semiestructurado: detalles técnicos, IP, cambios realizados
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Índices para consultas ágiles sobre datos estructurados y JSONB
CREATE INDEX IF NOT EXISTS idx_client_profiles_company ON public.client_profiles(company);
CREATE INDEX IF NOT EXISTS idx_client_profiles_district ON public.client_profiles(district);
CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON public.client_consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.client_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_services_gin ON public.client_consultations USING gin (services_payload);

-- 5. Habilitar Row Level Security (RLS) y permitir operaciones anónimas/públicas
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para permitir el uso directo con la clave pública de Vite
DO $$
BEGIN
    -- client_profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo en client_profiles') THEN
        CREATE POLICY "Permitir todo en client_profiles" ON public.client_profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- client_consultations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo en client_consultations') THEN
        CREATE POLICY "Permitir todo en client_consultations" ON public.client_consultations FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- audit_logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo en audit_logs') THEN
        CREATE POLICY "Permitir todo en audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. Habilitar Tiempo Real (Supabase Realtime) en las tablas
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles, public.client_consultations, public.audit_logs;
EXCEPTION WHEN OTHERS THEN
    -- Ya estaban añadidas o publicación gestionada
    NULL;
END $$;
