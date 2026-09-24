import React, { useState } from 'react';
import {
  Globe,
  Server,
  Radio,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  ChevronDown,
  ChevronUp,
  Wifi,
  Layers,
} from 'lucide-react';
import { GLOBAL_REGIONS } from '../data/awsServices';
import { RegionCard } from '../components/RegionCard';
import { StatusBadge } from '../components/StatusBadge';

type ActiveCard = 'regions' | 'azs' | 'edge' | 'status' | null;

export const Infrastructure: React.FC = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('us-east-1');
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);

  const selectedRegion = GLOBAL_REGIONS.find(r => r.id === selectedRegionId) || GLOBAL_REGIONS[0];
  const totalAZs = GLOBAL_REGIONS.reduce((acc, r) => acc + r.availabilityZones, 0);

  const operativeCount = GLOBAL_REGIONS.filter(r => r.status === 'Operativo').length;
  const maintenanceCount = GLOBAL_REGIONS.filter(r => r.status === 'Mantenimiento').length;
  const degradedCount = GLOBAL_REGIONS.filter(r => r.status === 'Degradado').length;
  const operationalPercent = Math.round((operativeCount / GLOBAL_REGIONS.length) * 100);

  const operationalColor = operationalPercent === 100 ? '#16A34A' : operationalPercent >= 75 ? '#F59E0B' : '#DC2626';
  const operationalLabel = operationalPercent === 100 ? 'Saludable' : operationalPercent >= 75 ? 'Degradado' : 'Crítico';
  const operationalBorder = operationalPercent === 100 ? 'border-l-[#16A34A]' : operationalPercent >= 75 ? 'border-l-[#F59E0B]' : 'border-l-[#DC2626]';
  const operationalIconBg = operationalPercent === 100 ? 'bg-emerald-50' : operationalPercent >= 75 ? 'bg-amber-50' : 'bg-rose-50';
  const operationalDot = operationalPercent === 100 ? 'bg-[#16A34A]' : operationalPercent >= 75 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]';

  const edgeLocations = 450;

  const toggle = (card: ActiveCard) => setActiveCard(prev => prev === card ? null : card);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">Infraestructura Global de AWS</h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Visualización de las Regiones y Zonas de Disponibilidad (AZs) de AWS. Haz clic en cada
          indicador para ver el detalle. La infraestructura global permite implementar aplicaciones con
          baja latencia, alta tolerancia a fallos y cumplimiento de soberanía de datos.
        </p>
      </div>

      {/* ── 4 Cards interactivas ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Card 1 – Regiones */}
        <button
          onClick={() => toggle('regions')}
          className={`card-base p-5 flex flex-col gap-3 text-left transition-all hover:shadow-md ${activeCard === 'regions' ? 'ring-2 ring-[#2563EB] border-transparent' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Regiones en Solución</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-[#2563EB]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1E293B]">{GLOBAL_REGIONS.length}</span>
            <span className="text-sm font-semibold text-[#64748B]">Regiones</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Norteamérica, Sudamérica y Europa</p>
            {activeCard === 'regions' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
          </div>
        </button>

        {/* Card 2 – AZs */}
        <button
          onClick={() => toggle('azs')}
          className={`card-base p-5 flex flex-col gap-3 text-left transition-all hover:shadow-md ${activeCard === 'azs' ? 'ring-2 ring-[#16A34A] border-transparent' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Zonas de Disponibilidad</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#16A34A]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1E293B]">{totalAZs}</span>
            <span className="text-sm font-semibold text-[#64748B]">AZs Totales</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Centros de datos aislados e interconectados</p>
            {activeCard === 'azs' ? <ChevronUp className="w-3.5 h-3.5 text-[#16A34A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
          </div>
        </button>

        {/* Card 3 – Red Perimetral */}
        <button
          onClick={() => toggle('edge')}
          className={`card-base p-5 flex flex-col gap-3 text-left transition-all hover:shadow-md ${activeCard === 'edge' ? 'ring-2 ring-[#8B5CF6] border-transparent' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Red Perimetral (Edge)</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1E293B]">{edgeLocations}</span>
            <span className="text-sm font-semibold text-[#64748B]">Edge Locations</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Route 53 &amp; CloudFront — baja latencia global</p>
            {activeCard === 'edge' ? <ChevronUp className="w-3.5 h-3.5 text-[#8B5CF6]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
          </div>
        </button>

        {/* Card 4 – Estado Operacional */}
        <button
          onClick={() => toggle('status')}
          className={`card-base p-5 flex flex-col gap-3 border-l-4 ${operationalBorder} text-left transition-all hover:shadow-md ${activeCard === 'status' ? 'ring-2 border-transparent' : ''}`}
          style={activeCard === 'status' ? { outlineColor: operationalColor } : {}}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Estado Operacional</span>
            <div className={`w-9 h-9 rounded-xl ${operationalIconBg} flex items-center justify-center shrink-0`}>
              <ShieldCheck className="w-5 h-5" style={{ color: operationalColor }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse ${operationalDot}`} />
            <span className="text-3xl font-extrabold" style={{ color: operationalColor }}>{operationalPercent}%</span>
            <span className="text-sm font-semibold" style={{ color: operationalColor }}>{operationalLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">
              {operativeCount} operativas
              {maintenanceCount > 0 && ` · ${maintenanceCount} en mantenimiento`}
              {degradedCount > 0 && ` · ${degradedCount} degradadas`}
            </p>
            {activeCard === 'status' ? <ChevronUp className="w-3.5 h-3.5" style={{ color: operationalColor }} /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
          </div>
        </button>
      </div>

      {/* ── Paneles de detalle expandibles ── */}

      {/* Detalle: Regiones */}
      {activeCard === 'regions' && (
        <div className="card-base p-5 border border-[#2563EB]/30 bg-blue-50/20 space-y-3">
          <h4 className="font-bold text-sm text-[#2563EB] flex items-center gap-2">
            <Globe className="w-4 h-4" /> Detalle por Región — {GLOBAL_REGIONS.length} regiones en la solución
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GLOBAL_REGIONS.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-[#E2E8F0] p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#2563EB]">{r.regionCode}</span>
                  <StatusBadge status={r.status} size="sm" />
                </div>
                <p className="font-semibold text-[#1E293B]">{r.location}, {r.country}</p>
                <p className="text-[#64748B]">{r.availabilityZones} AZs · {r.latencyMs} ms</p>
                <p className="text-[#64748B] truncate">{r.deployedServices.length} servicios activos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle: AZs por región */}
      {activeCard === 'azs' && (
        <div className="card-base p-5 border border-[#16A34A]/30 bg-emerald-50/20 space-y-3">
          <h4 className="font-bold text-sm text-[#16A34A] flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Zonas de Disponibilidad por Región — {totalAZs} AZs en total
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GLOBAL_REGIONS.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2563EB]">{r.regionCode}</span>
                    <span className="text-[#64748B]">— {r.location}</span>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>
                {/* Barra de AZs */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: r.availabilityZones }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[10px]"
                      style={{ backgroundColor: r.status === 'Operativo' ? '#16A34A' : r.status === 'Mantenimiento' ? '#F59E0B' : '#DC2626' }}
                    >
                      {r.regionCode.split('-')[0].toUpperCase()}{i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-[#64748B]">
                  <strong className="text-[#1E293B]">{r.availabilityZones} zonas aisladas</strong> · {r.latencyMs} ms promedio
                </p>
                <p className="text-[#64748B]">Servicios: {r.deployedServices.join(', ')}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748B] italic">
            Cada AZ es un centro de datos físicamente separado con alimentación eléctrica y redes independientes, conectadas por fibra de baja latencia.
          </p>
        </div>
      )}

      {/* Detalle: Red Perimetral */}
      {activeCard === 'edge' && (
        <div className="card-base p-5 border border-[#8B5CF6]/30 bg-violet-50/20 space-y-3">
          <h4 className="font-bold text-sm text-[#8B5CF6] flex items-center gap-2">
            <Radio className="w-4 h-4" /> Red Perimetral (Edge) — {edgeLocations} ubicaciones globales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#8B5CF6]" />
                <span className="font-bold text-[#1E293B]">Amazon Route 53</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Servicio DNS de alta disponibilidad que enruta solicitudes al endpoint más cercano y saludable. Soporta enrutamiento por latencia, geolocalización, failover y ponderado.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8B5CF6] bg-violet-50 border border-violet-200 px-2 py-1 rounded-lg w-fit">
                <CheckCircle2 className="w-3 h-3" /> 100% disponibilidad de SLA
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <span className="font-bold text-[#1E293B]">Amazon CloudFront</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                CDN global con más de {edgeLocations} puntos de presencia. Cachea contenido estático y dinámico en el edge, reduciendo latencia y protegiendo el origen con WAF y Shield.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg w-fit">
                <CheckCircle2 className="w-3 h-3" /> TLS 1.3 + HTTPS forzado
              </div>
            </div>
          </div>
          <p className="text-xs text-[#64748B] italic">
            Los Edge Locations sirven como puntos de entrega de caché y resolución DNS, sin procesar lógica de negocio. Reducen la latencia al usuario final sin depender de la región principal.
          </p>
        </div>
      )}

      {/* Detalle: Estado Operacional por región */}
      {activeCard === 'status' && (
        <div className="card-base p-5 space-y-3" style={{ borderColor: `${operationalColor}50`, borderWidth: '1px' }}>
          <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: operationalColor }}>
            <ShieldCheck className="w-4 h-4" /> Estado Operacional por Región — {operationalPercent}% {operationalLabel}
          </h4>
          <div className="space-y-2">
            {GLOBAL_REGIONS.map(r => {
              const stColor = r.status === 'Operativo' ? '#16A34A' : r.status === 'Mantenimiento' ? '#F59E0B' : '#DC2626';
              const stBg = r.status === 'Operativo' ? 'bg-emerald-50' : r.status === 'Mantenimiento' ? 'bg-amber-50' : 'bg-rose-50';
              const stBorder = r.status === 'Operativo' ? 'border-emerald-200' : r.status === 'Mantenimiento' ? 'border-amber-200' : 'border-rose-200';
              return (
                <div key={r.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${stBg} ${stBorder} text-xs`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.status === 'Operativo' ? 'bg-[#16A34A] animate-pulse' : r.status === 'Mantenimiento' ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}`} />
                    <div>
                      <span className="font-mono font-bold" style={{ color: stColor }}>{r.regionCode}</span>
                      <span className="text-[#64748B] ml-2">— {r.location}, {r.country}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-[#64748B] hidden sm:block">{r.availabilityZones} AZs · {r.latencyMs} ms</span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
          {maintenanceCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
              <span>
                <strong>{maintenanceCount} región(es) en mantenimiento programado.</strong> Los servicios desplegados en esas regiones pueden tener disponibilidad reducida temporalmente. Se recomienda verificar el estado en el AWS Health Dashboard oficial.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Selector de región + detalle */}
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
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedRegionId === region.id
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-100 text-[#1E293B] hover:bg-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                region.status === 'Operativo' ? 'bg-[#16A34A]' :
                region.status === 'Mantenimiento' ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
              } ${selectedRegionId === region.id ? '' : ''}`} />
              {region.regionCode} · {region.location}
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#2563EB]">{selectedRegion.regionCode}</span>
                <span className="text-xs font-semibold text-[#1E293B]">({selectedRegion.location}, {selectedRegion.country})</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">Región geográfica totalmente independiente y aislada de otras regiones de AWS.</p>
            </div>
            <StatusBadge status={selectedRegion.status} />
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

      {/* Grid de RegionCards */}
      <div>
        <h3 className="font-bold text-base text-[#1E293B] mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#2563EB]" />
          Regiones de la Solución
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {GLOBAL_REGIONS.map((region) => (
            <RegionCard key={region.id} region={region} isPrimary={region.regionCode === 'us-east-1'} />
          ))}
        </div>
      </div>

      {/* Pilares informativos */}
      <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
        <h4 className="font-bold text-sm text-[#2563EB] flex items-center gap-2">
          <Info className="w-4 h-4" />
          Pilares de la Infraestructura Global de AWS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#1E293B]">
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">1. Regiones de AWS</strong>
            Ubicaciones físicas en todo el mundo compuestas por múltiples AZs con estricta soberanía de datos y legislación local.
          </div>
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">2. Zonas de Disponibilidad (AZs)</strong>
            Centros de datos discretos con energía, redes y conectividad redundantes conectados mediante fibra de latencia ultrabaja.
          </div>
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <strong className="block text-[#1E293B] mb-1">3. Puntos de Presencia (Edge)</strong>
            Red perimetral de CloudFront y Route 53 que entrega contenido desde la ubicación más cercana al usuario final.
          </div>
        </div>
      </div>
    </div>
  );
};
