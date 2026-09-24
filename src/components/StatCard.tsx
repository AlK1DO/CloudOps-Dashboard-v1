import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  iconBgColor?: string;
  iconColor?: string;
}

const BADGE: Record<string, { lightBg: string; lightText: string; lightBorder: string; darkBg: string; darkText: string; darkBorder: string }> = {
  success: { lightBg: '#f0fdf4', lightText: '#16A34A', lightBorder: '#bbf7d0', darkBg: 'rgba(16,163,74,0.18)',  darkText: '#4ade80', darkBorder: 'rgba(16,163,74,0.4)'  },
  warning: { lightBg: '#fffbeb', lightText: '#d97706', lightBorder: '#fde68a', darkBg: 'rgba(245,158,11,0.18)', darkText: '#fbbf24', darkBorder: 'rgba(245,158,11,0.4)' },
  danger:  { lightBg: '#fff1f2', lightText: '#DC2626', lightBorder: '#fecdd3', darkBg: 'rgba(220,38,38,0.18)',  darkText: '#f87171', darkBorder: 'rgba(220,38,38,0.4)'  },
  info:    { lightBg: '#eff6ff', lightText: '#2563EB', lightBorder: '#bfdbfe', darkBg: 'rgba(37,99,235,0.18)',  darkText: '#60a5fa', darkBorder: 'rgba(37,99,235,0.4)'  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon: Icon,
  badgeText, badgeType = 'info',
  iconBgColor = 'bg-blue-50', iconColor = 'text-[#2563EB]',
}) => {
  const { isDark } = useTheme();
  const b = BADGE[badgeType];
  const badgeStyle = {
    backgroundColor: isDark ? b.darkBg    : b.lightBg,
    color:           isDark ? b.darkText  : b.lightText,
    borderColor:     isDark ? b.darkBorder: b.lightBorder,
  };

  return (
    <div className="card-base p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-4 pt-3 flex items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--border)' }}>
          {subtitle && (
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
          {badgeText && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0"
              style={badgeStyle}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
