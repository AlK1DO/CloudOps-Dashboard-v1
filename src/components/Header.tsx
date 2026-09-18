import React from 'react';
import { Menu, Globe, ShieldCheck, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard General',
    subtitle: 'Resumen ejecutivo y estado de la solución Cloud'
  },
  '/planning': {
    title: 'Planificación Cloud',
    subtitle: 'Registro y análisis de propuestas de arquitectura'
  },
  '/costs': {
    title: 'Costos y Economía Cloud',
    subtitle: 'Estimación y desglose presupuestario de recursos'
  },
  '/infrastructure': {
    title: 'Infraestructura Global',
    subtitle: 'Regiones, zonas de disponibilidad y estado operacional'
  },
  '/security': {
    title: 'Seguridad y Cumplimiento',
    subtitle: 'Modelo de responsabilidad compartida, IAM y protección de datos'
  },
  '/network': {
    title: 'Arquitectura de Red',
    subtitle: 'Flujo perimetral, enrutamiento VPC y recursos internos'
  },
  '/services': {
    title: 'Catálogo de Servicios AWS',
    subtitle: 'Componentes principales y especificaciones técnicas'
  }
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const currentInfo = routeTitles[location.pathname] || {
    title: 'CloudOps Dashboard',
    subtitle: 'Sistema de Planificación Cloud'
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1E293B] leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-[#64748B] hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Indicadores rápidos de cabecera */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Región activa */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-[#E2E8F0] text-xs font-medium text-[#1E293B]">
          <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>us-east-1 (N. Virginia)</span>
        </div>

        {/* Estado general de salud */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-[#16A34A]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">AWS Status:</span>
          <span>Normal</span>
        </div>

        {/* Usuario simulado / Rol */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-semibold text-xs border border-blue-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-[#1E293B]">Arquitecto Cloud</div>
            <div className="text-[10px] text-[#64748B]">Admin IAM</div>
          </div>
        </div>
      </div>
    </header>
  );
};
