import React from 'react';
import { useWhatifStore } from '../store/whatifStore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

export function ScenarioListSidebar({ className }) {
  const { savedScenarios, loadScenario, deleteScenario } = useWhatifStore();
  
  return (
    <aside className={`p-5 flex flex-col bg-[#FAFAFB] ${className}`}>
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
      
      <div className="mt-8">
        <h3 className="font-bold text-[#0F1223] mb-4 text-sm uppercase tracking-wider">Hazır Şablonlar</h3>
        <div className="text-xs text-[#7D7DA6] bg-white border border-[#EDEDF0] p-3 rounded-xl">
          Şablon galerisi bir sonraki fazda eklenecektir.
        </div>
      </div>
    </aside>
  );
}
