import React from 'react';
import { Server, HardDrive, Database, ShieldCheck, Share2, Zap, Tag, Globe } from 'lucide-react';
import { AwsService } from '../types/cloud';
import { StatusBadge } from './StatusBadge';

interface ServiceCardProps {
  service: AwsService;
  onSelect?: (service: AwsService) => void;
  isSelected?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Computación':                 return Server;
    case 'Almacenamiento':              return HardDrive;
    case 'Base de Datos':               return Database;
    case 'Seguridad':                   return ShieldCheck;
    case 'Redes y Entrega de Contenido':return Share2;
    default:                            return Zap;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, isSelected = false }) => {
  const Icon = getCategoryIcon(service.category);

  return (
    <div
      className={`card-base p-5 flex flex-col justify-between transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-[#2563EB]' : ''
      }`}
      onClick={() => onSelect?.(service)}
    >
      <div>
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>
                {service.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Tag className="w-3 h-3 text-[#2563EB]" />
                <span>{service.category}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={service.status} size="sm" />
        </div>

        {/* Descripción */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {service.description}
        </p>

        {/* Función principal */}
        <div className="p-3 rounded-xl mb-4"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}>
            <Globe className="w-3 h-3 text-[#2563EB]" />
            Función Principal
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {service.mainFunction}
          </p>
        </div>
      </div>

      {/* Pie */}
      <div className="pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          Tarifa referencial:{' '}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {service.hourlyRate > 0 ? `$${service.hourlyRate.toFixed(4)}/h` : 'Sin costo base'}
          </span>
        </div>
        {onSelect && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onSelect(service); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
              isSelected
                ? 'bg-[#2563EB] text-white'
                : 'text-[#2563EB]'
            }`}
            style={isSelected ? {} : { backgroundColor: 'var(--bg-muted)' }}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        )}
      </div>
    </div>
  );
};
