import React from 'react';
import { ShieldCheck, Cloud, UserCheck } from 'lucide-react';
import { SecurityPillar } from '../types/cloud';
import { StatusBadge } from './StatusBadge';

interface SecurityCardProps {
  pillar: SecurityPillar;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({ pillar }) => {
  return (
    <div className="card-base p-5 flex flex-col justify-between">
      <div>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block">
              {pillar.category}
            </span>
            <h3 className="font-bold text-base text-[#1E293B] mt-0.5">
              {pillar.title}
            </h3>
          </div>
          <StatusBadge status={pillar.status} />
        </div>

        {/* Descripción general */}
        <p className="text-xs text-[#64748B] leading-relaxed mb-3">
          {pillar.description}
        </p>

        {/* Detalles de auditoría */}
        <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] mb-3">
          <p className="text-xs text-[#1E293B] leading-relaxed">
            <strong className="text-[#1E293B]">Diagnóstico: </strong>
            {pillar.details}
          </p>
        </div>

        {/* Desglose de Responsabilidad Compartida (si existe) */}
        {(pillar.awsResponsibility || pillar.customerResponsibility) && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-2">
            {pillar.awsResponsibility && (
              <div className="flex items-start gap-2 text-xs">
                <Cloud className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1E293B]">AWS (De la nube): </span>
                  <span className="text-[#64748B]">{pillar.awsResponsibility}</span>
                </div>
              </div>
            )}
            {pillar.customerResponsibility && (
              <div className="flex items-start gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1E293B]">Cliente (En la nube): </span>
                  <span className="text-[#64748B]">{pillar.customerResponsibility}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Cumplimiento AWS Well-Architected</span>
        </div>
        <span>ID: {pillar.id}</span>
      </div>
    </div>
  );
};
