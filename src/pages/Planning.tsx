import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useCloud } from '../context/CloudContext';

export const Planning: React.FC = () => {
  const { proposals, addProposal, services, selectedRegion: globalRegion } = useCloud();

  // Estado del formulario
  const [solutionName, setSolutionName] = useState('');
  const [applicationType, setApplicationType] = useState('Web Empresarial');
  const [description, setDescription] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(globalRegion);
  const [estimatedUsers, setEstimatedUsers] = useState<number | string>(10000);
  const [availabilityLevel, setAvailabilityLevel] = useState('99.95% (Alta Disponibilidad Multi-AZ)');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Amazon EC2', 
    'Amazon S3', 
    'Amazon RDS', 
    'Amazon VPC'
  ]);
  const [migrationGoal, setMigrationGoal] = useState('');
  const [servicesError, setServicesError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const toggleService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      const nextServices = selectedServices.filter(s => s !== serviceName);
      setSelectedServices(nextServices);
      if (nextServices.length === 0) {
        setServicesError('Debe seleccionar al menos un servicio Cloud para la propuesta.');
      }
    } else {
      setSelectedServices([...selectedServices, serviceName]);
      setServicesError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setServicesError('Debe seleccionar al menos un servicio Cloud para la propuesta.');
      return;
    }
    if (!solutionName.trim() || !description.trim() || !migrationGoal.trim()) {
      return;
    }

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

    setFormSuccess(true);
    setSolutionName('');
    setDescription('');
    setMigrationGoal('');
    setTimeout(() => setFormSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]"> 
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Planificación y Propuesta de Solución Cloud
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Registre los requerimientos técnicos y comerciales de una arquitectura empresarial en la nube. Defina el dimensionamiento, nivel de servicio (SLA) y servicios requeridos para evaluar la viabilidad técnica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Registro */}
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
                <span>¡Propuesta registrada exitosamente en el sistema!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Nombre de la solución */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  1. Nombre de la Solución *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sistema ERP CloudOps"
                  value={solutionName}
                  onChange={(e) => setSolutionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              {/* 2. Tipo de Aplicación */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  2. Tipo de Aplicación *
                </label>
                <select
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white"
                >
                  <option value="Web Empresarial">Web Empresarial (B2B)</option>
                  <option value="API REST / Microservicios">API REST / Microservicios</option>
                  <option value="Comercio Electrónico">Comercio Electrónico (E-Commerce)</option>
                  <option value="Procesamiento de Datos / ETL">Procesamiento de Datos / ETL</option>
                </select>
              </div>

              {/* 3. Descripción */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  3. Descripción *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Finalidad y alcance de la arquitectura..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              {/* 4. Región seleccionada y 5. Número estimado de usuarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    4. Región Seleccionada
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white"
                  >
                    <option value="us-east-1 (Norte de Virginia)">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2 (Oregón)">us-west-2 (Oregón)</option>
                    <option value="sa-east-1 (São Paulo)">sa-east-1 (São Paulo)</option>
                    <option value="eu-west-1 (Irlanda)">eu-west-1 (Irlanda)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    5. Estimación de Usuarios
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100000000"
                    placeholder="ej. 500"
                    value={estimatedUsers}
                    onChange={(e) => setEstimatedUsers(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* 6. Nivel de Disponibilidad Requerido */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  6. Nivel de Disponibilidad Requerido (SLA)
                </label>
                <select
                  value={availabilityLevel}
                  onChange={(e) => setAvailabilityLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs bg-white"
                >
                  <option value="99.9% (Básica - Single AZ)">99.9% (Básica - Single AZ)</option>
                  <option value="99.95% (Alta Disponibilidad Multi-AZ)">99.95% (Alta Disponibilidad Multi-AZ)</option>
                  <option value="99.99% (Misión Crítica Multi-Región)">99.99% (Misión Crítica Multi-Región)</option>
                </select>
              </div>

              {/* 7. Servicios Cloud Seleccionados */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1.5">
                  7. Servicios Cloud Seleccionados ({selectedServices.length}) *
                </label>
                <div className={`grid grid-cols-2 gap-1.5 p-2.5 bg-slate-50 border rounded-xl max-h-36 overflow-y-auto transition-colors ${
                  servicesError ? 'border-[#DC2626] ring-1 ring-[#DC2626]/40 bg-rose-50/20' : 'border-[#E2E8F0]'
                }`}>
                  {services.map((s) => {
                    const isChecked = selectedServices.includes(s.name);
                    return (
                      <label 
                        key={s.id} 
                        className={`flex items-center gap-1.5 p-1 rounded-md text-[11px] cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-100 text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-200/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
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
                    <span>{servicesError}</span>
                  </p>
                )}
              </div>

              {/* 8. Objetivo de la Migración */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  8. Objetivo de la Migración *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="ej. Reducir costos operativos on-premise y garantizar escalabilidad automática..."
                  value={migrationGoal}
                  onChange={(e) => setMigrationGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Propuesta Cloud
              </button>
            </form>
          </div>
        </div>

        {/* Visualización de Propuestas (Tarjetas o Tabla según requerimiento de la Sección 10) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-[#2563EB]" />
              Propuestas Registradas ({proposals.length})
            </h3>

            {/* Alternador de Vista: Tarjetas o Tabla */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#2563EB] shadow-2xs font-semibold'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#2563EB] shadow-2xs font-semibold'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          </div>

          {/* Renderizado Condicional: Tarjetas */}
          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div key={prop.id} className="card-base p-5 border-l-4 border-l-[#2563EB]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
                        {prop.applicationType}
                      </span>
                      <h4 className="text-lg font-bold text-[#1E293B]">{prop.solutionName}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] bg-slate-50 px-2 py-1 rounded-md border border-[#E2E8F0]">
                      <Calendar className="w-3 h-3 text-[#2563EB]" />
                      <span>{prop.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] mb-3 leading-relaxed">
                    {prop.description}
                  </p>

                  {/* Métricas clave de la propuesta */}
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

                  {/* Objetivo de la migración */}
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-3 text-xs">
                    <p className="font-semibold text-[#1E293B] flex items-center gap-1.5 mb-0.5">
                      <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Objetivo de la Migración:
                    </p>
                    <p className="text-[#64748B] leading-relaxed">{prop.migrationGoal}</p>
                  </div>

                  {/* Servicios Cloud Seleccionados */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#2563EB]" />
                      Servicios AWS Asignados ({prop.selectedServices.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prop.selectedServices.map((service, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] font-medium text-[#1E293B]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Renderizado Condicional: Tabla */
            <div className="card-base overflow-hidden border border-[#E2E8F0]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Solución</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Región</th>
                      <th className="px-4 py-3">Usuarios</th>
                      <th className="px-4 py-3">Disponibilidad</th>
                      <th className="px-4 py-3">Servicios</th>
                      <th className="px-4 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {proposals.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#1E293B]">
                          {prop.solutionName}
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          {prop.applicationType}
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          {prop.selectedRegion.split(' ')[0]}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1E293B]">
                          {prop.estimatedUsers.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#16A34A]">
                          {prop.availabilityLevel.split(' ')[0]}
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          <span className="font-semibold text-[#2563EB]">
                            {prop.selectedServices.length} servicios
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          {prop.createdAt}
                        </td>
                      </tr>
                    ))}
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
