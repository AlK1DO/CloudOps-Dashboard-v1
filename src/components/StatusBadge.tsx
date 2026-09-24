import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { SecurityStatusLevel, ServiceStatus, RegionHealthStatus } from '../types/cloud';
import { useTheme } from '../context/ThemeContext';

type BadgeVariant = SecurityStatusLevel | ServiceStatus | RegionHealthStatus | string;

interface StatusBadgeProps {
  status: BadgeVariant;
  text?: string;
  size?: 'sm' | 'md';
}

type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const STYLES: Record<Variant, { lightBg: string; lightText: string; lightBorder: string; darkBg: string; darkText: string; darkBorder: string; }> = {
  success: { lightBg: '#f0fdf4', lightText: '#15803d', lightBorder: '#bbf7d0', darkBg: 'rgba(16,163,74,0.18)',  darkText: '#4ade80', darkBorder: 'rgba(16,163,74,0.4)'  },
  warning: { lightBg: '#fffbeb', lightText: '#b45309', lightBorder: '#fde68a', darkBg: 'rgba(245,158,11,0.18)', darkText: '#fbbf24', darkBorder: 'rgba(245,158,11,0.4)' },
  danger:  { lightBg: '#fff1f2', lightText: '#b91c1c', lightBorder: '#fecdd3', darkBg: 'rgba(220,38,38,0.18)',  darkText: '#f87171', darkBorder: 'rgba(220,38,38,0.4)'  },
  info:    { lightBg: '#eff6ff', lightText: '#1d4ed8', lightBorder: '#bfdbfe', darkBg: 'rgba(37,99,235,0.18)',  darkText: '#60a5fa', darkBorder: 'rgba(37,99,235,0.4)'  },
  neutral: { lightBg: '#f8fafc', lightText: '#475569', lightBorder: '#e2e8f0', darkBg: 'rgba(71,85,105,0.3)',   darkText: '#94a3b8', darkBorder: 'rgba(71,85,105,0.5)'  },
};

const ICONS: Record<Variant, typeof HelpCircle> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  AlertOctagon,
  info:    CheckCircle2,
  neutral: HelpCircle,
};

function resolveVariant(normalized: string): Variant {
  if (['correcto', 'activo', 'operativo'].includes(normalized)) return 'success';
  if (['revision', 'requiere revisión', 'configurado', 'mantenimiento'].includes(normalized)) return 'warning';
  if (['problema', 'inactivo', 'degradado'].includes(normalized)) return 'danger';
  if (normalized === 'recomendado') return 'info';
  return 'neutral';
}

function resolveLabel(normalized: string, text?: string, status?: string): string {
  if (text) return text;
  if (normalized === 'correcto')   return 'Correcto';
  if (normalized === 'revision')   return 'Requiere Revisión';
  if (normalized === 'problema')   return 'Problema Detectado';
  return status ?? normalized;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'md' }) => {
  const { isDark } = useTheme();
  const normalized = status.toLowerCase();
  const variant    = resolveVariant(normalized);
  const label      = resolveLabel(normalized, text, status);
  const Icon       = ICONS[variant];
  const s          = STYLES[variant];

  const style = {
    backgroundColor: isDark ? s.darkBg     : s.lightBg,
    color:           isDark ? s.darkText   : s.lightText,
    borderColor:     isDark ? s.darkBorder : s.lightBorder,
    border: '1px solid',
  };

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full shrink-0 ${sizeClasses}`} style={style}>
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{label}</span>
    </span>
  );
};
