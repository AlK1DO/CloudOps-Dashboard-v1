import React, { useState, useRef, useEffect } from 'react';
import { Menu, Globe, ShieldCheck, User, ChevronDown, CheckCircle2, AlertTriangle, Clock, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCloud } from '../context/CloudContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':      { title: 'Dashboard',          subtitle: 'Resumen ejecutivo y estado de la solución Cloud' },
  '/planning':       { title: 'Planificación Cloud',         subtitle: 'Registro y análisis de propuestas de arquitectura' },
  '/costs':          { title: 'Costos y Economía Cloud',     subtitle: 'Estimación y desglose presupuestario de recursos' },
  '/infrastructure': { title: 'Infraestructura Global',      subtitle: 'Regiones, zonas de disponibilidad y estado operacional' },
  '/security':       { title: 'Seguridad y Cumplimiento',    subtitle: 'Modelo de responsabilidad compartida, IAM y protección de datos' },
  '/network':        { title: 'Arquitectura de Red',         subtitle: 'Flujo perimetral, enrutamiento VPC y recursos internos' },
  '/services':       { title: 'Catálogo de Servicios AWS',   subtitle: 'Componentes principales y especificaciones técnicas' },
};

const PRIMARY_REGION_ID = 'us-east-1';

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location   = useLocation();
  const { regions, selectedRegion, setSelectedRegion } = useCloud();
  const { addToast }    = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentInfo = routeTitles[location.pathname] || {
    title: 'CloudOps Dashboard', subtitle: 'Sistema de Planificación Cloud',
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const activeRegion  = regions.find(r => selectedRegion.startsWith(r.regionCode)) ?? regions[0];
  const hasIssues     = regions.some(r => r.status !== 'Operativo');
  const systemStatus  = hasIssues ? 'Degradado' : 'Normal';

  const statusDot = (status: string) => (
    <span className={`w-2 h-2 rounded-full shrink-0 ${
      status === 'Operativo' ? 'bg-[#16A34A] animate-pulse' :
      status === 'Mantenimiento' ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
    }`} />
  );

  const statusIcon = (status: string) => {
    if (status === 'Operativo')     return <CheckCircle2  className="w-3 h-3 text-[#16A34A]" />;
    if (status === 'Mantenimiento') return <Clock         className="w-3 h-3 text-[#F59E0B]" />;
    return                                 <AlertTriangle className="w-3 h-3 text-[#DC2626]" />;
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b shadow-sm transition-colors"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg lg:hidden transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {currentInfo.title}
          </h1>
          <p className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Acciones derechas */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* ── Selector de región ── */}
        <div className="relative hidden sm:block" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <Globe className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            {activeRegion && statusDot(activeRegion.status)}
            <span className="font-mono">{activeRegion?.regionCode ?? selectedRegion.split(' ')[0]}</span>
            <span className="hidden md:inline" style={{ color: 'var(--text-secondary)' }}>
              ({activeRegion?.location ?? 'N. Virginia'})
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-xl z-50 overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {/* Cabecera */}
              <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  Seleccionar Región Activa
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Región principal siempre es{' '}
                  <span className="font-mono font-semibold text-[#2563EB]">{PRIMARY_REGION_ID}</span>
                </p>
              </div>

              {/* Lista */}
              <div className="py-1">
                {regions.map(region => {
                  const isActive  = selectedRegion.startsWith(region.regionCode);
                  const isPrimary = region.regionCode === PRIMARY_REGION_ID;
                  return (
                    <button
                      key={region.id}
                      onClick={() => {
                        setSelectedRegion(`${region.regionCode} (${region.location})`);
                        setDropdownOpen(false);
                        addToast(
                          region.status === 'Operativo' ? 'info' : 'warning',
                          `Región cambiada a ${region.regionCode}`,
                          region.status !== 'Operativo'
                            ? `⚠ ${region.location} está en ${region.status}`
                            : `${region.location}, ${region.country} · ${region.availabilityZones} AZs`
                        );
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {statusDot(region.status)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold">{region.regionCode}</span>
                            {isPrimary && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white leading-none">
                                Principal
                              </span>
                            )}
                            {isActive && !isPrimary && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                              >
                                Activa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {region.location}, {region.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden md:block">
                          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{region.availabilityZones} AZs</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{region.latencyMs} ms</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          {statusIcon(region.status)}
                          <span className={
                            region.status === 'Operativo'    ? 'text-[#16A34A]' :
                            region.status === 'Mantenimiento'? 'text-[#F59E0B]' : 'text-[#DC2626]'
                          }>
                            {region.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pie */}
              <div
                className="px-4 py-2.5 border-t"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
              >
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  El cambio de región actualiza los KPIs del Dashboard en tiempo real.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toggle modo oscuro */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border transition-all"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark
            ? <Sun  className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          }
        </button>

        {/* Estado del sistema */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          hasIssues
            ? 'bg-amber-50 border-amber-200 text-[#F59E0B] dark:bg-amber-900/20 dark:border-amber-700'
            : 'bg-emerald-50 border-emerald-200 text-[#16A34A] dark:bg-emerald-900/20 dark:border-emerald-700'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AWS: {systemStatus}</span>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs border border-blue-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Arquitecto Cloud</div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Admin IAM</div>
          </div>
        </div>
      </div>
    </header>
  );
};
