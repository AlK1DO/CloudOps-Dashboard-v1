import React, { useState } from 'react';
import {
  Globe,
  Wifi,
  Cloud,
  Shield,
  Server,
  Database,
  ArrowDown,
  Info,
  ChevronDown,
  ChevronUp,
  Network as NetworkIcon,
  Lock,
  Layers,
} from 'lucide-react';
import { NETWORK_FLOW_COMPONENTS } from '../data/awsServices';

type ComponentType = 'INTERNET' | 'Route 53' | 'CloudFront' | 'VPC' | 'EC2' | 'RDS';

interface LayerConfig {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  textColor: string;
  badgeBg: string;
  dotColor: string;
}

const LAYER_CONFIG: Record<ComponentType, LayerConfig> = {
  INTERNET: {
    label: 'Internet',
    sublabel: 'Tráfico Público (0.0.0.0/0)',
    icon: <Globe className="w-6 h-6" />,
    bg: 'bg-slate-700',
    border: 'border-slate-500',
    textColor: 'text-white',
    badgeBg: 'bg-slate-600',
    dotColor: 'bg-slate-400',
  },
  'Route 53': {
    label: 'Amazon Route 53',
    sublabel: 'DNS Gestionado',
    icon: <Wifi className="w-6 h-6" />,
    bg: 'bg-violet-600',
    border: 'border-violet-400',
    textColor: 'text-white',
    badgeBg: 'bg-violet-700',
    dotColor: 'bg-violet-300',
  },
  CloudFront: {
    label: 'Amazon CloudFront',
    sublabel: 'CDN / Edge Cache',
    icon: <Cloud className="w-6 h-6" />,
    bg: 'bg-[#2563EB]',
    border: 'border-blue-400',
    textColor: 'text-white',
    badgeBg: 'bg-blue-700',
    dotColor: 'bg-blue-300',
  },
  VPC: {
    label: 'Amazon VPC',
    sublabel: '10.0.0.0/16 — Red Privada',
    icon: <Shield className="w-6 h-6" />,
    bg: 'bg-amber-500',
    border: 'border-amber-300',
    textColor: 'text-white',
    badgeBg: 'bg-amber-600',
    dotColor: 'bg-amber-200',
  },
  EC2: {
    label: 'Instancias EC2',
    sublabel: 'Subnet Privada (10.0.1.0/24)',
    icon: <Server className="w-6 h-6" />,
    bg: 'bg-[#16A34A]',
    border: 'border-green-400',
    textColor: 'text-white',
    badgeBg: 'bg-green-700',
    dotColor: 'bg-green-300',
  },
  RDS: {
    label: 'Amazon RDS',
    sublabel: 'Subnet Privada DB (10.0.2.0/24)',
    icon: <Database className="w-6 h-6" />,
    bg: 'bg-rose-600',
    border: 'border-rose-400',
    textColor: 'text-white',
    badgeBg: 'bg-rose-700',
    dotColor: 'bg-rose-300',
  },
};

