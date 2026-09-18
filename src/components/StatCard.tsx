import React from 'react';
import { LucideIcon } from 'lucide-react';

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

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'info',
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-[#2563EB]',
}) => {
  const badgeStyles: Record<string, string> = {
    success: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    warning: 'bg-amber-50 text-[#F59E0B] border-amber-200',
    danger: 'bg-rose-50 text-[#DC2626] border-rose-200',
    info: 'bg-blue-50 text-[#2563EB] border-blue-200',
  };

  return (
    <div className="card-base p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold text-[#1E293B] tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
          {subtitle && (
            <p className="text-xs text-[#64748B] truncate">
              {subtitle}
            </p>
          )}
          {badgeText && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${badgeStyles[badgeType]}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
