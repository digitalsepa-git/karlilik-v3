import React from 'react';
import { Megaphone, ArrowUpRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useData } from '../../context/DataContext';

export function MarketingPerformance({ startDate, endDate }) {
    const { analyticsData } = useData();
    const { data: ga, loading, error } = analyticsData;

    // Calculate dynamic days diff for Daily Avg Spend
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const daysDiff = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (loading) {
        return (
            <div className="col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col min-h-[400px]">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900">Pazarlama Performansı</h3>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-8 text-indigo-600">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !ga) {
        return (
            <div className="col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col min-h-[400px]">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900">Pazarlama Performansı</h3>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-rose-600">
                    <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
                    <p className="font-semibold">Google Analytics Bağlantı Hatası</p>
                    <p className="text-sm mt-1">{error || "Veri alınamadı"}</p>
                </div>
            </div>
        );
    }
    return (
        <div className="col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Pazarlama Performansı</h3>
                </div>
                <span className="text-xs font-medium text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                    Analiz Et
                </span>
            </div>

            {/* Content Stack */}
            <div className="flex-1 flex flex-col justify-between p-5 gap-6">

                {/* 1. TOP: Key Metrics Grid (2x2) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-1">Toplam Harcama</p>
                        <h4 className="text-lg font-bold text-slate-900">₺{ga.totalAdCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h4>
                    </div>
                    <div className={cn("p-3 rounded-lg border", ga.overallRoas >= 3 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100")}>
                        <p className={cn("text-xs font-medium mb-1", ga.overallRoas >= 3 ? "text-emerald-600" : "text-amber-600")}>Getiri (ROAS)</p>
                        <h4 className={cn("text-lg font-bold", ga.overallRoas >= 3 ? "text-emerald-700" : "text-amber-700")}>{Math.max(ga.overallRoas, 0).toFixed(2)}x</h4>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-1">Dönüşüm Maliyeti</p>
                        <h4 className="text-lg font-bold text-slate-900">₺{ga.cpa.toFixed(1)}</h4>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-1">Dönüşüm (CR)</p>
                        <h4 className="text-lg font-bold text-slate-900">%{ga.cr.toFixed(2)}</h4>
                    </div>
                </div>

                {/* 2. MIDDLE: Channel Spend Breakdown */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Kanal Bazlı Harcama</p>

                    {/* Google Ads */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-slate-600">Google Ads</span>
                            <span className="text-xs font-bold text-slate-900">₺{ga.channels.googleAds.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (ga.channels.googleAds.cost / Math.max(1, ga.totalAdCost)) * 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Meta */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-slate-600">Meta (FB/IG)</span>
                            <span className="text-xs font-bold text-slate-900">₺{ga.channels.metaAds.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (ga.channels.metaAds.cost / Math.max(1, ga.totalAdCost)) * 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Others */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-slate-600">Diğer</span>
                            <span className="text-xs font-bold text-slate-900">₺{ga.channels.other.cost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${Math.min(100, (ga.channels.other.cost / Math.max(1, ga.totalAdCost)) * 100)}%` }}></div>
                        </div>
                    </div>

                </div>

                {/* 2.5. MIDDLE: Platform Efficiency (ROAS) - New Spacer Section */}
                <div className="border-t border-slate-50 pt-6">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Platform Verimliliği (ROAS)</p>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Google Ads ROAS */}
                        <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-100">
                            <span className="text-xs text-slate-400 font-medium mb-1">Google Ads</span>
                            <div className="flex items-center gap-1.5">
                                <h5 className={cn("text-xl font-bold", ga.channels.googleAds.roas >= 3 ? "text-emerald-600": "text-slate-700")}>{Math.max(ga.channels.googleAds.roas, 0).toFixed(1)}x</h5>
                                {ga.channels.googleAds.roas > 0 && (
                                    <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        <ArrowUpRight className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Meta ROAS */}
                        <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-100">
                            <span className="text-xs text-slate-400 font-medium mb-1">Meta Ads</span>
                            <div className="flex items-center gap-1.5">
                                <h5 className={cn("text-xl font-bold", ga.channels.metaAds.roas >= 3 ? "text-amber-500": "text-slate-700")}>{Math.max(ga.channels.metaAds.roas, 0).toFixed(1)}x</h5>
                                {ga.channels.metaAds.roas > 0 && (
                                    <div className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                        <ArrowUpRight className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. BOTTOM: Daily Burn Rate Insight */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Günlük Ort. Harcama</p>
                        <h4 className="text-2xl font-black text-indigo-900">₺{(ga.totalAdCost / daysDiff).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            <ArrowUpRight className="h-3 w-3" />
                            %12 Artış
                        </div>
                        <span className="text-[10px] text-indigo-400 mt-1 font-medium">Geçen aya göre</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
