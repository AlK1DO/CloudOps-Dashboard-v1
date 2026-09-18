import React from 'react';
import { DollarSign, Clock, Hash, Trash2 } from 'lucide-react';
import { CostCalculationItem } from '../types/cloud';

interface CostCardProps {
  item: CostCalculationItem;
  onRemove?: (id: string) => void;
}

export const CostCard: React.FC<CostCardProps> = ({ item, onRemove }) => {
  return (
    <div className="card-base p-5 flex flex-col justify-between border-l-4 border-l-[#F59E0B]">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="font-bold text-base text-[#1E293B]">
              {item.serviceName}
            </h4>
            <span className="inline-block text-xs font-medium px-2 py-0.5 mt-1 bg-amber-50 text-[#F59E0B] border border-amber-200 rounded-md">
              {item.category}
            </span>
          </div>

          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-[#64748B] hover:text-[#DC2626] hover:bg-rose-50 rounded-lg transition-colors"
              title="Eliminar estimación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Parámetros de uso */}
        <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0]">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Hash className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Cantidad: <strong className="text-[#1E293B]">{item.quantity}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Horas/mes: <strong className="text-[#1E293B]">{item.estimatedHours}h</strong></span>
          </div>
        </div>
      </div>

      {/* Resumen de costos mensuales y anuales */}
      <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-3 items-end">
        <div>
          <span className="text-[11px] font-medium text-[#64748B] block">Costo Mensual</span>
          <span className="text-lg font-bold text-[#1E293B] flex items-center">
            <DollarSign className="w-4 h-4 text-[#F59E0B]" />
            {item.monthlyCost.toFixed(2)}
            <span className="text-[10px] text-[#64748B] font-normal ml-0.5">/mes</span>
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-[#64748B] block">Costo Anual</span>
          <span className="text-sm font-semibold text-[#16A34A]">
            ${item.annualCost.toFixed(2)}/año
          </span>
        </div>
      </div>
    </div>
  );
};
