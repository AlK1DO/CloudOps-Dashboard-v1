import React, { useState } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  PieChart as PieChartIcon, 
  Calculator,
  TrendingDown,
  Info,
  CheckCircle2,
  Trash2,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useCloud } from '../context/CloudContext';
import { CostCard } from '../components/CostCard';

const CHART_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const Costs: React.FC = () => {
  const { 
    costItems, 
    addCostItem, 
    removeCostItem, 
    services, 
    totalMonthlyCost, 
    totalAnnualCost 
  } = useCloud();

  // Estados del calculador
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'ec2');
  const [quantity, setQuantity] = useState<number>(2);
  const [estimatedHours, setEstimatedHours] = useState<number>(730); // 730 horas = 1 mes promedio
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const selectedServiceObj = services.find(s => s.id === selectedServiceId) || services[0];

  // Cálculo en vivo
  const calculatedHourlyCost = selectedServiceObj ? selectedServiceObj.hourlyRate : 0;
  const calculatedMonthly = Number((calculatedHourlyCost * quantity * estimatedHours).toFixed(2));
  const calculatedAnnual = Number((calculatedMonthly * 12).toFixed(2));

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();

    addCostItem({
      serviceId: selectedServiceObj.id,
      serviceName: `${selectedServiceObj.name} (${selectedServiceObj.unitType})`,
      category: selectedServiceObj.category,
      quantity,
      estimatedHours,
      hourlyCost: calculatedHourlyCost,
      monthlyCost: calculatedMonthly,
      annualCost: calculatedAnnual,
    });

    setSuccessMessage(`Estimación para ${selectedServiceObj.name} añadida exitosamente.`);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Datos para el gráfico de distribución por categoría
  const categoryMap: Record<string, number> = {};
  costItems.forEach(item => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.monthlyCost;
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="card-base p-6 border-l-4 border-l-[#F59E0B]">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
          Costos y Estimación Económica Cloud
        </h2>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
          Simule y calcule el gasto mensual y anual de los servicios de AWS según cantidad y horas de uso (Pay-as-you-go). Analice la distribución porcentual del presupuesto por categoría de servicio.
        </p>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-5 border-l-4 border-l-[#F59E0B]">
          <span className="text-xs font-semibold uppercase text-[#64748B]">Presupuesto Mensual Estimado</span>
          <div className="mt-1 text-2xl font-bold text-[#1E293B] flex items-center">
            <DollarSign className="w-6 h-6 text-[#F59E0B]" />
            {totalMonthlyCost.toFixed(2)}
            <span className="text-xs text-[#64748B] font-normal ml-1">USD/mes</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Basado en {costItems.length} componentes dimensionados</p>
        </div>

        <div className="card-base p-5 border-l-4 border-l-[#16A34A]">
          <span className="text-xs font-semibold uppercase text-[#64748B]">Proyección Anual (TCO)</span>
          <div className="mt-1 text-2xl font-bold text-[#16A34A] flex items-center">
            <DollarSign className="w-6 h-6 text-[#16A34A]" />
            {totalAnnualCost.toFixed(2)}
            <span className="text-xs text-[#64748B] font-normal ml-1">USD/año</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">12 meses de operación continua</p>
        </div>

        <div className="card-base p-5 border-l-4 border-l-[#2563EB]">
          <span className="text-xs font-semibold uppercase text-[#64748B]">Modelo de Facturación AWS</span>
          <div className="mt-1 text-lg font-bold text-[#1E293B] flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5 text-[#2563EB]" />
            <span>Pay-as-you-go</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Pago por uso sin inversión inicial fija (Capex a Opex)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculadora de Costos */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base p-6">
            <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2 pb-3 mb-4 border-b border-[#E2E8F0]">
              <Calculator className="w-4 h-4 text-[#F59E0B]" />
              Calculadora de Costos por Servicio
            </h3>

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#16A34A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddCost} className="space-y-4 text-xs">
              {/* 1. Selección del servicio */}
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1">
                  1. Selección del Servicio AWS *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#F59E0B] focus:outline-none text-xs bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Unidad: {selectedServiceObj.unitType} · Tarifa estimada: ${selectedServiceObj.hourlyRate.toFixed(4)}/h
                </p>
              </div>

              {/* 2. Cantidad y 3. Horas estimadas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    2. Cantidad de Unidades
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#F59E0B] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    3. Horas Estimadas / mes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="744"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#F59E0B] focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-[#64748B] mt-0.5">730 horas = 1 mes continuo</p>
                </div>
              </div>

              {/* 4. Costo estimado, 5. Costo mensual, 6. Costo anual (En vivo) */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">4. Tarifa por Hora:</span>
                  <span className="font-semibold text-[#1E293B]">
                    ${calculatedHourlyCost.toFixed(4)} USD/h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">5. Costo Mensual Calculado:</span>
                  <span className="font-bold text-[#1E293B]">
                    ${calculatedMonthly.toFixed(2)} USD/mes
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
                  <span className="text-[#64748B]">6. Costo Anual Proyectado:</span>
                  <span className="font-bold text-[#16A34A]">
                    ${calculatedAnnual.toFixed(2)} USD/año
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar a la Estimación
              </button>
            </form>
          </div>

          {/* Gráfico de Distribución de Costos por Categoría */}
          <div className="card-base p-5">
            <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2 mb-3">
              <PieChartIcon className="w-4 h-4 text-[#2563EB]" />
              Gráfico de Distribución de Costos
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`$${val.toFixed(2)} USD/mes`, 'Gasto']}
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-[#1E293B]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Desglose de Servicios Dimensionados (CostCards o Tabla) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-base text-[#1E293B]">
              Servicios en la Estimación ({costItems.length})
            </h3>

            {/* Alternador de Vista: Tarjetas o Tabla */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#F59E0B] shadow-2xs font-semibold'
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
                    ? 'bg-white text-[#F59E0B] shadow-2xs font-semibold'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla Detallada</span>
              </button>
            </div>
          </div>

          {/* Renderizado de Tarjetas */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {costItems.map((item) => (
                <CostCard
                  key={item.id}
                  item={item}
                  onRemove={removeCostItem}
                />
              ))}
            </div>
          ) : (
            /* Renderizado de Tabla con las columnas solicitadas */
            <div className="card-base overflow-hidden border border-[#E2E8F0]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Servicio</th>
                      <th className="px-3 py-3 text-center">Cantidad</th>
                      <th className="px-3 py-3 text-center">Horas/mes</th>
                      <th className="px-3 py-3 text-right">Tarifa/Hora</th>
                      <th className="px-3 py-3 text-right">Costo Mensual</th>
                      <th className="px-3 py-3 text-right">Costo Anual</th>
                      <th className="px-3 py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {costItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#1E293B]">{item.serviceName}</div>
                          <div className="text-[10px] text-[#F59E0B]">{item.category}</div>
                        </td>
                        <td className="px-3 py-3 text-center font-medium text-[#1E293B]">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-center text-[#64748B]">
                          {item.estimatedHours}h
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-[#64748B]">
                          ${item.hourlyCost.toFixed(4)}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-[#1E293B]">
                          ${item.monthlyCost.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-[#16A34A]">
                          ${item.annualCost.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => removeCostItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Eliminar servicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-[#E2E8F0]">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-[#1E293B]">Totales Estimados:</td>
                      <td className="px-3 py-3 text-right text-[#1E293B] text-sm">${totalMonthlyCost.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-[#16A34A] text-sm">${totalAnnualCost.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Principios de Optimización */}
          <div className="p-4 rounded-xl bg-slate-100 border border-[#E2E8F0] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1E293B] leading-relaxed">
              <p className="font-semibold text-[#1E293B] mb-1">Principios de Optimización de Costos en AWS:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[#64748B]">
                <li>Aprovechar la elasticidad apagando instancias EC2 fuera de horario laboral.</li>
                <li>Implementar políticas de ciclo de vida en Amazon S3 para transferir datos a Glacier.</li>
                <li>Evaluar instancias reservadas (Savings Plans) para cargas de trabajo estables con hasta 72% de ahorro.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
