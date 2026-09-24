import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Database,
  FileCheck,
  Cloud,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { SECURITY_PILLARS } from '../data/awsServices';
import { SecurityCard } from '../components/SecurityCard';
import { StatusBadge } from '../components/StatusBadge';
import { SecurityStatusLevel } from '../types/cloud';

type FilterStatus = 'todos' | SecurityStatusLevel;

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Responsabilidad Compartida': <Cloud className="w-5 h-5 text-[#2563EB]" />,
  'IAM': <Users className="w-5 h-5 text-[#8B5CF6]" />,
  'Protección de Cuentas': <Lock className="w-5 h-5 text-[#F59E0B]" />,
  'Protección de Datos': <Database className="w-5 h-5 text-[#16A34A]" />,
  'Cumplimiento': <FileCheck className="w-5 h-5 text-[#0EA5E9]" />,
};

const IAM_USERS = [
  { name: 'admin-cloudops', role: 'Administrador', mfa: true, status: 'Activo' },
  { name: 'dev-backend', role: 'Desarrollador', mfa: true, status: 'Activo' },
  { name: 'analyst-data', role: 'Solo Lectura', mfa: false, status: 'Revisión' },
  { name: 'deploy-ci', role: 'CI/CD Pipeline', mfa: true, status: 'Activo' },
];

