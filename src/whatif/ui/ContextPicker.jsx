import React from 'react';
import { useWhatifStore } from '../store/whatifStore';
import { useData } from '../../context/DataContext';
import { SearchableProductSelect } from './components/SearchableProductSelect';

export function ContextPicker() {
  const { selectedProduct, selectedChannel, setProduct, setChannel, loadDefaults } = useWhatifStore();
  const { productsData } = useData();
  const products = productsData?.products || [];
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#FAFAFB] border-b border-[#EDEDF0] z-20 relative">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-sm font-bold text-[#7D7DA6] uppercase tracking-wider">Referans Ürün:</span>
        <SearchableProductSelect 
          products={products}
          value={selectedProduct}
          onChange={setProduct}
        />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-sm font-bold text-[#7D7DA6] uppercase tracking-wider">Kanal:</span>
        <select 
          className="border border-[#EDEDF0] rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-[#514BEE] min-w-[150px] bg-white cursor-pointer"
          value={selectedChannel}
          onChange={e => setChannel(e.target.value)}
        >
          <option value="trendyol">Trendyol</option>
          <option value="ikas">Web Sitesi (İkas)</option>
        </select>
      </div>
      
      <div className="flex-1" />
      
      <button 
        onClick={() => loadDefaults(ordersData?.orders || [])} 
        disabled={!selectedProduct}
        className="text-white bg-[#514BEE] text-sm font-bold hover:bg-[#3d38ca] px-4 py-2.5 rounded-lg transition disabled:opacity-50 disabled:bg-[#B4B4C8] shadow-sm flex items-center gap-2"
      >
        Mevcut Verilerle Doldur
      </button>
    </div>
  );
}
