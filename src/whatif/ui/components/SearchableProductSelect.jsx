import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import productCosts from '../../../data/productCosts.json';

export function SearchableProductSelect({ products, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.variants?.[0]?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSelect = (p) => {
    // Map product data to whatif format
    const variant = p.variants?.[0];
    const sku = variant?.sku || "DEFAULT";
    const price = variant?.prices?.[0]?.sellPrice || p.price || 0;
    const costData = productCosts[sku] || productCosts["DEFAULT"] || { cogs: 360, shipping: 45 };
    const cost = costData.cogs + costData.shipping;
    const image = p.image || p.img || (p.images && p.images[0] ? (p.images[0].url || p.images[0]) : null);
    const stock = variant?.stockQuantity ?? p.stockQuantity ?? 0;
    const variantName = variant?.variantValue ?? variant?.name ?? null;

    onChange({
      id: p.id,
      name: p.name,
      price: price,
      cost: cost,
      sku: sku,
      image: image,
      stock: stock,
      variantName: variantName
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedProductTitle = value ? value.name : "Katalogdan ürün seçiniz...";

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-[400px]">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between border rounded-lg p-2.5 text-sm font-medium cursor-pointer transition-all bg-white",
          isOpen ? "border-[#514BEE] ring-2 ring-[#514BEE]/20" : "border-[#EDEDF0] hover:border-[#B4B4C8]"
        )}
      >
        <div className="truncate text-[#0F1223] pr-4">
          {selectedProductTitle}
        </div>
        <ChevronDown size={16} className={cn("text-[#7D7DA6] transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-[#EDEDF0] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[360px]">
          <div className="p-2 border-b border-[#EDEDF0] bg-[#FAFAFB]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7DA6]" />
              <input 
                type="text" 
                placeholder="Ürün adı veya SKU ile ara..." 
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EDEDF0] rounded-lg focus:outline-none focus:border-[#514BEE]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto p-1 no-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#7D7DA6]">
                Eşleşen ürün bulunamadı.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const sku = p.variants?.[0]?.sku || "-";
                const isSelected = value?.id === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm",
                      isSelected ? "bg-[#F3F1FF] text-[#514BEE]" : "hover:bg-[#FAFAFB] text-[#0F1223]"
                    )}
                  >
                    <div className="flex-1 truncate pr-4">
                      <div className={cn("font-medium truncate", isSelected ? "text-[#514BEE]" : "text-[#0F1223]")}>
                        {p.name}
                      </div>
                      <div className="text-xs text-[#7D7DA6] mt-0.5">
                        SKU: {sku}
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-[#514BEE] shrink-0" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
