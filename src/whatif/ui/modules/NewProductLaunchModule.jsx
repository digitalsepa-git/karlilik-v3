import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcNewProductLaunch } from '../../engine/newProductLaunch';
import { validateOutput } from '../../engine/validation';
import { SimulationSlider } from '../components/SimulationSlider';
import { MarginAlertBanner } from '../components/MarginAlertBanner';
import { BreakEvenIndicator } from '../components/BreakEvenIndicator';
import { Save } from 'lucide-react';

export function NewProductLaunchModule() {
  const inputs = useWhatifStore(s => s.inputs.newProductLaunch);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("newProductLaunch", calcNewProductLaunch);
  
  const warnings = output ? validateOutput(inputs, output) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Yeni Ürün Lansmanı</h2>
          <p className="text-[#7D7DA6] text-sm">Piyasaya yeni çıkacak bir ürünün maliyetine göre ideal çıkış fiyatını hesaplayın.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <SimulationSlider
            label="Ürün Maliyeti (Tedarik + Kargo)"
            value={inputs.cost}
            onChange={v => setInput("newProductLaunch", { cost: v })}
            min={0} max={5000} step={10}
            format="currency"
          />
          
          <SimulationSlider
            label="Lansman Dönemi Hedef Marj"
            value={inputs.targetMargin}
            onChange={v => setInput("newProductLaunch", { targetMargin: v })}
            min={0} max={0.50} step={0.01}
            format="percent"
          />
        </div>
      </div>
      
      <div className="flex flex-col">
        {output && output.error ? (
          <MarginAlertBanner warnings={[{severity: "danger", message: output.error}]} />
        ) : output && (
          <div className="flex flex-col h-full">
            <MarginAlertBanner warnings={warnings} />
            
            <div className="bg-[#0F1223] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-gray-800 flex-1">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#514BEE] opacity-20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">ÖNERİLEN LANSMAN FİYATI</div>
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
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Hesaba Katılan Giderler</div>
                    <div className="text-sm font-medium text-gray-300">
                      %18 Komisyon, %10 Reklam (Lansman Varsayılanı)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <BreakEvenIndicator price={output.breakEvenPrice} />
          </div>
        )}
      </div>
    </div>
  );
}
