import React from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcCampaign } from '../../engine/campaignSimulator';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';

export function CampaignSimulatorModule() {
  const inputs = useWhatifStore(s => s.inputs.campaign);
  const setInput = useWhatifStore(s => s.setInput);
  const output = useSimulation("campaign", calcCampaign);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#EDEDF0] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1223] mb-2">Kampanya & İndirim</h2>
          <p className="text-[#7D7DA6] text-sm">Farklı kampanya tiplerinin (İndirim, Bundle, Bedava Kargo) kârlılığa etkisini karşılaştırın.</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDF0]">
          <div className="mb-6">
            <label className="font-semibold text-sm text-[#0F1223] block mb-2">Kampanya Tipi</label>
            <select 
              value={inputs.campaignType}
              onChange={e => setInput("campaign", { campaignType: e.target.value })}
              className="w-full border border-[#EDEDF0] rounded-lg p-3 text-sm focus:outline-none focus:border-[#514BEE]"
            >
              <option value="discount">% İndirim</option>
              <option value="bundle">N Al M Öde (Bundle)</option>
              <option value="freeShipping">Ücretsiz Kargo</option>
              <option value="gift">Hediye Ürün</option>
            </select>
          </div>
          
          {inputs.campaignType === "discount" && (
            <SimulationSlider
              label="İndirim Yüzdesi"
              value={inputs.discountPct}
              onChange={v => setInput("campaign", { discountPct: v })}
              min={0} max={0.50} step={0.01}
              format="percent"
            />
          )}
          
          {inputs.campaignType === "bundle" && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-semibold text-sm text-[#0F1223] block mb-2">Alınan Adet (N)</label>
                <input type="number" value={inputs.bundleN} onChange={e => setInput("campaign", { bundleN: parseInt(e.target.value) })} className="w-full border border-[#EDEDF0] rounded-lg p-2" min={2} max={10} />
              </div>
              <div>
                <label className="font-semibold text-sm text-[#0F1223] block mb-2">Ödenen Adet (M)</label>
                <input type="number" value={inputs.bundleM} onChange={e => setInput("campaign", { bundleM: parseInt(e.target.value) })} className="w-full border border-[#EDEDF0] rounded-lg p-2" min={1} max={9} />
              </div>
            </div>
          )}
          
          <SimulationSlider
            label="Tahmini Talep Artışı"
            value={inputs.demandLift}
            onChange={v => setInput("campaign", { demandLift: v })}
            min={0} max={2.0} step={0.05}
            format="percent"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {output && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DeltaKpiCard
                label="Toplam Ciro"
                value={output.revenue}
                format="currency"
                size="medium"
              />
              <DeltaKpiCard
                label="Toplam Net Kâr"
                value={output.netProfit}
                format="currency"
                size="medium"
              />
              <DeltaKpiCard
                label="Satılan Adet"
                value={output.unitsSold}
                previousValue={inputs.baseDemand}
                format="number"
                size="small"
              />
              <DeltaKpiCard
                label="Efektif Satış Fiyatı"
                value={output.effectivePrice}
                previousValue={inputs.basePrice}
                format="currency"
                size="small"
              />
            </div>
            
            <div className="bg-[#FAFAFB] border border-[#EDEDF0] rounded-xl p-6 mt-2">
              <div className="text-sm font-medium text-[#0F1223]">
                Bu kampanya senaryosunda her bir birimin satışından elde edilen net marjınız 
                <span className={output.margin > 0.15 ? "text-emerald-600 font-bold ml-1" : "text-red-600 font-bold ml-1"}>
                  %{(output.margin * 100).toFixed(1)}
                </span> olarak gerçekleşmektedir.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
