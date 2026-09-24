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
            <h3 className="font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {pillar.title}
            </h3>
          </div>
          <StatusBadge status={pillar.status} />
        </div>

        {/* Descripción */}
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          {pillar.description}
        </p>

        {/* Diagnóstico */}
        <div className="p-3 rounded-xl mb-3"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Diagnóstico: </strong>
            {pillar.details}
          </p>
        </div>

        {/* Responsabilidad compartida */}
        {(pillar.awsResponsibility || pillar.customerResponsibility) && (
          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            {pillar.awsResponsibility && (
              <div className="flex items-start gap-2 text-xs">
                <Cloud className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AWS (De la nube): </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{pillar.awsResponsibility}</span>
                </div>
              </div>
            )}
            {pillar.customerResponsibility && (
              <div className="flex items-start gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cliente (En la nube): </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{pillar.customerResponsibility}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px]"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>AWS Well-Architected</span>
        </div>
        <span>ID: {pillar.id}</span>
      </div>
    </div>
  );
};
