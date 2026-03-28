import React, { useState, useEffect } from 'react';
import {
    Zap,
    TrendingUp,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Reusing AnimatedCounter for consistent behavior with the rest of the landing page
const AnimatedCounter = ({ value, prefix = '₺', suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let startTimestamp = null;
        const duration = 1000;
        const startValue = displayValue;
        const endValue = value;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (endValue - startValue) * easeProgress);
            setDisplayValue(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    return (
        <span className="tabular-nums tracking-tighter">
            {prefix}{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(displayValue)}{suffix}
        </span>
    );
};

export const HeroPriceSimulator = ({ onAction }) => {
    // Initial State mimicking a realistic product scenario
    const [cost, setCost] = useState(350); // Default Unit Cost
    const [price, setPrice] = useState(550); // Default Selling Price (starts low/avg)

    // Derived Calculations
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    // Visual Logic based on Margin
    let marginStatus = { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", text: "Zarar Riski" };
    if (margin > 30) marginStatus = { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "Mükemmel" };
    else if (margin > 15) marginStatus = { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "İyi Kâr" };
    else if (margin > 0) marginStatus = { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "Düşük Marj" };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700"></div>

            <h3 className="text-xl font-bold text-white mb-6 text-left flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
                Fiyat & Kâr Simülatörü
            </h3>

            <div className="space-y-6 mb-8">

                {/* Cost Input (Semi-Static Context) */}
                <div className="relative group/input opacity-80 hover:opacity-100 transition-opacity">
                    <label className="absolute -top-2.5 left-3 bg-[#0F172A] px-1 text-xs font-bold text-slate-400 transition-colors z-10">
                        Birim Maliyet (Geliş)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(Number(e.target.value))}
                            className="w-full bg-slate-900/30 border border-slate-600 rounded-xl px-4 py-3.5 text-slate-300 font-bold text-lg focus:outline-none focus:border-slate-500 transition-all font-mono placeholder:text-slate-600"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span>
                    </div>
                </div>

                {/* Price Slider (Main Interaction) */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-white">Satış Fiyatı (KDV Dahil)</label>
                        <span className="text-xl text-white font-bold bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30 font-mono">
                            ₺{price}
                        </span>
                    </div>
                    <div className="relative h-6 flex items-center group/slider">
                        <input
                            type="range"
                            min={Math.floor(cost * 0.8)} // Allow going below cost slightly to show loss opacity
                            max={Math.floor(cost * 3)}
                            step="10"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(99,102,241,0.6)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                        />
                    </div>
                </div>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900/80 rounded-xl p-4 mb-6 relative overflow-hidden border border-slate-700/50">
                <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${marginStatus.bg.replace('/10', '/20')}`}></div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Net Kâr (Adet)</p>
                        <div className={`text-2xl font-black tracking-tight ${profit > 0 ? "text-white" : "text-red-400"}`}>
                            <AnimatedCounter value={profit} />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Kâr Marjı</p>
                        <div className={`text-2xl font-black tracking-tight ${marginStatus.color}`}>
                            %{margin.toFixed(1)}
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "mt-3 text-center text-[10px] font-bold py-1 rounded uppercase tracking-wider transition-colors duration-300",
                    marginStatus.bg, marginStatus.color, marginStatus.border, "border"
                )}>
                    {marginStatus.text}
                </div>
            </div>

            <button
                onClick={onAction}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 blur-md"></div>
                <span className="relative z-10">Simülasyonu Başlat</span>
                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform relative z-10" />
            </button>

            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
                14 gün boyunca ücretsiz dene, kârlılığını artır.
            </p>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                        <h4 className="text-amber-300 font-bold text-sm leading-none">Dikkat: Bu Kar Gerçek Değil!</h4>
                        <p className="text-sm leading-normal text-amber-100/90 font-medium">
                            <span className="text-white">Kargo, Komisyon ve Vergiler</span> düşüldüğünde gerçek kârınız bu rakamın çok altında olabilir. <span className="text-white underline decoration-amber-500/50">Gerçeği görmek için FinOps'u deneyin.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