export const Security: React.FC = () => {
  const [filter, setFilter] = useState<FilterStatus>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const correctCount = SECURITY_PILLARS.filter(p => p.status === 'correcto').length;
  const reviewCount = SECURITY_PILLARS.filter(p => p.status === 'revision').length;
  const problemCount = SECURITY_PILLARS.filter(p => p.status === 'problema').length;
  const compliancePercent = Math.round((correctCount / SECURITY_PILLARS.length) * 100);

  const filtered = filter === 'todos'
    ? SECURITY_PILLARS
    : SECURITY_PILLARS.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="card-base p-6 border-l-4 border-l-[#16A34A]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Seguridad, IAM y Modelo de Responsabilidad Compartida
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Panel de auditoría de seguridad Cloud basado en el AWS Well-Architected Framework. Cubre el
          modelo de responsabilidad compartida, gestión de identidades (IAM), protección de cuentas,
          cifrado de datos y cumplimiento normativo.
        </p>
      </div>

      {/* KPIs de Seguridad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nivel de cumplimiento */}
        <div className="card-base p-5 flex flex-col gap-3 border-l-4 border-l-[#16A34A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Cumplimiento Global</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#16A34A]">{compliancePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-[#16A34A] h-1.5 rounded-full transition-all"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B] -mt-1">{correctCount} de {SECURITY_PILLARS.length} controles auditados OK</p>
        </div>

        {/* Correcto */}
        <div className="card-base p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Controles Correctos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#16A34A]">{correctCount}</span>
          <p className="text-xs text-[#64748B]">Verde — sin observaciones</p>
        </div>

        {/* Revisión */}
        <div className="card-base p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Requieren Revisión</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#F59E0B]">{reviewCount}</span>
          <p className="text-xs text-[#64748B]">Amarillo — acción preventiva recomendada</p>
        </div>

        {/* Problema */}
        <div className="card-base p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Problemas Detectados</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-[#DC2626]" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-[#DC2626]">{problemCount}</span>
          <p className="text-xs text-[#64748B]">Rojo — corrección inmediata requerida</p>
        </div>
      </div>

      {/* Modelo de Responsabilidad Compartida — diagrama visual */}
      <div className="card-base p-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Cloud className="w-4 h-4 text-[#2563EB]" />
          Modelo de Responsabilidad Compartida AWS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AWS — Seguridad DE la nube */}
          <div className="rounded-xl border-2 border-[#2563EB] p-4 space-y-3"
            style={{ backgroundColor: 'rgba(37,99,235,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Cloud className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wide">AWS</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Seguridad <em>de</em> la Nube</p>
              </div>
            </div>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                'Infraestructura física y centros de datos',
                'Hardware de servidores y networking',
                'Hipervisores y capa de virtualización',
                'Regiones, AZs y Edge Locations',
                'Servicios gestionados (RDS, S3 en capa de plataforma)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente — Seguridad EN la nube */}
          <div className="rounded-xl border-2 border-[#16A34A] p-4 space-y-3"
            style={{ backgroundColor: 'rgba(16,163,74,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wide">Cliente</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Seguridad <em>en</em> la Nube</p>
              </div>
            </div>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                'Datos del cliente y cifrado de datos en reposo',
                'Gestión de identidades IAM (usuarios, roles, políticas)',
                'Configuración de Security Groups y NACLs',
                'Parches del Sistema Operativo en instancias EC2',
                'Firewall de aplicaciones y configuración de red',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel IAM — Gestión de Identidades */}
      <div className="card-base p-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users className="w-4 h-4 text-[#8B5CF6]" />
          Gestión de Identidades y Acceso (IAM)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla de usuarios IAM */}
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Usuarios IAM Configurados</p>
            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-[#64748B] uppercase text-[10px]">Usuario</th>
                    <th className="px-3 py-2 text-left font-semibold text-[#64748B] uppercase text-[10px]">Rol</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B] uppercase text-[10px]">MFA</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B] uppercase text-[10px]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {IAM_USERS.map((user) => (
                    <tr key={user.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-[#1E293B] font-medium">{user.name}</td>
                      <td className="px-3 py-2.5 text-[#64748B]">{user.role}</td>
                      <td className="px-3 py-2.5 text-center">
                        {user.mfa ? (
                          <span className="inline-flex items-center gap-1 text-[#16A34A] text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#F59E0B] text-[11px] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> Sin MFA
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge
                          status={user.status === 'Activo' ? 'Activo' : 'revision'}
                          text={user.status}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Principios IAM */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Principios Aplicados</p>
            {[
              { title: 'Mínimo Privilegio', desc: 'Cada usuario/rol recibe solo los permisos estrictamente necesarios para su función.', ok: true },
              { title: 'Autenticación Multifactor (MFA)', desc: '3 de 4 usuarios tienen MFA activado. analyst-data requiere habilitación urgente.', ok: false },
              { title: 'Rotación de Credenciales', desc: 'Las access keys del pipeline CI/CD se rotan cada 90 días automáticamente.', ok: true },
              { title: 'Roles vs. Usuarios', desc: 'Las aplicaciones usan roles IAM con credenciales temporales (STS), no claves largas.', ok: true },
            ].map((p, i) => (
              <div key={i}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5`}
                style={{
                  backgroundColor: p.ok ? 'rgba(16,163,74,0.08)' : 'rgba(245,158,11,0.08)',
                  borderColor:     p.ok ? 'rgba(16,163,74,0.3)'  : 'rgba(245,158,11,0.3)',
                }}
              >
                {p.ok
                  ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                }
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                  <p className="mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtro de pilares */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          Pilares de Seguridad Auditados ({filtered.length})
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-[#E2E8F0]">
          {(['todos', 'correcto', 'revision', 'problema'] as FilterStatus[]).map((f) => {
            const labels: Record<FilterStatus, string> = {
              todos: 'Todos',
              correcto: '✓ Correcto',
              revision: '⚠ Revisión',
              problema: '✕ Problema',
            };
            const active: Record<FilterStatus, string> = {
              todos: 'bg-white text-[#1E293B]',
              correcto: 'bg-white text-[#16A34A]',
              revision: 'bg-white text-[#F59E0B]',
              problema: 'bg-white text-[#DC2626]',
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f ? `${active[f]} shadow-sm` : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards de Pilares con expansión */}
      <div className="space-y-3">
        {filtered.map((pillar) => {
          const isExpanded = expandedId === pillar.id;
          const Icon = CATEGORY_ICONS[pillar.category] ?? <ShieldCheck className="w-5 h-5 text-[#2563EB]" />;

          const borderColor: Record<string, string> = {
            correcto: 'border-l-[#16A34A]',
            revision: 'border-l-[#F59E0B]',
            problema: 'border-l-[#DC2626]',
          };

          return (
            <div
              key={pillar.id}
              className={`card-base border-l-4 ${borderColor[pillar.status]} overflow-hidden`}
            >
              {/* Cabecera siempre visible */}
              <button
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/60 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : pillar.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">{Icon}</div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide block">
                      {pillar.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#1E293B] truncate">{pillar.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={pillar.status} />
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-[#64748B]" />
                    : <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  }
                </div>
              </button>

              {/* Detalle expandible */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                  <SecurityCard pillar={pillar} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E293B] leading-relaxed">
          <strong className="text-[#2563EB]">AWS Well-Architected Framework — Pilar de Seguridad: </strong>
          El modelo de responsabilidad compartida establece que AWS gestiona la seguridad <em>de</em> la nube
          (infraestructura física, hardware, virtualización), mientras el cliente gestiona la seguridad
          <em> en</em> la nube (datos, identidades, configuración de red y parches de aplicaciones).
          Aplicar el principio de mínimo privilegio en IAM, habilitar MFA y cifrar datos en reposo son
          controles fundamentales del nivel básico de cumplimiento.
        </p>
      </div>
    </div>
  );
};
