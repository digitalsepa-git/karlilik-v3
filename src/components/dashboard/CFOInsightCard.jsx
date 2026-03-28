import React from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CFOInsightCard = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSummary, setHasSummary] = React.useState(false);

    const generateSummary = () => {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            setHasSummary(true);
        }, 1500);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-900">CFO Insight</h3>
                </div>
                <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full border border-indigo-100">
                    AI Beta
                </span>
            </div>

            {/* Content Body */}
            <div
                id="ai-content-area"
                className={cn(
                    "flex-1 rounded-lg border border-gray-100 mb-6 flex flex-col transition-all duration-300",
                    hasSummary && !isLoading ? "bg-white border-0 p-0" : "bg-gray-50 p-5 items-center justify-center text-center py-10"
                )}
            >
                {isLoading ? (
                    // Loading State
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                        <p className="text-xs text-indigo-600 font-medium">Finansal veriler taranıyor...</p>
                    </div>
                ) : hasSummary ? (
                    // Result State (The requested HTML)
                    <div className="flex flex-col gap-4 text-sm text-gray-700 animate-in fade-in duration-500">
                        <div className="flex gap-3 items-start">
                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <p><span className="font-bold text-gray-900">Net Kar Hedefi Aşıldı:</span> Geçen aya göre kar marjı <span className="text-emerald-600 font-bold">%23</span> seviyesine yükseldi. Lojistik maliyetlerindeki %5'lik düşüş buna ana katkıyı sağladı.</p>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="mt-1 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <p><span className="font-bold text-gray-900">Stok Riski:</span> "Bluetooth Speaker" stoğu kritik seviyenin üzerinde (120 gün). Nakit akışını hızlandırmak için kampanya önerilir.</p>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <p><span className="font-bold text-gray-900">Pazarlama Verimliliği:</span> Google Ads ROAS değeri <span className="font-bold">5.2x</span> ile Meta'dan (3.1x) daha iyi performans gösteriyor. Bütçe kaydırması önerilir.</p>
                        </div>
                    </div>
                ) : (
                    // Default State
                    <>
                        <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                            <Sparkles className="h-6 w-6 text-indigo-400" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[200px]">
                            Seçili tarih aralığı için finansal verileri analiz etmek üzere hazırım.
                        </p>
                    </>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-auto">
                <button
                    id="btn-generate-summary"
                    onClick={generateSummary}
                    disabled={isLoading}
                    className={cn(
                        "w-full font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group",
                        isLoading
                            ? "bg-indigo-50 text-indigo-400 cursor-not-allowed shadow-none"
                            : hasSummary
                                ? "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                    )}
                >
                    {isLoading ? (
                        <>Veriler Analiz Ediliyor...</>
                    ) : (
                        <>
                            <Wand2 className={cn("h-4 w-4", !hasSummary && "group-hover:rotate-12 transition-transform")} />
                            <span>{hasSummary ? "Özeti Yenile" : "Özet Çıkar"}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
