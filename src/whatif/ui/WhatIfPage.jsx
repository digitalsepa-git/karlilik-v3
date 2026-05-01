import React from 'react';
import { useWhatifStore } from '../store/whatifStore';
import { ModuleTabs } from './ModuleTabs';
import { ContextPicker } from './ContextPicker';
import { ScenarioListSidebar } from './ScenarioListSidebar';

import { ReversePricingModule } from './modules/ReversePricingModule';
import { NewProductLaunchModule } from './modules/NewProductLaunchModule';
import { PriceElasticityModule } from './modules/PriceElasticityModule';
import { CampaignSimulatorModule } from './modules/CampaignSimulatorModule';
import { CostImpactModule } from './modules/CostImpactModule';
import { AdRoasSimulatorModule } from './modules/AdRoasSimulatorModule';

export function WhatIfPage() {
  const { activeModule } = useWhatifStore();
  
  const renderModule = () => {
    switch (activeModule) {
      case "reversePricing": return <ReversePricingModule />;
      case "newProductLaunch": return <NewProductLaunchModule />;
      case "priceElasticity": return <PriceElasticityModule />;
      case "campaign": return <CampaignSimulatorModule />;
      case "costImpact": return <CostImpactModule />;
      case "adRoas": return <AdRoasSimulatorModule />;
      default: return <ReversePricingModule />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB]">
      <ContextPicker />
      <ModuleTabs />
      
      <div className="flex flex-1 overflow-hidden">
        <ScenarioListSidebar className="w-72 border-r border-[#EDEDF0] hidden md:flex" />
        
        <main className="flex-1 overflow-auto no-scrollbar">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
