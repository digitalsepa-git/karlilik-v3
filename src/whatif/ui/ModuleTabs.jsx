import React from 'react';
import { useWhatifStore } from '../store/whatifStore';
import { cn } from '../../lib/utils';
import { Calculator, Rocket, TrendingUp, Tag, DollarSign, Target } from 'lucide-react';

const MODULES = [
  { id: "reversePricing", label: "Reverse Pricing", icon: Calculator },
  { id: "newProductLaunch", label: "Yeni Ürün", icon: Rocket },
  { id: "priceElasticity", label: "Fiyat Esneklik", icon: TrendingUp },
  { id: "campaign", label: "Kampanya", icon: Tag },
  { id: "costImpact", label: "Maliyet Etkisi", icon: DollarSign },
  { id: "adRoas", label: "Reklam ROAS", icon: Target },
];

export function ModuleTabs() {
  const { activeModule, setActiveModule } = useWhatifStore();
  
  return (
    <div className="flex border-b border-[#EDEDF0] bg-white px-4 pt-2 overflow-x-auto no-scrollbar">
      {MODULES.map(m => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={cn(
              "px-5 py-3.5 flex items-center gap-2.5 border-b-2 transition font-medium whitespace-nowrap text-sm",
              activeModule === m.id
                ? "border-[#514BEE] text-[#514BEE] font-bold"
                : "border-transparent text-[#7D7DA6] hover:text-[#0F1223] hover:border-gray-200"
            )}
          >
            <Icon size={16} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
