import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Users,
  Globe,
  Activity,
  Layers,
  Target,
  Calendar,
  Layers3,
  Table as TableIcon,
  LayoutGrid,
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  Trash2,
  AlertOctagon,
} from 'lucide-react';
import { useCloud } from '../context/CloudContext';
import { useToast } from '../context/ToastContext';

export const Planning: React.FC = () => {
  const {
    proposals,
    addProposal,
    removeProposal,
    services,
    regions,
    selectedRegion: globalRegion,
    activeRegionData,
    costMultiplier,
    syncCostItemsWithServices,
  } = useCloud();
  const { addToast } = useToast();

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [solutionName, setSolutionName]         = useState('');
  const [applicationType, setApplicationType]   = useState('Web Empresarial');
  const [description, setDescription]           = useState('');
  const [selectedRegion, setSelectedRegion]     = useState(globalRegion);
  const [estimatedUsers, setEstimatedUsers]     = useState<number | string>(10000);
  const [availabilityLevel, setAvailabilityLevel] = useState('99.95% (Alta Disponibilidad Multi-AZ)');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon VPC',
  ]);
  const [migrationGoal, setMigrationGoal]       = useState('');
  const [servicesError, setServicesError]       = useState('');
  const [formSuccess, setFormSuccess]           = useState(false);
  const [viewMode, setViewMode]                 = useState<'cards' | 'table'>('cards');

  // ── Confirmación de eliminación: guarda el ID pendiente ──────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sincronizar con Costos al inicio
  useEffect(() => {
    if (selectedServices.length > 0) {
      syncCostItemsWithServices(selectedServices);
    }
  }, []);

  // ── Sincronizar región del formulario con la global ───────────────────────
  useEffect(() => {
    setSelectedRegion(globalRegion);
  }, [globalRegion]);

  // Datos completos de la región elegida en el formulario
  const formRegionData    = regions.find(r => selectedRegion.startsWith(r.regionCode)) ?? activeRegionData;
  const isPrimaryRegion   = formRegionData?.regionCode === 'us-east-1';
  const hasRegionWarning  = formRegionData?.status !== 'Operativo';
  const isNonPrimary      = !isPrimaryRegion;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleService = (serviceName: string) => {
    let next: string[];
    if (selectedServices.includes(serviceName)) {
      next = selectedServices.filter(s => s !== serviceName);
      setSelectedServices(next);
      if (next.length === 0) setServicesError('Debe seleccionar al menos un servicio Cloud.');
    } else {
      next = [...selectedServices, serviceName];
      setSelectedServices(next);
      setServicesError('');
    }
    // Conectar en tiempo real con Costos y Economía
    syncCostItemsWithServices(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setServicesError('Debe seleccionar al menos un servicio Cloud para la propuesta.');
      return;
    }
    if (!solutionName.trim() || !description.trim() || !migrationGoal.trim()) return;

    setServicesError('');
    addProposal({
      solutionName,
      applicationType,
      description,
      selectedRegion,
      estimatedUsers: Math.max(1, Number(estimatedUsers) || 1),
      availabilityLevel,
      selectedServices,
      migrationGoal,
    });

    addToast(
      hasRegionWarning ? 'warning' : 'success',
      'Propuesta registrada',
      `"${solutionName}" guardada en ${formRegionData?.regionCode ?? selectedRegion.split(' ')[0]}`
    );

    setFormSuccess(true);
    setSolutionName('');
    setDescription('');
    setMigrationGoal('');
    setTimeout(() => setFormSuccess(false), 4000);
  };

  // Eliminar con doble confirmación
  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      const prop = proposals.find(p => p.id === id);
      removeProposal(id);
      setConfirmDeleteId(null);
      addToast('error', 'Propuesta eliminada', prop ? `"${prop.solutionName}" fue eliminada del sistema` : undefined);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 4000);
    }
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Planificación y Propuesta de Solución Cloud
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Registre los requerimientos técnicos y comerciales de una arquitectura empresarial en la
          nube. Defina dimensionamiento, nivel de servicio (SLA) y servicios requeridos.
        </p>
      </div>

      {/* ── Banner contextual de región ── */}
      {(isNonPrimary || hasRegionWarning) && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 text-xs ${
          hasRegionWarning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
        }`}>
          {hasRegionWarning
            ? <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            : <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          }
          <div className="space-y-1">
            {hasRegionWarning && (
              <p className="font-bold text-amber-800">
                ⚠ Región seleccionada con problemas:{' '}
                <span className="font-mono">{formRegionData?.regionCode}</span> en {formRegionData?.status}
              </p>
            )}
            {isNonPrimary && !hasRegionWarning && (
              <p className="font-semibold text-[#2563EB]">
                Planificando en región secundaria:{' '}
                <span className="font-mono">{formRegionData?.regionCode}</span> ({formRegionData?.location})
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-[#64748B] mt-1">
              {isNonPrimary && (
                <span>
                  📍 Región principal:{' '}
                  <strong className="text-[#1E293B] font-mono">us-east-1</strong> (N. Virginia)
                </span>
              )}
              {costMultiplier !== 1.0 && (
                <span>
                  💰 Costo estimado{' '}
                  <strong className="text-[#DC2626]">
                    {((costMultiplier - 1) * 100).toFixed(0)}% más alto
                  </strong>{' '}
                  que en us-east-1 (×{costMultiplier})
                </span>
              )}
              {hasRegionWarning && (
                <span>
                  ⚡ Considera planificar en una región operativa o agregar failover multi-región.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Formulario de Registro ── */}
        <div className="lg:col-span-5">
          <div className="card-base p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#2563EB]" />
                Registrar Nueva Propuesta
              </h3>
            </div>

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#16A34A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Propuesta registrada y guardada en el sistema!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">

              {/* 1. Nombre */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  1. Nombre de la Solución *
                </label>
                <input
                  type="text" required
                  placeholder="ej. Sistema ERP CloudOps"
                  value={solutionName}
                  onChange={e => setSolutionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              {/* 2. Tipo */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  2. Tipo de Aplicación *
                </label>
                <select
                  value={applicationType}
                  onChange={e => setApplicationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white"
                >
                  <option>Web Empresarial (B2B)</option>
                  <option>API REST / Microservicios</option>
                  <option>Comercio Electrónico (E-Commerce)</option>
                  <option>Procesamiento de Datos / ETL</option>
                </select>
              </div>

              {/* 3. Descripción */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  3. Descripción *
                </label>
                <textarea
                  required rows={2}
                  placeholder="Finalidad y alcance de la arquitectura..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              {/* 4 + 5. Región y Usuarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    4. Región Seleccionada
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={e => setSelectedRegion(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white ${
                      hasRegionWarning ? 'border-amber-300 bg-amber-50/30' : 'border-[#E2E8F0]'
                    }`}
                  >
                    {regions.map(r => (
                      <option key={r.id} value={`${r.regionCode} (${r.location})`}>
                        {r.regionCode === 'us-east-1' ? '★ ' : ''}{r.regionCode} — {r.location}
                        {r.status !== 'Operativo' ? ` [${r.status}]` : ''}
                        {r.costMultiplier !== 1.0 ? ` ×${r.costMultiplier}` : ''}
                      </option>
                    ))}
                  </select>
                  {formRegionData && (
                    <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md w-fit ${
                      formRegionData.status === 'Operativo'   ? 'text-[#16A34A] bg-emerald-50' :
                      formRegionData.status === 'Mantenimiento' ? 'text-[#F59E0B] bg-amber-50' :
                      'text-[#DC2626] bg-rose-50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        formRegionData.status === 'Operativo'    ? 'bg-[#16A34A] animate-pulse' :
                        formRegionData.status === 'Mantenimiento'? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
                      }`} />
                      {formRegionData.status} · {formRegionData.availabilityZones} AZs · {formRegionData.latencyMs} ms
                      {formRegionData.costMultiplier !== 1.0 && (
                        <span className="ml-1 text-[#DC2626]">· ×{formRegionData.costMultiplier} costo</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    5. Estimación de Usuarios
                  </label>
                  <input
                    type="number" min="1" max="100000000"
                    placeholder="ej. 500"
                    value={estimatedUsers}
                    onChange={e => setEstimatedUsers(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* 6. SLA */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  6. Nivel de Disponibilidad (SLA)
                </label>
                <select
                  value={availabilityLevel}
                  onChange={e => setAvailabilityLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white"
                >
                  <option>99.9% (Básica - Single AZ)</option>
                  <option>99.95% (Alta Disponibilidad Multi-AZ)</option>
                  <option>99.99% (Misión Crítica Multi-Región)</option>
                </select>
              </div>

              {/* 7. Servicios */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1.5">
                  7. Servicios Cloud Seleccionados ({selectedServices.length}) *
                </label>
                <div className={`grid grid-cols-2 gap-1.5 p-2.5 bg-slate-50 border rounded-xl max-h-36 overflow-y-auto ${
                  servicesError ? 'border-[#DC2626] ring-1 ring-[#DC2626]/40 bg-rose-50/20' : 'border-[#E2E8F0]'
                }`}>
                  {services.map(s => {
                    const isChecked = selectedServices.includes(s.name);
                    return (
                      <label key={s.id} className={`flex items-center gap-1.5 p-1 rounded-md text-[11px] cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-100 text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-200/60'
                      }`}>
                        <input
                          type="checkbox" checked={isChecked}
                          onChange={() => toggleService(s.name)}
                          className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 w-3 h-3"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
                {servicesError && (
                  <p className="text-[#DC2626] font-medium text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {servicesError}
                  </p>
                )}
              </div>

              {/* 8. Objetivo */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  8. Objetivo de la Migración *
                </label>
                <textarea
                  required rows={2}
                  placeholder="ej. Reducir costos operativos on-premise..."
                  value={migrationGoal}
                  onChange={e => setMigrationGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              {/* Aviso región en mantenimiento */}
              {hasRegionWarning && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                  <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#F59E0B]" />
                  <span>
                    La región <strong className="font-mono">{formRegionData?.regionCode}</strong> está en{' '}
                    <strong>{formRegionData?.status}</strong>. La propuesta se registrará, pero considera un failover a{' '}
                    <strong className="font-mono">us-east-1</strong>.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm text-white ${
                  hasRegionWarning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Propuesta Cloud
                {hasRegionWarning && <span className="text-[10px] opacity-80">(región con alertas)</span>}
              </button>
            </form>
          </div>
        </div>

        {/* ── Visualización de Propuestas ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-[#2563EB]" />
              Propuestas Registradas ({proposals.length})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#E2E8F0]">
              <button
                type="button" onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-[#2563EB] shadow-sm font-semibold' : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Tarjetas
              </button>
              <button
                type="button" onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-[#2563EB] shadow-sm font-semibold' : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Tabla
              </button>
            </div>
          </div>

          {proposals.length === 0 && (
            <div className="card-base p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Layers3 className="w-6 h-6 text-[#64748B]" />
              </div>
              <p className="text-sm font-semibold text-[#1E293B]">Sin propuestas registradas</p>
              <p className="text-xs text-[#64748B] max-w-xs">
                Completa el formulario de la izquierda para registrar tu primera propuesta Cloud.
              </p>
            </div>
          )}

          {/* ── Vista Tarjetas ── */}
          {viewMode === 'cards' && proposals.length > 0 && (
            <div className="space-y-4">
              {proposals.map(prop => {
                const isConfirming = confirmDeleteId === prop.id;
                return (
                  <div
                    key={prop.id}
                    className={`card-base p-5 border-l-4 transition-all ${
                      isConfirming ? 'border-l-[#DC2626] ring-1 ring-rose-200' : 'border-l-[#2563EB]'
                    }`}
                  >
                    {/* Cabecera tarjeta */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
                          {prop.applicationType}
                        </span>
                        <h4 className="text-base font-bold text-[#1E293B] truncate">{prop.solutionName}</h4>
                      </div>

                      {/* Fecha + botón eliminar */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-[#64748B] bg-slate-50 px-2 py-1 rounded-md border border-[#E2E8F0]">
                          <Calendar className="w-3 h-3 text-[#2563EB]" />
                          {prop.createdAt}
                        </div>

                        {isConfirming ? (
                          // Estado de confirmación — dos botones
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteClick(prop.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
                              title="Confirmar eliminación"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                              Eliminar
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#64748B] text-[11px] font-semibold transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          // Estado normal — ícono de papelera
                          <button
                            onClick={() => handleDeleteClick(prop.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            title="Eliminar propuesta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Aviso de confirmación */}
                    {isConfirming && (
                      <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-[11px] text-[#DC2626]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ¿Eliminar <strong>"{prop.solutionName}"</strong>? Esta acción no se puede deshacer. Haz clic en{' '}
                          <strong>Eliminar</strong> para confirmar o <strong>Cancelar</strong> para mantenerla.
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{prop.description}</p>

                    {/* Métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Región: <strong className="text-[#1E293B] block truncate">{prop.selectedRegion}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Usuarios: <strong className="text-[#1E293B] block">{prop.estimatedUsers.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>SLA: <strong className="text-[#1E293B] block truncate">{prop.availabilityLevel.split(' ')[0]}</strong></span>
                      </div>
                    </div>

                    {/* Objetivo */}
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-3 text-xs">
                      <p className="font-semibold text-[#1E293B] flex items-center gap-1.5 mb-0.5">
                        <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                        Objetivo de la Migración:
                      </p>
                      <p className="text-[#64748B] leading-relaxed">{prop.migrationGoal}</p>
                    </div>

                    {/* Servicios */}
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#2563EB]" />
                        Servicios AWS ({prop.selectedServices.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prop.selectedServices.map((svc, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] font-medium text-[#1E293B]">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Vista Tabla ── */}
          {viewMode === 'table' && proposals.length > 0 && (
            <div className="card-base overflow-hidden border border-[#E2E8F0]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Solución</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Región</th>
                      <th className="px-3 py-3 text-center">Usuarios</th>
                      <th className="px-3 py-3 text-center">SLA</th>
                      <th className="px-3 py-3 text-center">Servicios</th>
                      <th className="px-3 py-3 text-center">Fecha</th>
                      <th className="px-3 py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {proposals.map(prop => {
                      const isConfirming = confirmDeleteId === prop.id;
                      return (
                        <tr
                          key={prop.id}
                          className={`transition-colors ${isConfirming ? 'bg-rose-50/60' : 'hover:bg-slate-50/70'}`}
                        >
                          <td className="px-4 py-3 font-semibold text-[#1E293B] max-w-[140px]">
                            <span className="truncate block">{prop.solutionName}</span>
                          </td>
                          <td className="px-4 py-3 text-[#64748B]">{prop.applicationType}</td>
                          <td className="px-4 py-3 text-[#64748B] font-mono text-[11px]">
                            {prop.selectedRegion.split(' ')[0]}
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-[#1E293B]">
                            {prop.estimatedUsers.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-[#16A34A]">
                            {prop.availabilityLevel.split(' ')[0]}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-semibold text-[#2563EB]">{prop.selectedServices.length}</span>
                          </td>
                          <td className="px-3 py-3 text-center text-[#64748B]">{prop.createdAt}</td>
                          <td className="px-3 py-3 text-center">
                            {isConfirming ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleDeleteClick(prop.id)}
                                  className="px-2 py-1 rounded-md bg-[#DC2626] text-white text-[10px] font-semibold hover:bg-red-700 transition-colors"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="px-2 py-1 rounded-md bg-slate-200 text-[#64748B] text-[10px] font-semibold hover:bg-slate-300 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeleteClick(prop.id)}
                                className="p-1.5 text-slate-400 hover:text-[#DC2626] hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all"
                                title="Eliminar propuesta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
