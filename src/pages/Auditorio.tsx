import React, { useState } from 'react';
import { 
  BarChart3, 
  MapPin, 
  ScrollText, 
  Users, 
  FileText, 
  DollarSign, 
  Compass, 
  RefreshCw, 
  Search, 
  Filter, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useClient } from '../context/ClientContext';
import { useSupabase } from '../context/SupabaseContext';
import { useCloud } from '../context/CloudContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { StatCard } from '../components/StatCard';
import { useToast } from '../context/ToastContext';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const Auditorio: React.FC = () => {
  const { 
    clients, 
    consultations, 
    auditLogs, 
    executionLocation, 
    detectLocation, 
    isDetectingLocation,
    setShowClientModal,
    exportConsultationAsPrint,
  } = useClient();

  const { isConnected } = useSupabase();
  const { activeRegionData } = useCloud();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'resumen' | 'geografia' | 'bitacora'>('resumen');
  const [logFilterAction, setLogFilterAction] = useState<string>('todos');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [selectedLogDetail, setSelectedLogDetail] = useState<any | null>(null);

  // Cálculos de Resumen
  const totalCostEvaluated = consultations.reduce((sum, c) => sum + c.estimatedMonthlyCost, 0);
  const avgCostPerConsultation = consultations.length > 0 ? (totalCostEvaluated / consultations.length) : 0;

  // Consultas agrupadas por distrito
  const consultationsByDistrictMap: Record<string, number> = {};
  consultations.forEach(c => {
    const d = c.districtExecution || 'Otro';
    consultationsByDistrictMap[d] = (consultationsByDistrictMap[d] || 0) + 1;
  });

  const chartDistrictData = Object.entries(consultationsByDistrictMap).map(([district, total]) => ({
    distrito: district,
    consultas: total,
  }));

  // Servicios más cotizados
  const serviceCountMap: Record<string, number> = {};
  consultations.forEach(c => {
    c.servicesPayload?.forEach(s => {
      serviceCountMap[s.serviceName] = (serviceCountMap[s.serviceName] || 0) + 1;
    });
  });

  const chartServiceData = Object.entries(serviceCountMap).map(([name, count]) => ({
    name,
    count,
  })).slice(0, 5);

  // Filtrado de bitácora
  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = logFilterAction === 'todos' || log.action === logFilterAction;
    const matchesQuery = 
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.district.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesAction && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera Principal del Módulo Auditorio */}
      <div className="card-base p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <Compass className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Módulo Auditorio & Monitoreo
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {isConnected ? 'PostgreSQL Supabase Online' : 'Almacenamiento Híbrido'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Auditorio: Resumen, Geografía & Bitácora
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Centro de fiscalización y registro de perfiles, consultas técnicas de clientes, mapa interactivo de ejecución por región y distrito, y trazabilidad total.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowClientModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <Users className="w-4 h-4" />
              <span>Gestionar Clientes & Consultas</span>
            </button>
          </div>
        </div>

        {/* Barra de pestañas */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-700/60">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'resumen'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Resumen Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('geografia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'geografia'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>2. Geografía & Mapa</span>
          </button>

          <button
            onClick={() => setActiveTab('bitacora')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bitacora'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ScrollText className="w-4 h-4 text-indigo-400" />
            <span>3. Bitácora de Eventos ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECCIÓN 1: RESUMEN
          ========================================================================= */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Clientes Registrados"
              value={clients.length}
              subtitle="Perfiles en PostgreSQL"
              icon={Users}
              badgeText={`${clients.length} usuarios`}
              badgeType="info"
            />
            <StatCard
              title="Consultas Generadas"
              value={consultations.length}
              subtitle="Propuestas técnicas"
              icon={FileText}
              badgeText="Exportables"
              badgeType="success"
            />
            <StatCard
              title="Volumen Evaluado"
              value={`$${totalCostEvaluated.toLocaleString()}`}
              subtitle="Inversión mensual cotizada"
              icon={DollarSign}
              badgeText={`Prom: $${avgCostPerConsultation.toFixed(0)}/mes`}
              badgeType="success"
            />
            <StatCard
              title="Distrito Activo"
              value={executionLocation.district}
              subtitle={`Región: ${executionLocation.region}`}
              icon={MapPin}
              badgeText="Sesión en vivo"
              badgeType="info"
            />
          </div>

          {/* Gráficos de distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Consultas por Distrito */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Actividad de Consultas por Distrito
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Distribución geográfica de las propuestas generadas
                  </p>
                </div>
                <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                  <MapPin className="w-4 h-4" />
                </span>
              </div>

              {chartDistrictData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDistrictData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="distrito" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="consultas" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  Sin datos de distritos aún. Genera una consulta para visualizar el gráfico.
                </div>
              )}
            </div>

            {/* Gráfico 2: Servicios AWS más demandados */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Servicios AWS más Solicitados
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Frecuencia de servicios en las consultas de clientes
                  </p>
                </div>
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <Layers className="w-4 h-4" />
                </span>
              </div>

              {chartServiceData.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartServiceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartServiceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  Sin datos de servicios aún.
                </div>
              )}
            </div>
          </div>

          {/* Tabla de últimas consultas con acción rápida de exportar */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Últimas Consultas Presentadas
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Acceso rápido para exportar o revisar propuestas en vivo
                </p>
              </div>
              <button
                onClick={() => setShowClientModal(true)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <th className="py-2.5 font-bold uppercase">Cliente / Empresa</th>
                    <th className="py-2.5 font-bold uppercase">Título de Consulta</th>
                    <th className="py-2.5 font-bold uppercase">Distrito</th>
                    <th className="py-2.5 font-bold uppercase text-right">Inversión Mensual</th>
                    <th className="py-2.5 font-bold uppercase text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {consultations.slice(0, 5).map((cons) => (
                    <tr key={cons.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {cons.clientName}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {cons.title}
                      </td>
                      <td className="py-3 text-slate-500">
                        📍 {cons.districtExecution}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${cons.estimatedMonthlyCost.toFixed(2)} USD
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => exportConsultationAsPrint(cons)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                        >
                          Exportar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECCIÓN 2: GEOGRAFÍA
          ========================================================================= */}
      {activeTab === 'geografia' && (
        <div className="space-y-6">
          {/* Panel Superior: Datos de Ubicación y Detección */}
          <div className="card-base p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Localización Geográfica de Ejecución
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Detección en tiempo real de la <strong>Región</strong> y <strong>Distrito</strong> donde se ejecuta la solución Cloud
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detectando GPS...' : 'Detectar mi Ubicación'}</span>
                </button>
              </div>
            </div>

            {/* Grid de Telemetría Geográfica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distrito Actual</span>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {executionLocation.district}
                </p>
                <span className="text-[11px] text-slate-500">Ejecución del sistema</span>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Región Geográfica</span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {executionLocation.region}
                </p>
                <span className="text-[11px] text-slate-500">Perú (Zona Horaria GMT-5)</span>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coordenadas GPS</span>
                <p className="text-sm font-bold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
                  {executionLocation.latitude.toFixed(4)}, {executionLocation.longitude.toFixed(4)}
                </p>
                <span className="text-[11px] text-slate-500">Precisión ±{executionLocation.accuracyMeters || 15}m</span>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Región AWS Primaria</span>
                <p className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                  {activeRegionData.regionCode}
                </p>
                <span className="text-[11px] text-slate-500">Latencia: {activeRegionData.latencyMs} ms</span>
              </div>
            </div>
          </div>

          {/* MAPA INTERACTIVO CON LEAFLET */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Mapa en Vivo: Nodo de Ejecución y Cobertura de Consultas
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  El pin azul pulsante indica la ubicación exacta donde se está ejecutando la sesión. Los pines morados representan consultas generadas.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> Nodo Ejecución
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600"></span> Consultas Clientes
                </span>
              </div>
            </div>

            <InteractiveMap
              location={executionLocation}
              consultations={consultations}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SECCIÓN 3: BITÁCORA
          ========================================================================= */}
      {activeTab === 'bitacora' && (
        <div className="space-y-6">
          <div className="card-base p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <ScrollText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Bitácora de Eventos y Auditoría
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Trazabilidad de cada acción, usuario, distrito y metadatos semiestructurados en PostgreSQL
                    </p>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Buscar en bitácora..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border w-48 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Filtro por acción */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={logFilterAction}
                    onChange={(e) => setLogFilterAction(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todas las acciones</option>
                    <option value="Creación de Usuario">Creación de Usuario</option>
                    <option value="Generación de Consulta">Generación de Consulta</option>
                    <option value="Exportación de Propuesta">Exportación</option>
                    <option value="Eliminación de Usuario">Eliminación</option>
                    <option value="Acceso a Auditorio">Acceso / Sistema</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listado de eventos */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <th className="py-2.5 font-bold uppercase">Timestamp (UTC / Local)</th>
                    <th className="py-2.5 font-bold uppercase">Acción</th>
                    <th className="py-2.5 font-bold uppercase">Entidad</th>
                    <th className="py-2.5 font-bold uppercase">Operador / Usuario</th>
                    <th className="py-2.5 font-bold uppercase">Ubicación (Distrito, Región)</th>
                    <th className="py-2.5 font-bold uppercase text-right">Detalle Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredLogs.map((log) => {
                    const badgeColor = 
                      log.action === 'Creación de Usuario' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                      log.action === 'Generación de Consulta' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      log.action === 'Exportación de Propuesta' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                      log.action === 'Eliminación de Usuario' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('es-PE')}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {log.entityType}
                        </td>
                        <td className="py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {log.userName}
                        </td>
                        <td className="py-3 text-slate-500">
                          📍 {log.district}, {log.region}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="px-2 py-1 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                          >
                            Ver JSON
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No se encontraron registros de auditoría que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal visor de JSON semiestructurado */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="card-base p-6 max-w-lg w-full rounded-2xl border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Detalle Semiestructurado (JSONB)
                </h4>
                <p className="text-xs text-slate-500">Evento: {selectedLogDetail.action}</p>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-80">
              <pre>{JSON.stringify(selectedLogDetail, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
