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
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {item.serviceName}
            </h4>
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 mt-1 rounded-md"
              style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              {item.category}
            </span>
          </div>

          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              title="Eliminar estimación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Parámetros de uso */}
        <div
          className="grid grid-cols-2 gap-2 my-3 text-xs p-2.5 rounded-lg"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Hash className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Cantidad: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong></span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Horas/mes: <strong style={{ color: 'var(--text-primary)' }}>{item.estimatedHours}h</strong></span>
          </div>
        </div>
      </div>

      {/* Costos */}
      <div className="pt-3 grid grid-cols-2 gap-3 items-end" style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <span className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Costo Mensual</span>
          <span className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
            <DollarSign className="w-4 h-4 text-[#F59E0B]" />
            {item.monthlyCost.toFixed(2)}
            <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-secondary)' }}>/mes</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Costo Anual</span>
          <span className="text-sm font-semibold text-[#16A34A]">
            ${item.annualCost.toFixed(2)}/año
          </span>
        </div>
      </div>
    </div>
  );
};
