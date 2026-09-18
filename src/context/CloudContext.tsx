import React, { createContext, useContext, useState } from 'react';
import { CloudProposal, CostCalculationItem, AwsService, GlobalRegion } from '../types/cloud';
import { INITIAL_PROPOSALS, INITIAL_COST_ITEMS, AWS_SERVICES, GLOBAL_REGIONS } from '../data/awsServices';

interface CloudContextType {
  proposals: CloudProposal[];
  addProposal: (proposal: Omit<CloudProposal, 'id' | 'createdAt'>) => void;
  costItems: CostCalculationItem[];
  addCostItem: (item: Omit<CostCalculationItem, 'id'>) => void;
  removeCostItem: (id: string) => void;
  services: AwsService[];
  regions: GlobalRegion[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  totalMonthlyCost: number;
  totalAnnualCost: number;
}

const CloudContext = createContext<CloudContextType | undefined>(undefined);

export const CloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<CloudProposal[]>(INITIAL_PROPOSALS);
  const [costItems, setCostItems] = useState<CostCalculationItem[]>(INITIAL_COST_ITEMS);
  const [selectedRegion, setSelectedRegion] = useState<string>('us-east-1 (Norte de Virginia)');

  const addProposal = (newProp: Omit<CloudProposal, 'id' | 'createdAt'>) => {
    const proposal: CloudProposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProposals(prev => [proposal, ...prev]);
  };

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

  const totalMonthlyCost = costItems.reduce((sum, item) => sum + item.monthlyCost, 0);
  const totalAnnualCost = costItems.reduce((sum, item) => sum + item.annualCost, 0);

  return (
    <CloudContext.Provider
      value={{
        proposals,
        addProposal,
        costItems,
        addCostItem,
        removeCostItem,
        services: AWS_SERVICES,
        regions: GLOBAL_REGIONS,
        selectedRegion,
        setSelectedRegion,
        totalMonthlyCost,
        totalAnnualCost,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const context = useContext(CloudContext);
  if (!context) {
    throw new Error('useCloud must be used within a CloudProvider');
  }
  return context;
};
