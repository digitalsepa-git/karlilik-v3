import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcAdRoas } from '../../engine/adRoasSimulator';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';
import { BreakEvenIndicator } from '../components/BreakEvenIndicator';

export function AdRoasSimulatorModule() {
  const inputs = useWhatifStore(s => s.inputs.adRoas);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("adRoas", calcAdRoas);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Reklam & ROAS Simülasyonu</h2>
          <p className="text-[#7D7DA6] text-sm">Reklam bütçesini artırdığınızda Azalan Verimler Kanunu (Diminishing Returns) sebebiyle ROAS'ın nasıl etkileneceğini görün.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <SimulationSlider
            label="Mevcut Aylık Bütçe"
            value={inputs.currentBudget}
            onChange={v => setInput("adRoas", { currentBudget: v })}
            min={0} max={100000} step={100}
            format="currency"
          />
          
          <SimulationSlider
            label="Mevcut ROAS (Reklam Getirisi)"
            value={inputs.currentRoas}
            onChange={v => setInput("adRoas", { currentRoas: v })}
            min={1.0} max={20.0} step={0.1}
            format="number"
          />
          
          <SimulationSlider
            label="Bütçe Artış/Azalış Çarpanı"
            value={inputs.budgetMultiplier}
            onChange={v => setInput("adRoas", { budgetMultiplier: v })}
            min={0.5} max={5.0} step={0.1}
            format="number"
          />
          
          <SimulationSlider
            label="Diminishing Returns Faktörü"
            value={inputs.decayFactor}
            onChange={v => setInput("adRoas", { decayFactor: v })}
            min={0.5} max={1.0} step={0.05}
            format="number"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {output && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DeltaKpiCard
                label="Yeni ROAS"
                value={output.newRoas}
                previousValue={inputs.currentRoas}
                format="number"
                size="medium"
              />
              <DeltaKpiCard
                label="Yeni Ciro"
                value={output.newRevenue}
                previousValue={inputs.currentBudget * inputs.currentRoas}
                format="currency"
                size="medium"
              />
              <DeltaKpiCard
                label="Yeni Net Kâr"
                value={output.newNetProfit}
                previousValue={inputs.currentBudget * inputs.currentRoas * inputs.profitMargin - inputs.currentBudget}
                format="currency"
                size="small"
              />
              <DeltaKpiCard
                label="Yeni Bütçe"
                value={output.newBudget}
                previousValue={inputs.currentBudget}
                format="currency"
                size="small"
              />
            </div>
            
            <div className="mt-4">
              <BreakEvenIndicator price={output.breakEvenRoas} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
