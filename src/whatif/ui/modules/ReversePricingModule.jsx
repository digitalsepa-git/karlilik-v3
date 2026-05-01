import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcReversePricing } from '../../engine/reversePricing';
import { validateOutput } from '../../engine/validation';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';
import { MarginAlertBanner } from '../components/MarginAlertBanner';
import { BreakEvenIndicator } from '../components/BreakEvenIndicator';
import { Save } from 'lucide-react';

export function ReversePricingModule() {
  const inputs = useWhatifStore(s => s.inputs.reversePricing);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("reversePricing", calcReversePricing);
  
  const warnings = output ? validateOutput(inputs, output) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* SOL: Input slider'lar */}
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Reverse Pricing</h2>
          <p className="text-[#7D7DA6] text-sm">Hedeflediğiniz net kâr marjına göre olması gereken optimal satış fiyatını hesaplayın.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <SimulationSlider
            label="Ürün Maliyeti"
            value={inputs.cost}
            onChange={v => setInput("reversePricing", { cost: v })}
            min={0} max={5000} step={10}
            format="currency"
          />
          
          <SimulationSlider
            label="Hedef Net Marj"
            value={inputs.targetMargin}
            onChange={v => setInput("reversePricing", { targetMargin: v })}
            min={0} max={0.50} step={0.01}
            format="percent"
          />
          
          <SimulationSlider
            label="Pazaryeri Komisyonu"
            value={inputs.commission}
            onChange={v => setInput("reversePricing", { commission: v })}
            min={0} max={0.35} step={0.005}
            format="percent"
          />
          
          <SimulationSlider
            label="Reklam Bütçesi Payı"
            value={inputs.adSpend}
            onChange={v => setInput("reversePricing", { adSpend: v })}
            min={0} max={0.30} step={0.005}
            format="percent"
          />
        </div>
      </div>
      
      {/* SAĞ: Output */}
      <div className="flex flex-col">
        {output && output.error ? (
          <MarginAlertBanner warnings={[{severity: "danger", message: output.error}]} />
        ) : output && (
          <div className="flex flex-col h-full">
            <MarginAlertBanner warnings={warnings} />
            
            <div className="bg-[#0F1223] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-gray-800 flex-1">
              {/* Background accent */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#514BEE] opacity-20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">ÖNERİLEN SATIŞ FİYATI</div>
                <div className="text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
                  {output.optimalPrice ? `₺ ${output.optimalPrice.toLocaleString("tr-TR", {maximumFractionDigits: 0})}` : "—"}
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Net Kâr (Per Sipariş)</div>
                    <div className="text-2xl font-semibold text-emerald-400">
                      ₺ {output.netProfit.toLocaleString("tr-TR", {maximumFractionDigits: 0})}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Gerçekleşen Marj</div>
                    <div className="text-2xl font-semibold text-emerald-400">
                      {(output.margin * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <BreakEvenIndicator price={output.breakEvenPrice} />
            
            <button className="mt-6 w-full bg-white border border-[#EDEDF0] hover:border-[#514BEE] hover:text-[#514BEE] text-[#0F1223] font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-sm">
              <Save size={18} />
              Bu Senaryoyu Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
