import React from 'react';
import { Globe, Server, Activity, Layers } from 'lucide-react';
import { GlobalRegion } from '../types/cloud';
import { StatusBadge } from './StatusBadge';

interface RegionCardProps {
  region: GlobalRegion;
  isPrimary?: boolean;
}

export const RegionCard: React.FC<RegionCardProps> = ({ region, isPrimary = false }) => {
  return (
    <div className={`card-base p-5 flex flex-col justify-between ${isPrimary ? 'ring-1 ring-[#2563EB]/40' : ''}`}
      style={isPrimary ? { borderColor: '#2563EB' } : {}}
    >
      <div>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                  {region.regionCode}
                </span>
                {isPrimary && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                    Principal
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {region.location}
              </h3>
            </div>
          </div>
          <StatusBadge status={region.status} size="sm" />
        </div>

        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          {region.country} · {region.availabilityZones} Zonas de Disponibilidad (AZs)
        </p>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl text-xs"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Server className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Zonas: <strong style={{ color: 'var(--text-primary)' }}>{region.availabilityZones} AZs</strong></span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Latencia: <strong style={{ color: 'var(--text-primary)' }}>{region.latencyMs} ms</strong></span>
          </div>
        </div>

        {/* Servicios */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}>
            <Layers className="w-3 h-3 text-[#2563EB]" />
            Servicios Desplegados ({region.deployedServices.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {region.deployedServices.map((service, i) => (
              <span key={i}
                className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}>
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <span>Infraestructura global AWS</span>
        <span className="font-semibold text-[#16A34A]">99.99% Uptime</span>
      </div>
    </div>
  );
};
