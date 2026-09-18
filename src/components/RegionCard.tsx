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
    <div 
      className={`card-base p-5 flex flex-col justify-between ${
        isPrimary ? 'border-[#2563EB] ring-1 ring-[#2563EB]/40' : ''
      }`}
    >
      <div>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {region.regionCode}
                </span>
                {isPrimary && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-[#F59E0B] border border-amber-200 px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-[#1E293B] mt-0.5">
                {region.location}
              </h3>
            </div>
          </div>
          <StatusBadge status={region.status} size="sm" />
        </div>

        <p className="text-xs text-[#64748B] mb-3">
          {region.country} · {region.availabilityZones} Zonas de Disponibilidad (AZs)
        </p>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-50 rounded-xl border border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Server className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Zonas: <strong className="text-[#1E293B]">{region.availabilityZones} AZs</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Latencia: <strong className="text-[#1E293B]">{region.latencyMs} ms</strong></span>
          </div>
        </div>

        {/* Servicios Desplegados */}
        <div>
          <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#2563EB]" />
            Servicios Desplegados ({region.deployedServices.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {region.deployedServices.map((service, index) => (
              <span 
                key={index}
                className="text-[11px] px-2 py-0.5 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-md shadow-2xs font-medium"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
        <span>Infraestructura global AWS</span>
        <span className="font-semibold text-[#16A34A]">99.99% Uptime</span>
      </div>
    </div>
  );
};
