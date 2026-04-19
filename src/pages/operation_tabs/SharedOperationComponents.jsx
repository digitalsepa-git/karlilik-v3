import React from 'react';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from '../financial_tabs/SharedFinComponents';
import { ChannelBadge, CHANNEL_COLORS } from '../ticari_tabs/SharedTicariComponents';
import { cn } from '../../lib/utils';
import { AlertTriangle, Map, Bell, ArrowRight, Plug, CheckCircle2, ChevronRight, CheckCircle } from 'lucide-react';

export { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, ChannelBadge, CHANNEL_COLORS, cn };

export const AlertStrip = ({ alerts = [] }) => {
    if (!alerts || alerts.length === 0) return null;
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500" />
                <span className="font-bold text-red-700 text-sm">{alerts.length} Kritik Uyarı:</span>
                <div className="flex items-center gap-4">
                    {alerts.slice(0, 3).map((a, i) => (
                        <div key={i} className="text-xs text-red-600 bg-white px-2 py-1 rounded shadow-sm border border-red-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {a.message}
                        </div>
                    ))}
                    {alerts.length > 3 && <span className="text-xs text-red-500 font-medium">+{alerts.length - 3} daha</span>}
                </div>
            </div>
            <button className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                Aksiyon Merkezi <ArrowRight size={14} />
            </button>
        </div>
    );
};

export const AksiyonMerkezi = ({ actions = [] }) => {
    if (!actions || actions.length === 0) {
        return (
            <div className="bg-white border border-[#EDEDF0] rounded-xl p-6">
                <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 size={24} />
                    <div>
                        <h3 className="font-bold text-[#0F1223]">Aksiyon Merkezi</h3>
                        <p className="text-sm text-emerald-600 font-medium mt-0.5">Şu an aksiyon gerektiren operasyonel bir durum yok ✓</p>
                    </div>
                </div>
            </div>
        );
    }

    const aciller = actions.filter(a => a.priority === 'acil');
    const onemliler = actions.filter(a => a.priority === 'önemli');
    const oneriler = actions.filter(a => a.priority === 'öneri');

    return (
        <div className="bg-white border border-[#EDEDF0] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#EDEDF0] flex items-center justify-between bg-[#FAFAFB]">
                <h3 className="font-bold text-[#0F1223] flex items-center gap-2">
                    <TargetIcon /> Aksiyon Merkezi
                </h3>
                <div className="flex gap-4 text-xs font-bold">
                    {aciller.length > 0 && <span className="text-red-500">{aciller.length} Acil</span>}
                    {onemliler.length > 0 && <span className="text-amber-500">{onemliler.length} Önemli</span>}
                    {oneriler.length > 0 && <span className="text-blue-500">{oneriler.length} Öneri</span>}
                </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.slice(0, 5).map((action, i) => (
                    <div key={i} className={cn("p-4 rounded-xl border relative overflow-hidden", 
                        action.priority === 'acil' ? 'bg-red-50 border-red-100' : 
                        action.priority === 'önemli' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                    )}>
                        <h4 className={cn("font-bold text-sm flex items-center gap-1.5 mb-2", 
                            action.priority === 'acil' ? 'text-red-700' : 
                            action.priority === 'önemli' ? 'text-amber-700' : 'text-blue-700'
                        )}>
                            {action.priority === 'acil' && '🔴'}
                            {action.priority === 'önemli' && '🟡'}
                            {action.priority === 'öneri' && '🔵'}
                            {action.title}
                        </h4>
                        <p className={cn("text-xs leading-relaxed mb-4", 
                            action.priority === 'acil' ? 'text-red-600' : 
                            action.priority === 'önemli' ? 'text-amber-600' : 'text-blue-600'
                        )}>
                            {action.desc}
                        </p>
                        <div className="flex items-center gap-2">
                            <button className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors", 
                                action.priority === 'acil' ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200' : 
                                action.priority === 'önemli' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200' : 
                                'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
                            )}>
                                {action.cta}
                            </button>
                            <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors">
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {actions.length > 5 && (
                <div className="p-3 border-t border-[#EDEDF0] text-center">
                    <button className="text-xs font-bold text-[#514BEE] hover:text-[#0F1223] transition-colors">
                        Tüm aksiyonları göster ({actions.length}) →
                    </button>
                </div>
            )}
        </div>
    );
};

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

export const IntegrationMissingEmptyState = ({ integrationName, docsUrl }) => (
    <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#EDEDF0]">
        <div className="w-16 h-16 rounded-lg bg-[#FAFAFB] border border-[#EDEDF0] shadow-sm flex items-center justify-center mb-4 text-[#514BEE]">
            <Plug size={32} />
        </div>
        <h3 className="text-lg font-bold text-[#0F1223] mb-2">{integrationName} Entegrasyonu Bekleniyor</h3>
        <p className="text-[#7D7DA6] max-w-md mx-auto text-sm leading-relaxed mb-6">
            Bu operasyon raporunun çalışabilmesi için <strong>{integrationName}</strong> sisteminizin API üzerinden bağlı olması gerekmektedir. Entegrasyon sağlandıktan sonra veriler otomatik akacaktır.
        </p>
        <button className="px-5 py-2.5 bg-[#514BEE] text-white rounded-lg text-[13px] font-bold hover:bg-[#4338CA] transition-colors flex items-center gap-2">
            Entegrasyonu Bağla <ChevronRight size={16} />
        </button>
    </div>
);

export const StatusDot = ({ status, label }) => {
    const colors = {
        'out_of_stock': 'bg-red-500',
        'critical': 'bg-orange-500',
        'low': 'bg-amber-500',
        'healthy': 'bg-emerald-500',
        'overstock': 'bg-blue-500',
        'dead': 'bg-gray-400'
    };
    return (
        <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", colors[status] || 'bg-gray-300')} />
            {label && <span className="text-xs text-[#0F1223] font-medium">{label}</span>}
        </div>
    );
};
