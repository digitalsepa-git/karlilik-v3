import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcCostImpact } from '../../engine/costImpact';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';

export function CostImpactModule() {
  const inputs = useWhatifStore(s => s.inputs.costImpact);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("costImpact", calcCostImpact);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Maliyet & Komisyon Etkisi</h2>
          <p className="text-[#7D7DA6] text-sm">Pazaryeri komisyonlarındaki, kargo ücretlerindeki veya tedarikçi maliyetlerindeki artışların kârlılığa etkisini ölçün.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <SimulationSlider
            label="Komisyon Değişimi"
            value={inputs.commissionDelta}
            onChange={v => setInput("costImpact", { commissionDelta: v })}
            min={-0.10} max={0.10} step={0.005}
            format="percent"
          />
          
          <SimulationSlider
            label="Kargo Maliyeti Değişimi (₺)"
            value={inputs.shippingDelta}
            onChange={v => setInput("costImpact", { shippingDelta: v })}
            min={-50} max={50} step={1}
            format="currency"
          />
          
          <SimulationSlider
            label="Tedarik Maliyeti Değişimi"
            value={inputs.costDelta}
            onChange={v => setInput("costImpact", { costDelta: v })}
            min={-0.30} max={0.30} step={0.01}
            format="percent"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {output && (
          <div className="grid grid-cols-2 gap-4">
            <DeltaKpiCard
              label="Yeni Net Kâr (Sipariş Başı)"
              value={output.newNetProfit}
              previousValue={output.currentNetProfit}
              format="currency"
              size="medium"
            />
            <DeltaKpiCard
              label="Yeni Marj"
              value={output.newMargin}
              previousValue={output.currentMargin}
              format="percent"
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
}
