import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcPriceElasticity } from '../../engine/priceElasticity';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';

export function PriceElasticityModule() {
  const inputs = useWhatifStore(s => s.inputs.priceElasticity);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("priceElasticity", calcPriceElasticity);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Fiyat Esnekliği</h2>
          <p className="text-[#7D7DA6] text-sm">Fiyatı değiştirdiğinizde talebin (sipariş adedinin) ve cironun nasıl etkileneceğini görün.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <SimulationSlider
            label="Mevcut Satış Fiyatı"
            value={inputs.currentPrice}
            onChange={v => setInput("priceElasticity", { currentPrice: v })}
            min={0} max={5000} step={10}
            format="currency"
          />
          
          <SimulationSlider
            label="Planlanan Fiyat Değişimi"
            value={inputs.priceChange}
            onChange={v => setInput("priceElasticity", { priceChange: v })}
            min={-0.50} max={0.50} step={0.01}
            format="percent"
          />
          
          <SimulationSlider
            label="Fiyat Esneklik Katsayısı"
            value={inputs.elasticity}
            onChange={v => setInput("priceElasticity", { elasticity: v })}
            min={-3.0} max={0} step={0.1}
            format="number"
          />
          
          <SimulationSlider
            label="Mevcut Aylık Talep (Adet)"
            value={inputs.currentDemand}
            onChange={v => setInput("priceElasticity", { currentDemand: v })}
            min={0} max={10000} step={10}
            format="number"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {output && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DeltaKpiCard
                label="Yeni Ciro"
                value={output.newRevenue}
                previousValue={output.currentRevenue}
                format="currency"
                size="medium"
              />
              <DeltaKpiCard
                label="Yeni Net Kâr"
                value={output.newNetProfit}
                previousValue={output.currentNetProfit}
                format="currency"
                size="medium"
              />
              <DeltaKpiCard
                label="Yeni Talep (Adet)"
                value={output.newDemand}
                previousValue={inputs.currentDemand}
                format="number"
                size="small"
              />
              <DeltaKpiCard
                label="Yeni Satış Fiyatı"
                value={output.newPrice}
                previousValue={inputs.currentPrice}
                format="currency"
                size="small"
              />
            </div>
            
            <div className="bg-[#FAFAFB] border border-[#EDEDF0] rounded-xl p-6 mt-2">
              <div className="text-sm font-medium text-[#0F1223]">
                <span className="font-bold text-[#514BEE]">Özet:</span> Esneklik katsayısı {inputs.elasticity} iken, yapacağınız %{Math.abs(inputs.priceChange * 100)}'lik {inputs.priceChange > 0 ? "fiyat artışı" : "fiyat indirimi"}, talebi %{Math.abs(inputs.elasticity * inputs.priceChange * 100)} oranında {inputs.priceChange > 0 ? "azaltacaktır" : "artıracaktır"}. Toplam net kâr değişimi: <span className={output.profitChange > 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>{output.profitChange > 0 ? "+" : ""}{output.profitChange.toLocaleString("tr-TR")} ₺</span>.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
