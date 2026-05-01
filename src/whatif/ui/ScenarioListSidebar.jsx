import React, { useState, useEffect, useMemo } from 'react';
import { useWhatifStore } from '../store/whatifStore';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ScenarioListSidebar({ className }) {
  const { savedScenarios, loadScenario, deleteScenario, selectedProduct, isContextApplied } = useWhatifStore();
  const { ordersData } = useData();

  const sales30Days = useMemo(() => {
     if (!selectedProduct || !ordersData?.orders) return 0;
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
     let count = 0;
     ordersData.orders.forEach(order => {
       const orderDate = new Date(order.createdAt || order.createdAtDate);
       if (orderDate >= thirtyDaysAgo && order.status !== 'CANCELLED') {
         order.lines?.forEach(line => {
           if (line.productId === selectedProduct.id) {
             count += (line.quantity || 1);
           }
         });
       }
     });
     return count;
  }, [selectedProduct, ordersData]);

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
  
  return (
    <aside className={`p-5 flex flex-col bg-[#FAFAFB] ${className}`}>
      {selectedProduct && isContextApplied && selectedProduct.price > 0 && (
        <div className="mb-6 bg-white border border-[#EDEDF0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-gradient-to-b from-[#FAFAFB] to-white border-b border-[#EDEDF0] flex flex-col items-center text-center gap-3">
             {selectedProduct.image ? (
               <img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 rounded-xl object-cover border border-[#EDEDF0] shadow-sm bg-white shrink-0" />
             ) : (
               <div className="w-20 h-20 rounded-xl bg-white border border-[#EDEDF0] shadow-sm flex items-center justify-center text-sm text-[#514BEE] font-bold shrink-0">Yok</div>
             )}
             <div className="flex flex-col flex-1 min-w-0 w-full px-2">
               <span className="font-bold text-[#0F1223] text-sm leading-snug line-clamp-2" title={selectedProduct.name}>{selectedProduct.name}</span>
               
               <div className="flex items-center justify-center gap-2 mt-2">
                 {selectedProduct.variantName && (
                    <span className="text-[10px] font-bold text-[#514BEE] bg-[#514BEE]/10 px-2 py-0.5 rounded-md">{selectedProduct.variantName}</span>
                 )}
                 <span className="text-[10px] font-medium text-[#7D7DA6] bg-gray-100 px-2 py-0.5 rounded-md">SKU: {selectedProduct.sku}</span>
               </div>
             </div>
          </div>
          
          <div className="px-5 py-4 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="text-sm text-[#7D7DA6]">Mevcut fiyat</span>
                <span className="text-sm font-medium text-[#0F1223]">₺{selectedProduct.price.toLocaleString("tr-TR")}</span>
             </div>
             
             <div className="flex items-center justify-between">
                <span className="text-sm text-[#7D7DA6]">En düşük rakip</span>
                <span className="text-sm font-medium text-[#514BEE]">
                  {lowestCompPrice ? `₺${lowestCompPrice.toLocaleString("tr-TR")}` : "Yok"}
                </span>
             </div>

             <div className="flex items-center justify-between">
                <span className="text-sm text-[#7D7DA6]">Stok durumu</span>
                <span className={cn("text-sm font-medium", selectedProduct.stock > 0 ? "text-[#0F1223]" : "text-red-500")}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} Adet` : "Tükendi"}
                </span>
             </div>

             <div className="flex items-center justify-between">
                <span className="text-sm text-[#7D7DA6]">30 günlük satış</span>
                <span className="text-sm font-medium text-emerald-600">
                  {sales30Days} Adet
                </span>
             </div>
          </div>
        </div>
      )}
      
      <h3 className="font-bold text-[#0F1223] mb-4 text-sm uppercase tracking-wider">Kayıtlı Senaryolar</h3>
      
      {savedScenarios.length === 0 && (
        <div className="text-sm text-[#7D7DA6] bg-white border border-[#EDEDF0] p-4 rounded-xl text-center">
          Henüz senaryo kaydetmediniz. Sağ alttaki kaydet butonunu kullanın.
        </div>
      )}
      
      <ul className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
        {savedScenarios.map(s => (
          <li 
            key={s.id} 
            className="bg-white border border-[#EDEDF0] rounded-xl p-4 hover:border-[#514BEE] hover:shadow-sm transition cursor-pointer group" 
            onClick={() => loadScenario(s.id)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-bold text-[#0F1223] text-sm leading-tight">{s.name}</div>
              <button 
                onClick={e => { e.stopPropagation(); deleteScenario(s.id); }} 
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="text-xs font-medium text-[#7D7DA6]">
              {s.module} · {format(new Date(s.createdAt), "dd MMM HH:mm", { locale: tr })}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