export const Network: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const selectedComponent = NETWORK_FLOW_COMPONENTS.find(c => c.id === selectedStep) ?? null;
  const selectedConfig = selectedComponent ? LAYER_CONFIG[selectedComponent.type] : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Arquitectura de Red — VPC y Flujo de Tráfico
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Representación visual del flujo de tráfico desde Internet hasta los recursos internos de la VPC.
          Arquitectura mínima requerida: <strong className="text-[#1E293B]">INTERNET → Route 53 → CloudFront → VPC → EC2 → RDS</strong>.
          Selecciona cada capa para ver sus detalles técnicos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Diagrama de flujo vertical ── */}
        <div className="lg:col-span-2 space-y-0">

          {/* Zona Edge (Internet / DNS / CDN) */}
          <div className="rounded-t-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#64748B]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Zona Edge — Red Pública</span>
            </div>

            <div className="space-y-1">
              {NETWORK_FLOW_COMPONENTS.filter(c => c.category === 'Edge').map((comp) => {
                const cfg = LAYER_CONFIG[comp.type];
                const isSelected = selectedStep === comp.id;
                return (
                  <div key={comp.id}>
                    <button
                      onClick={() => setSelectedStep(isSelected ? null : comp.id)}
                      className={`w-full rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.01] hover:shadow-md ${cfg.bg} ${cfg.border} ${isSelected ? 'ring-4 ring-white/40 scale-[1.01] shadow-lg' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cfg.badgeBg} flex items-center justify-center shrink-0 ${cfg.textColor}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor} opacity-70`}>
                            Paso {comp.step}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
                        </div>
                        <p className={`font-bold text-sm ${cfg.textColor}`}>{cfg.label}</p>
                        <p className={`text-xs ${cfg.textColor} opacity-80`}>{cfg.sublabel}</p>
                      </div>
                      <div className={`shrink-0 ${cfg.textColor} opacity-70`}>
                        {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Flecha de conexión entre capas */}
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-3 bg-slate-300" />
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                      <div className="w-0.5 h-1 bg-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zona VPC */}
          <div className="border-x-2 border-dashed border-amber-300 bg-amber-50/30 px-4 pt-2 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Amazon VPC — 10.0.0.0/16</span>
              <span className="ml-auto text-[10px] font-medium text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Internet Gateway (IGW) activo
              </span>
            </div>

            {/* Nodo VPC */}
            {NETWORK_FLOW_COMPONENTS.filter(c => c.type === 'VPC').map((comp) => {
              const cfg = LAYER_CONFIG[comp.type];
              const isSelected = selectedStep === comp.id;
              return (
                <div key={comp.id}>
                  <button
                    onClick={() => setSelectedStep(isSelected ? null : comp.id)}
                    className={`w-full rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.01] hover:shadow-md ${cfg.bg} ${cfg.border} ${isSelected ? 'ring-4 ring-white/40 scale-[1.01] shadow-lg' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.badgeBg} flex items-center justify-center shrink-0 ${cfg.textColor}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor} opacity-70`}>
                          Paso {comp.step}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
                      </div>
                      <p className={`font-bold text-sm ${cfg.textColor}`}>{cfg.label}</p>
                      <p className={`text-xs ${cfg.textColor} opacity-80`}>{cfg.sublabel}</p>
                    </div>
                    <div className={`shrink-0 ${cfg.textColor} opacity-70`}>
                      {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <div className="flex flex-col items-center py-1">
                    <div className="w-0.5 h-3 bg-amber-300" />
                    <ArrowDown className="w-4 h-4 text-amber-400" />
                    <div className="w-0.5 h-1 bg-amber-300" />
                  </div>
                </div>
              );
            })}

            {/* Subredes Privadas (EC2 + RDS lado a lado en pantalla grande) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {NETWORK_FLOW_COMPONENTS.filter(c => c.category === 'Compute' || c.category === 'Database').map((comp) => {
                const cfg = LAYER_CONFIG[comp.type];
                const isSelected = selectedStep === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedStep(isSelected ? null : comp.id)}
                    className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.01] hover:shadow-md ${cfg.bg} ${cfg.border} ${isSelected ? 'ring-4 ring-white/40 scale-[1.01] shadow-lg' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.badgeBg} flex items-center justify-center shrink-0 ${cfg.textColor}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor} opacity-70`}>
                          Paso {comp.step}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
                      </div>
                      <p className={`font-bold text-sm ${cfg.textColor}`}>{cfg.label}</p>
                      <p className={`text-xs ${cfg.textColor} opacity-80`}>{cfg.sublabel}</p>
                    </div>
                    <div className={`shrink-0 ${cfg.textColor} opacity-70`}>
                      {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Borde inferior VPC */}
          <div className="rounded-b-2xl border-2 border-t-0 border-dashed border-amber-300 bg-amber-50/20 px-4 py-2 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] text-amber-600 font-semibold">
              Network ACLs + Security Groups activos — Sin acceso directo desde Internet a subredes privadas
            </span>
          </div>
        </div>

        {/* ── Panel de Detalles ── */}
        <div className="space-y-4">
          {/* Tarjeta de detalle dinámica */}
          <div className={`card-base overflow-hidden transition-all duration-300 ${selectedComponent ? 'border-2' : 'border border-[#E2E8F0]'}`}
            style={selectedConfig ? { borderColor: undefined } : {}}
          >
            {selectedComponent && selectedConfig ? (
              <>
                <div className={`${selectedConfig.bg} px-5 py-4 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-xl ${selectedConfig.badgeBg} flex items-center justify-center shrink-0 ${selectedConfig.textColor}`}>
                    {selectedConfig.icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedConfig.textColor} opacity-70`}>
                      Paso {selectedComponent.step} de {NETWORK_FLOW_COMPONENTS.length}
                    </span>
                    <p className={`font-bold text-sm ${selectedConfig.textColor}`}>{selectedComponent.name}</p>
                  </div>
                </div>
                <div className="p-5 space-y-3 text-xs">
                  <p className="text-[#64748B] leading-relaxed">{selectedComponent.description}</p>

                  {selectedComponent.cidrOrEndpoint && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                      <span className="font-semibold text-[#1E293B] block mb-0.5">Endpoint / CIDR:</span>
                      <code className="font-mono text-[#2563EB]">{selectedComponent.cidrOrEndpoint}</code>
                    </div>
                  )}

                  {selectedComponent.securityGroup && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                      <span className="font-semibold text-[#1E293B] flex items-center gap-1 mb-0.5">
                        <Lock className="w-3 h-3 text-[#DC2626]" /> Security Group:
                      </span>
                      <code className="font-mono text-[#DC2626] text-[11px]">{selectedComponent.securityGroup}</code>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[#64748B] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0]">
                    <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="font-medium">Capa: </span>
                    <span>{selectedComponent.category}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <NetworkIcon className="w-6 h-6 text-[#64748B]" />
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">Selecciona una capa</p>
                <p className="text-xs text-[#64748B] max-w-[180px]">
                  Haz clic en cualquier componente del diagrama para ver sus detalles técnicos.
                </p>
              </div>
            )}
          </div>

          {/* Resumen de componentes */}
          <div className="card-base p-4 space-y-2">
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              Componentes de la Arquitectura
            </h4>
            {NETWORK_FLOW_COMPONENTS.map((comp) => {
              const cfg = LAYER_CONFIG[comp.type];
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedStep(selectedStep === comp.id ? null : comp.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${
                    selectedStep === comp.id
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-semibold'
                      : 'border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.bg}`} />
                  <span className="font-mono text-[10px] font-bold opacity-60">P{comp.step}</span>
                  <span className="truncate text-left">{comp.name}</span>
                </button>
              );
            })}
          </div>

          {/* Leyenda de capas */}
          <div className="card-base p-4">
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#2563EB]" />
              Conceptos Clave
            </h4>
            <div className="space-y-2 text-xs text-[#64748B]">
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span><strong className="text-[#1E293B]">Route 53:</strong> Enruta el dominio al Edge Location más cercano al usuario.</span>
              </div>
              <div className="flex items-start gap-2">
                <Cloud className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span><strong className="text-[#1E293B]">CloudFront:</strong> Termina TLS, cachea y acelera la entrega de contenido.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-[#1E293B]">VPC:</strong> Red virtual aislada con IGW, NACLs y Security Groups.</span>
              </div>
              <div className="flex items-start gap-2">
                <Server className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong className="text-[#1E293B]">EC2:</strong> Lógica de negocio en subnet privada, solo accesible desde ALB.</span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#1E293B]">RDS Multi-AZ:</strong> Base de datos sin acceso externo, aislada en subnet de datos.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla resumen de flujo */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
          <NetworkIcon className="w-4 h-4 text-[#2563EB]" />
          <h3 className="font-bold text-sm text-[#1E293B]">Resumen del Flujo de Red — INTERNET → RDS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B] uppercase text-[10px]">#</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B] uppercase text-[10px]">Componente</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B] uppercase text-[10px]">Capa</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B] uppercase text-[10px]">CIDR / Endpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B] uppercase text-[10px]">Security Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {NETWORK_FLOW_COMPONENTS.map((comp) => {
                const cfg = LAYER_CONFIG[comp.type];
                return (
                  <tr
                    key={comp.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedStep(selectedStep === comp.id ? null : comp.id)}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-white text-[10px] font-bold ${cfg.bg}`}>
                        {comp.step}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1E293B]">{comp.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{comp.category}</td>
                    <td className="px-4 py-3 font-mono text-[#2563EB] text-[11px]">
                      {comp.cidrOrEndpoint ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#DC2626] text-[11px]">
                      {comp.securityGroup ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota conceptual */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E293B] leading-relaxed">
          <strong className="text-[#2563EB]">Principio de Defensa en Profundidad: </strong>
          La arquitectura implementa múltiples capas de seguridad: <em>Route 53</em> con health checks,
          <em> CloudFront</em> con WAF y terminación TLS, <em>Internet Gateway</em> con tabla de rutas
          controlada, <em>NACLs</em> a nivel de subred y <em>Security Groups</em> a nivel de instancia.
          Las subredes privadas de EC2 y RDS <strong>no tienen ruta directa a Internet</strong>, siguiendo
          el principio de acceso con privilegio mínimo en red.
        </p>
      </div>
    </div>
  );
};
