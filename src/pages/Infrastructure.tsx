import React, { useState } from 'react';
import { 
  Globe, 
  Server, 
  Radio, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  Info,
  Building2
} from 'lucide-react';
import { GLOBAL_REGIONS } from '../data/awsServices';
import { RegionCard } from '../components/RegionCard';

export const Infrastructure: React.FC = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('us-east-1');

  const selectedRegion = GLOBAL_REGIONS.find(r => r.id === selectedRegionId) || GLOBAL_REGIONS[0];

  const totalAZs = GLOBAL_REGIONS.reduce((acc, r) => acc + r.availabilityZones, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Infraestructura Global de AWS
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Visualización de las Regiones y Zonas de Disponibilidad (AZs) de AWS. La infraestructura global permite implementar aplicaciones con baja latencia, alta tolerancia a fallos y cumplimiento de soberanía de datos.
        </p>
      </div>

      {/* Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#64748B]">Regiones en Solución</span>
            <Globe className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1E293B]">{GLOBAL_REGIONS.length} Regiones</div>
          <p className="text-xs text-[#64748B] mt-2">Norteamérica, Sudamérica y Europa</p>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#64748B]">Zonas de Disponibilidad</span>
            <Building2 className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1E293B]">{totalAZs} AZs Totales</div>
          <p className="text-xs text-[#64748B] mt-2">Centros de datos aislados e interconectados</p>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#64748B]">Red Perimetral (Edge)</span>
            <Radio className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1E293B]">Route 53 & CDN</div>
          <p className="text-xs text-[#64748B] mt-2">Puntos de presencia para baja latencia</p>
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#64748B]">Estado Operacional</span>
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#16A34A]">100% Saludable</div>
          <p className="text-xs text-[#64748B] mt-2">Todas las regiones operativas</p>
        </div>
      </div>

      {/* Selector interactivo de región para vista detallada */}
      <div className="card-base p-5">
        <h3 className="font-bold text-base text-[#1E293B] mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#2563EB]" />
          Explorar Detalle por Región
        </h3>
        <div className="flex flex-wrap gap-2">
          {GLOBAL_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedRegionId === region.id
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-[#1E293B] hover:bg-slate-200'
              }`}
            >
              {region.regionCode} · {region.location}
            </button>
          ))}
        </div>

        {/* Panel de detalle de la región activa */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#2563EB]">{selectedRegion.regionCode}</span>
                <span className="text-xs font-semibold text-[#1E293B]">({selectedRegion.location}, {selectedRegion.country})</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Región geográfica totalmente independiente y aislada de otras regiones de AWS.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#16A34A] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Estado: {selectedRegion.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <span className="text-[#64748B] block mb-1 font-medium">Zonas de Disponibilidad (AZs):</span>
              <p className="font-bold text-sm text-[#1E293B]">{selectedRegion.availabilityZones} Zonas Aisladas</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Alimentación eléctrica y redes independientes.</p>
            </div>
            <div>
              <span className="text-[#64748B] block mb-1 font-medium">Latencia Promedio:</span>
              <p className="font-bold text-sm text-[#2563EB]">{selectedRegion.latencyMs} ms hacia cliente</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Medida desde el punto de interconexión local.</p>
            </div>
            <div>
              <span className="text-[#64748B] block mb-1 font-medium">Servicios Desplegados:</span>
              <p className="font-bold text-sm text-[#16A34A]">{selectedRegion.deployedServices.length} Servicios Activos</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{selectedRegion.deployedServices.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejilla de Regiones Reutilizando RegionCard */}
      <div>
        <h3 className="font-bold text-base text-[#1E293B] mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#2563EB]" />
          Regiones de la Solución
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {GLOBAL_REGIONS.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              isPrimary={region.regionCode === 'us-east-1'}
            />
          ))}
        </div>
      </div>

      {/* Componentes Clave de la Infraestructura Global de AWS */}
      <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
        <h4 className="font-bold text-sm text-[#2563EB] flex items-center gap-2">
          <Info className="w-4 h-4" />
          Pilares de la Infraestructura Global de AWS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#1E293B]">
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">1. Regiones de AWS</strong>
            Ubicaciones físicas en todo el mundo compuestas por múltiples zonas de disponibilidad con estricta soberanía de datos y leyes locales.
          </div>
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">2. Zonas de Disponibilidad (AZs)</strong>
            Uno o más centros de datos discretos con energía, redes y conectividad redundantes conectados mediante fibra de latencia ultrabaja.
          </div>
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">3. Puntos de Presencia (Edge)</strong>
            Red mundial de ubicaciones perimetrales para Amazon CloudFront y Route 53, entregando contenido con máxima velocidad a los usuarios finales.
          </div>
        </div>
      </div>
    </div>
  );
};
