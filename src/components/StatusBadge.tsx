import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { SecurityStatusLevel, ServiceStatus, RegionHealthStatus } from '../types/cloud';

type BadgeVariant = SecurityStatusLevel | ServiceStatus | RegionHealthStatus | string;

interface StatusBadgeProps {
  status: BadgeVariant;
  text?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  size = 'md' 
}) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;
  let label = text || status;

  if (normalized === 'correcto' || normalized === 'activo' || normalized === 'operativo') {
    // Verde = Correcto (#16A34A)
    colorClasses = 'bg-emerald-50 text-[#16A34A] border-emerald-200';
    Icon = CheckCircle2;
    if (!text && normalized === 'correcto') label = 'Correcto';
  } else if (normalized === 'revision' || normalized === 'requiere revisión' || normalized === 'configurado' || normalized === 'mantenimiento') {
    // Amarillo = Requiere revisión (#F59E0B)
    colorClasses = 'bg-amber-50 text-[#F59E0B] border-amber-200';
    Icon = AlertTriangle;
    if (!text && normalized === 'revision') label = 'Requiere Revisión';
  } else if (normalized === 'problema' || normalized === 'inactivo' || normalized === 'degradado') {
    // Rojo = Problema (#DC2626)
    colorClasses = 'bg-rose-50 text-[#DC2626] border-rose-200';
    Icon = AlertOctagon;
    if (!text && normalized === 'problema') label = 'Problema Detectado';
  } else if (normalized === 'recomendado') {
    colorClasses = 'bg-blue-50 text-[#2563EB] border-blue-200';
    Icon = CheckCircle2;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span 
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} tracking-tight`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{label}</span>
    </span>
  );
};
