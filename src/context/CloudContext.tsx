import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CloudProposal, CostCalculationItem, AwsService, GlobalRegion } from '../types/cloud';
import { INITIAL_PROPOSALS, INITIAL_COST_ITEMS, AWS_SERVICES, GLOBAL_REGIONS } from '../data/awsServices';

// ── Claves de localStorage ──────────────────────────────────────────────────
const LS_PROPOSALS      = 'cloudops_proposals';
const LS_COST_ITEMS     = 'cloudops_cost_items';
const LS_SELECTED_REGION = 'cloudops_selected_region';

// ── Helper: leer de localStorage con fallback seguro ──────────────────────
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Tipos del contexto ────────────────────────────────────────────────────
interface CloudContextType {
  proposals: CloudProposal[];
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  removeProposal: (id: string) => void;
  costItems: CostCalculationItem[];
  addCostItem: (item: Omit<CostCalculationItem, 'id'>) => void;
  removeCostItem: (id: string) => void;
  services: AwsService[];
  regions: GlobalRegion[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  activeRegionData: GlobalRegion;
  costMultiplier: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  baseMonthlyCost: number;
}

const CloudContext = createContext<CloudContextType | undefined>(undefined);

export const CloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Estado inicializado desde localStorage (o datos por defecto) ──────────
  const [proposals, setProposals] = useState<CloudProposal[]>(() =>
    readStorage<CloudProposal[]>(LS_PROPOSALS, INITIAL_PROPOSALS)
  );

  const [costItems, setCostItems] = useState<CostCalculationItem[]>(() =>
    readStorage<CostCalculationItem[]>(LS_COST_ITEMS, INITIAL_COST_ITEMS)
  );

  const [selectedRegion, setSelectedRegionState] = useState<string>(() =>
    readStorage<string>(LS_SELECTED_REGION, 'us-east-1 (Norte de Virginia)')
  );

  // ── Sincronizar con localStorage cada vez que cambia el estado ────────────
  useEffect(() => {
    localStorage.setItem(LS_PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(LS_COST_ITEMS, JSON.stringify(costItems));
  }, [costItems]);

  useEffect(() => {
    localStorage.setItem(LS_SELECTED_REGION, JSON.stringify(selectedRegion));
  }, [selectedRegion]);

  // ── Wrapper para setSelectedRegion que también persiste ──────────────────
  const setSelectedRegion = (region: string) => {
    setSelectedRegionState(region);
  };

  // ── Proposals ─────────────────────────────────────────────────────────────
  const addProposal = (newProp: Omit<CloudProposal, 'id' | 'createdAt'>) => {
    const proposal: CloudProposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProposals(prev => [proposal, ...prev]);
  };

  const removeProposal = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  // ── Cost Items ────────────────────────────────────────────────────────────
  const addCostItem = (newItem: Omit<CostCalculationItem, 'id'>) => {
    const item: CostCalculationItem = {
      ...newItem,
      id: `cost-${Date.now()}`,
    };
    setCostItems(prev => [...prev, item]);
  };

  const removeCostItem = (id: string) => {
    setCostItems(prev => prev.filter(item => item.id !== id));
  };

  // ── Región activa calculada ───────────────────────────────────────────────
  const activeRegionData = useMemo(
    () => GLOBAL_REGIONS.find(r => selectedRegion.startsWith(r.regionCode)) ?? GLOBAL_REGIONS[0],
    [selectedRegion]
  );

  const costMultiplier = activeRegionData.costMultiplier;

  const baseMonthlyCost = costItems.reduce((sum, item) => sum + item.monthlyCost, 0);

  const totalMonthlyCost = Number((baseMonthlyCost * costMultiplier).toFixed(2));
  const totalAnnualCost  = Number((baseMonthlyCost * costMultiplier * 12).toFixed(2));

  return (
    <CloudContext.Provider
      value={{
        proposals,
        addProposal,
        removeProposal,
        costItems,
        addCostItem,
        removeCostItem,
        services: AWS_SERVICES,
        regions: GLOBAL_REGIONS,
        selectedRegion,
        setSelectedRegion,
        activeRegionData,
        costMultiplier,
        totalMonthlyCost,
        totalAnnualCost,
        baseMonthlyCost,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const context = useContext(CloudContext);
  if (!context) throw new Error('useCloud must be used within a CloudProvider');
  return context;
};
