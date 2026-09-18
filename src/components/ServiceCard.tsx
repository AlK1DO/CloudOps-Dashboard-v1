import React from 'react';
import { 
  Server, 
  HardDrive, 
  Database, 
  ShieldCheck, 
  Share2, 
  Globe, 
  Zap,
  Tag
} from 'lucide-react';
import { AwsService } from '../types/cloud';
import { StatusBadge } from './StatusBadge';

interface ServiceCardProps {
  service: AwsService;
  onSelect?: (service: AwsService) => void;
  isSelected?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Computación':
      return Server;
    case 'Almacenamiento':
      return HardDrive;
    case 'Base de Datos':
      return Database;
    case 'Seguridad':
      return ShieldCheck;
    case 'Redes y Entrega de Contenido':
      return Share2;
    default:
      return Zap;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelect,
  isSelected = false,
}) => {
  const Icon = getCategoryIcon(service.category);

  return (
    <div 
      className={`card-base p-5 flex flex-col justify-between transition-all ${
        isSelected ? 'ring-2 ring-[#2563EB] border-transparent shadow-md' : ''
      }`}
    >
      <div>
        {/* Cabecera del servicio */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B] leading-snug">
                {service.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#64748B]">
                <Tag className="w-3 h-3 text-[#2563EB]" />
                <span>{service.category}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={service.status} size="sm" />
        </div>

        {/* Descripción general */}
        <p className="text-xs text-[#64748B] leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Función principal */}
        <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl mb-4">
          <p className="text-[11px] font-semibold text-[#1E293B] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#2563EB]" />
            Función Principal
          </p>
          <p className="text-xs text-[#1E293B] leading-relaxed font-normal">
            {service.mainFunction}
          </p>
        </div>
      </div>

      {/* Pie de tarjeta con costo referencial y botón de acción */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
        <div>
          <span className="text-[#64748B]">Tarifa referencial: </span>
          <span className="font-semibold text-[#1E293B]">
            {service.hourlyRate > 0 ? `$${service.hourlyRate.toFixed(4)}/h` : 'Sin costo base'}
          </span>
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(service)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isSelected
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 text-[#1E293B] hover:bg-slate-200'
            }`}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        )}
      </div>
    </div>
  );
};
