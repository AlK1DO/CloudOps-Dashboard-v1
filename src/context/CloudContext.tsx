import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CloudProposal, CostCalculationItem, AwsService, GlobalRegion } from '../types/cloud';
import { AWS_SERVICES, GLOBAL_REGIONS } from '../data/awsServices';

// ── Claves de localStorage ──────────────────────────────────────────────────
const LS_PROPOSALS      = 'cloudops_proposals_v2';
const LS_COST_ITEMS     = 'cloudops_cost_items_v2';
const LS_SELECTED_REGION = 'cloudops_selected_region_v2';

// ── Helper: leer de localStorage con fallback seguro ──────────────────────
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Helper para sincronizar servicios seleccionados con Costos ───────────
export function createCostItemsFromServices(serviceNames: string[]): CostCalculationItem[] {
  return serviceNames.map((svcName, index) => {
    const foundSvc = AWS_SERVICES.find(s => s.name === svcName || svcName.includes(s.name) || s.name.includes(svcName));
    const serviceId = foundSvc?.id || `svc-${index}`;
    const category = foundSvc?.category || 'Computación';
    const hourlyCost = foundSvc ? foundSvc.hourlyRate : 0.02;
    const quantity = serviceId === 's3' ? 100 : serviceId === 'ec2' ? 2 : 1;
    const hours = 730;
    const monthlyCost = Number((quantity * hours * (hourlyCost > 0 ? hourlyCost : 0.01)).toFixed(2));
    const annualCost = Number((monthlyCost * 12).toFixed(2));

    return {
      id: `cost-${serviceId}`,
      serviceId,
      serviceName: foundSvc ? foundSvc.name : svcName,
      category,
      quantity,
      estimatedHours: hours,
      hourlyCost,
      monthlyCost,
      annualCost,
    };
  });
}

// ── Tipos del contexto ────────────────────────────────────────────────────
interface CloudContextType {
  proposals: CloudProposal[];
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  removeProposal: (id: string) => void;
  costItems: CostCalculationItem[];
  addCostItem: (item: Omit<CostCalculationItem, 'id'>) => void;
  removeCostItem: (id: string) => void;
  syncCostItemsWithServices: (serviceNames: string[]) => void;
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
  // ── Inicializar propuestas y costos sincronizados ──────────
  const [proposals, setProposals] = useState<CloudProposal[]>(() =>
    readStorage<CloudProposal[]>(LS_PROPOSALS, [])
  );

  const [costItems, setCostItems] = useState<CostCalculationItem[]>(() => {
    const saved = readStorage<CostCalculationItem[]>(LS_COST_ITEMS, []);
    return saved;
  });

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

  const setSelectedRegion = (region: string) => {
    setSelectedRegionState(region);
  };

  // ── Sincronizar Costos y Economía con los servicios seleccionados ──────────
  const syncCostItemsWithServices = (serviceNames: string[]) => {
    const synced = createCostItemsFromServices(serviceNames);
    setCostItems(synced);
  };

  // ── Proposals ─────────────────────────────────────────────────────────────
  const addProposal = (newProp: Omit<CloudProposal, 'id' | 'createdAt'>) => {
    const proposal: CloudProposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProposals(prev => [proposal, ...prev]);

    // Conectar inmediatamente con Costos y Economía
    if (proposal.selectedServices && proposal.selectedServices.length > 0) {
      syncCostItemsWithServices(proposal.selectedServices);
    }
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

  // ── Región activa calculada con recursos dinámicos ─────────────────────────
  const activeRegionData = useMemo(() => {
    const baseRegion = GLOBAL_REGIONS.find(r => selectedRegion.startsWith(r.regionCode)) ?? GLOBAL_REGIONS[0];
    const latestProposal = proposals[0];
    const deployedServices = latestProposal?.selectedServices && latestProposal.selectedServices.length > 0
      ? latestProposal.selectedServices
      : baseRegion.deployedServices;

    return {
      ...baseRegion,
      deployedServices,
    };
  }, [selectedRegion, proposals]);

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
        syncCostItemsWithServices,
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
