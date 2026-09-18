import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { AWS_SERVICES } from '../data/awsServices';
import { ServiceCard } from '../components/ServiceCard';

export const Services: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado descriptivo del módulo */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
              Catálogo de Servicios AWS
            </h2>
            <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
              Catálogo oficial de servicios utilizados en la solución. Cada servicio describe su categoría, descripción técnica, función principal en la arquitectura y estado operativo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-[#E2E8F0] text-[#1E293B] shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>7 Servicios Esenciales Requeridos</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Servicios Reutilizando ServiceCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AWS_SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
          />
        ))}
      </div>

      {/* Nota técnica de alineación con AWS */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E293B] leading-relaxed">
          <strong className="font-semibold text-[#2563EB]">Fundamento Cloud: </strong>
          Los servicios mostrados cubren las 5 categorías fundamentales de AWS: <em>Computación</em> (EC2), <em>Almacenamiento</em> (S3), <em>Bases de Datos Relacionales</em> (RDS), <em>Seguridad e Identidad</em> (IAM), y <em>Redes y Distribución Global</em> (VPC, Route 53, CloudFront).
        </div>
      </div>
    </div>
  );
};
