import React from 'react';
import { formatValue } from '../../utils/format';
import { AlertCircle } from 'lucide-react';

export function BreakEvenIndicator({ price }) {
  if (price === undefined || price === null || isNaN(price)) return null;

  return (
    <div className="mt-6 flex items-center gap-3 p-4 bg-[#FAFAFB] border border-[#EDEDF0] rounded-xl">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 shrink-0">
        <AlertCircle size={20} />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#7D7DA6]">Başabaş Noktası (Break-Even)</div>
        <div className="text-sm font-medium text-[#0F1223] mt-0.5">
          Bu ürün için zararına satış noktası: <span className="font-bold">{formatValue(price, "currency")}</span>. Bu fiyatın altına inmeniz durumunda her satışta zarar edersiniz.
        </div>
      </div>
    </div>
  );
}
