import React, { useState, useEffect } from 'react';
import { useWhatifStore } from '../../store/whatifStore';
import { useSimulation } from '../../store/useSimulation';
import { calcReversePricing } from '../../engine/reversePricing';
import { validateOutput } from '../../engine/validation';
import { SimulationSlider } from '../components/SimulationSlider';
import { DeltaKpiCard } from '../components/DeltaKpiCard';
import { MarginAlertBanner } from '../components/MarginAlertBanner';
import { BreakEvenIndicator } from '../components/BreakEvenIndicator';
import { Save, X } from 'lucide-react';

export function ReversePricingModule() {
  const inputs = useWhatifStore(s => s.inputs.reversePricing);
  const selectedChannel = useWhatifStore(s => s.selectedChannel);
  const selectedProduct = useWhatifStore(s => s.selectedProduct);
  const setInput = useWhatifStore(s => s.setInput);
  const saveScenario = useWhatifStore(s => s.saveScenario);
  const output = useSimulation("reversePricing", calcReversePricing);
  
  const warnings = output ? validateOutput(inputs, output) : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [lowestCompPrice, setLowestCompPrice] = useState(null);

  useEffect(() => {
     if (selectedProduct) {
        fetch('/api/competitors')
          .then(res => res.ok ? res.json() : [])
          .then(data => {
             const comps = data.filter(c => c.productId === selectedProduct.id && c.price > 0);
             if (comps.length > 0) {
                setLowestCompPrice(Math.min(...comps.map(c => c.price)));
             } else {
                setLowestCompPrice(null);
             }
          }).catch(() => setLowestCompPrice(null));
     }
  }, [selectedProduct]);

  const handleSave = () => {
    if (scenarioName && scenarioName.trim()) {
      saveScenario(scenarioName.trim());
      setIsModalOpen(false);
      setScenarioName("");
    }
  };

  return (
    <>
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
          
          <div className="mt-8 pt-6 border-t border-[#EDEDF0]">
            <h3 className="text-sm font-bold text-[#7D7DA6] uppercase tracking-wider mb-4">Maliyet Analizi (Seçili Kanal)</h3>
            
            <div className="bg-[#F8F9FB] rounded-xl p-4 border border-[#EDEDF0] shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#7D7DA6]">Üretim / Tedarik Maliyeti</span>
                <span className="text-sm font-bold text-[#0F1223]">₺ {inputs.cost.toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#7D7DA6]">Kargo & Paketleme</span>
                <span className="text-sm font-bold text-[#0F1223]">₺ {(inputs.baseShipping || 0).toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
              </div>
              {output && output.costBreakdown && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[#7D7DA6]">
                      {selectedChannel === 'trendyol' ? 'Pazaryeri Komisyonu' : 'POS Komisyonu'}
                    </span>
                    <span className="text-sm font-bold text-[#0F1223]">₺ {output.costBreakdown.commission.toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[#7D7DA6]">Şirket Gider Payı</span>
                    <span className="text-sm font-bold text-[#0F1223]">₺ {output.costBreakdown.fixedCost.toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[#7D7DA6]">Reklam (CPA)</span>
                    <span className="text-sm font-bold text-[#0F1223]">₺ {output.costBreakdown.adSpend.toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[#7D7DA6]">Vergi (KDV)</span>
                    <span className="text-sm font-bold text-[#0F1223]">₺ {output.costBreakdown.tax.toLocaleString("tr-TR", {maximumFractionDigits: 0})}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#EDEDF0]">
                <span className="text-xs font-bold text-[#514BEE] uppercase tracking-wider flex items-center gap-1">Giydirilmiş Maliyet</span>
                <span className="text-base font-bold text-[#514BEE]">
                  {output && output.fullyLoadedCost ? `₺ ${output.fullyLoadedCost.toLocaleString("tr-TR", {maximumFractionDigits: 0})}` : "—"}
                </span>
              </div>
              <p className="text-[10px] text-[#7D7DA6] mt-2">
                * Hedef fiyata ulaşıldığında ortaya çıkacak vergi, komisyon, tahmini reklam ve operasyonel şirket giderlerini kapsar.
              </p>
            </div>
          </div>
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
                <div className="text-3xl lg:text-4xl font-bold tracking-tight mb-6 text-white">
                  {output.optimalPrice ? `₺ ${output.optimalPrice.toLocaleString("tr-TR", {maximumFractionDigits: 0})}` : "—"}
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Net Kâr (Per Sipariş)</div>
                    <div className="text-xl font-semibold text-emerald-400">
                      ₺ {output.netProfit.toLocaleString("tr-TR", {maximumFractionDigits: 0})}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Gerçekleşen Marj</div>
                    <div className="text-xl font-semibold text-emerald-400">
                      {(output.margin * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* INSIGHTS SECTION */}
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-3">
                  {lowestCompPrice && output.optimalPrice && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Piyasa Konumu</div>
                      <div className="text-sm text-gray-300 leading-relaxed">
                        Bu fiyatı uygularsanız, en düşük rakibinizden (₺{lowestCompPrice.toLocaleString("tr-TR")}) 
                        <strong className={output.optimalPrice > lowestCompPrice ? "text-red-400 ml-1" : "text-emerald-400 ml-1"}>
                          {output.optimalPrice > lowestCompPrice ? `%${((output.optimalPrice / lowestCompPrice - 1) * 100).toFixed(1)} daha pahalı` : `%${((1 - output.optimalPrice / lowestCompPrice) * 100).toFixed(1)} daha ucuz`}
                        </strong> olacaksınız.
                      </div>
                    </div>
                  )}

                  {output.netProfit > 0 && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Maliyet Toleransı</div>
                      <div className="text-sm text-gray-300 leading-relaxed">
                        Giderleriniz (üretim/kargo) 
                        <strong className="text-indigo-400 mx-1">
                          {`%${(((output.netProfit * (1 + inputs.taxRate)) / Math.max(1, inputs.cost + inputs.baseShipping)) * 100).toFixed(1)}`}
                        </strong> 
                        oranında artsa bile, bu fiyatlamayla zarara girmezsiniz.
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            <BreakEvenIndicator price={output.breakEvenPrice} />
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 w-full bg-white border border-[#EDEDF0] hover:border-[#514BEE] hover:text-[#514BEE] text-[#0F1223] text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Save size={18} />
              Bu Senaryoyu Kaydet
            </button>
          </div>
        )}
      </div>
    </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1223]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-[#EDEDF0]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#7D7DA6] hover:text-[#0F1223] transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#0F1223] mb-2">Senaryoyu Kaydet</h3>
            <p className="text-sm text-[#7D7DA6] mb-5">
              Kaydedilecek senaryo için açıklayıcı bir isim girin.
            </p>
            <input 
              type="text"
              autoFocus
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              placeholder="Örn: Q4 Kampanya Fiyatı"
              className="w-full px-4 py-3 rounded-xl border border-[#EDEDF0] focus:border-[#514BEE] focus:ring-2 focus:ring-[#514BEE]/20 outline-none transition text-[#0F1223]"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-[#0F1223] hover:bg-gray-100 transition"
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                disabled={!scenarioName.trim()}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#514BEE] hover:bg-[#3d38ca] disabled:opacity-50 disabled:bg-[#B4B4C8] transition shadow-sm"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
