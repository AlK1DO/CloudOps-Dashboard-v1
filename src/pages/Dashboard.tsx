import React from 'react';
import { 
  Server, 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  Network, 
  Layers, 
  ArrowRight, 
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useCloud } from '../context/CloudContext';
import { SECURITY_PILLARS } from '../data/awsServices';

export const Dashboard: React.FC = () => {
  const { 
    costItems, 
    totalMonthlyCost, 
    totalAnnualCost, 
    baseMonthlyCost,
    costMultiplier,
    services,
    selectedRegion,
    activeRegionData,
  } = useCloud();

  const activeServicesCount = services.filter(s => s.status === 'Activo').length;
  const isPrimaryActive = activeRegionData?.regionCode === 'us-east-1';

  const regionBadgeType = activeRegionData?.status === 'Operativo'
    ? 'success'
    : activeRegionData?.status === 'Mantenimiento'
    ? 'warning'
    : 'danger';

  const regionBadgeText = activeRegionData?.status === 'Operativo'
    ? (isPrimaryActive ? 'Principal · Activa' : 'Activa')
    : activeRegionData?.status === 'Mantenimiento'
    ? 'En mantenimiento'
    : 'Degradada';

  const chartData = costItems.map(item => ({
    name: item.serviceId.toUpperCase(),
    fullName: item.serviceName,
    costo: Number((item.monthlyCost * costMultiplier).toFixed(2)),
  }));

  const correctSecurity = SECURITY_PILLARS.filter(p => p.status === 'correcto').length;
  const reviewSecurity = SECURITY_PILLARS.filter(p => p.status === 'revision').length;
  const problemSecurity = SECURITY_PILLARS.filter(p => p.status === 'problema').length;

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Resumen Ejecutivo */}
      <div className="card-base p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              CloudOps Dashboard: Solución Cloud AWS
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Panel unificado para planificación, costos, infraestructura global, seguridad y arquitectura de red basado en los fundamentos de AWS.
            </p>
            {/* Región activa en el banner */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                activeRegionData?.status === 'Operativo'
                  ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300'
                  : activeRegionData?.status === 'Mantenimiento'
                  ? 'bg-amber-900/40 border-amber-500/50 text-amber-300'
                  : 'bg-rose-900/40 border-rose-500/50 text-rose-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeRegionData?.status === 'Operativo' ? 'bg-emerald-400 animate-pulse' :
                  activeRegionData?.status === 'Mantenimiento' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                Región activa: <strong>{activeRegionData?.regionCode}</strong> — {activeRegionData?.location}
              </span>
              {!isPrimaryActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/40 border border-blue-500/50 text-blue-300">
                  Principal: <strong>us-east-1</strong> (N. Virginia)
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-sm"
            >
              Nueva Planificación
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Indicadores — 6 KPIs en dos filas responsivas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Servicios Utilizados"
          value={`${activeServicesCount} / ${services.length}`}
          subtitle="EC2, S3, RDS, IAM, VPC, Route 53, CF"
          icon={Layers}
          badgeText="100% Cobertura"
          badgeType="success"
          iconBgColor="bg-blue-50"
          iconColor="text-[#2563EB]"
        />

        <StatCard
          title={isPrimaryActive ? 'Región Principal' : 'Región Activa'}
          value={activeRegionData?.regionCode ?? selectedRegion.split(' ')[0]}
          subtitle={`${activeRegionData?.location ?? ''} · ${activeRegionData?.availabilityZones ?? '?'} AZs · ${activeRegionData?.latencyMs ?? '?'} ms`}
          icon={Globe}
          badgeText={regionBadgeText}
          badgeType={regionBadgeType}
          iconBgColor={activeRegionData?.status === 'Operativo' ? 'bg-slate-100' : activeRegionData?.status === 'Mantenimiento' ? 'bg-amber-50' : 'bg-rose-50'}
          iconColor={activeRegionData?.status === 'Operativo' ? 'text-[#0F172A]' : activeRegionData?.status === 'Mantenimiento' ? 'text-[#F59E0B]' : 'text-[#DC2626]'}
        />

        <StatCard
          title="Recursos en Región"
          value={`${activeRegionData?.deployedServices.length ?? activeServicesCount} Servicios`}
          subtitle={activeRegionData ? activeRegionData.deployedServices.slice(0, 3).join(' · ') + (activeRegionData.deployedServices.length > 3 ? '…' : '') : 'Computación · BD · Red · IAM'}
          icon={Server}
          badgeText={activeRegionData?.regionCode ?? 'Multi-AZ'}
          badgeType="success"
          iconBgColor="bg-emerald-50"
          iconColor="text-[#16A34A]"
        />

        <StatCard
          title="Costo Mensual Estimado"
          value={`$${totalMonthlyCost.toFixed(2)}`}
          subtitle={costMultiplier !== 1.0
            ? `Base $${baseMonthlyCost.toFixed(2)} × ${costMultiplier}x (${activeRegionData?.regionCode})`
            : `USD / mes — modelo Pay-as-you-go`}
          icon={DollarSign}
          badgeText={costMultiplier !== 1.0 ? `×${costMultiplier} región` : 'Mensual'}
          badgeType="warning"
          iconBgColor="bg-amber-50"
          iconColor="text-[#F59E0B]"
        />

        <StatCard
          title="Costo Anual Proyectado"
          value={`$${totalAnnualCost.toFixed(2)}`}
          subtitle={costMultiplier !== 1.0
            ? `Ajustado por región ${activeRegionData?.regionCode} (×${costMultiplier})`
            : `${costItems.length} servicios × 12 meses`}
          icon={TrendingUp}
          badgeText="Anual TCO"
          badgeType="warning"
          iconBgColor="bg-amber-50"
          iconColor="text-[#F59E0B]"
        />

        <StatCard
          title="Estado de Seguridad"
          value={`${correctSecurity} / ${SECURITY_PILLARS.length} OK`}
          subtitle={`${reviewSecurity} en revisión · ${problemSecurity} problemas`}
          icon={ShieldCheck}
          badgeText="Well-Architected"
          badgeType="success"
          iconBgColor="bg-emerald-50"
          iconColor="text-[#16A34A]"
        />
      </div>

      {/* Accesos rápidos — Estado arquitectura y catálogo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-base p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#64748B]">Estado de la Arquitectura</p>
              <p className="text-sm font-bold text-[#1E293B]">Alta Disponibilidad (Multi-AZ)</p>
              <p className="text-xs text-[#64748B]">Internet → Route 53 → CloudFront → VPC → EC2/RDS</p>
            </div>
          </div>
          <Link to="/network" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0 ml-2">
            Ver flujo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-[#8B5CF6] flex items-center justify-center border border-violet-100 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#64748B]">Catálogo de Servicios AWS</p>
              <p className="text-sm font-bold text-[#1E293B]">EC2, S3, RDS, IAM, VPC, Route 53, CloudFront</p>
              <p className="text-xs text-[#64748B]">5 categorías · tarifa estimada por servicio</p>
            </div>
          </div>
          <Link to="/services" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0 ml-2">
            Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Gráfico y Resumen de Seguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Distribución de Costos Mensuales */}
        <div className="card-base p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">
                Estimación de Costo Mensual por Servicio
              </h3>
              <p className="text-xs text-[#64748B]">
                Desglose mensual en USD ($) para dimensionamiento de la propuesta
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Total: ${totalMonthlyCost.toFixed(2)}/mes</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)} USD`, 'Costo mensual']}
                  labelFormatter={(label) => `Servicio: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '10px', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="costo" 
                  fill="#2563EB" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen del Estado de Seguridad */}
        <div className="card-base p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-base text-[#1E293B]">
                  Resumen de Seguridad
                </h3>
                <p className="text-xs text-[#64748B]">
                  Pilares auditados de AWS
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
            </div>

            {/* Contadores Semáforo */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="block text-lg font-bold text-[#16A34A]">{correctSecurity}</span>
                <span className="text-[10px] text-emerald-800 font-medium">Correcto</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="block text-lg font-bold text-[#F59E0B]">{reviewSecurity}</span>
                <span className="text-[10px] text-amber-800 font-medium">Revisión</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="block text-lg font-bold text-[#DC2626]">{problemSecurity}</span>
                <span className="text-[10px] text-rose-800 font-medium">Problema</span>
              </div>
            </div>

            {/* Lista breve de pilares */}
            <div className="space-y-2">
              {SECURITY_PILLARS.slice(0, 3).map((pillar) => (
                <div 
                  key={pillar.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-[#E2E8F0] text-xs"
                >
                  <span className="font-medium text-[#1E293B] truncate max-w-[170px]">
                    {pillar.title}
                  </span>
                  <StatusBadge status={pillar.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
            <Link 
              to="/security"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Auditoría Completa y Modelo Compartido
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
