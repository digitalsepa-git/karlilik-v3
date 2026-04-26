import React from 'react';
import {
    LayoutDashboard,
    Package,
    TrendingDown,
    Swords,
    Calculator,
    BarChart3,
    Wallet,
    Settings,
    Layers,
    Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ activeTab, setActiveTab, isOpen, t }) {
    const MENU_ITEMS = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'products', label: t.products, icon: Package },
        { id: 'inventory', label: t.inventory, icon: TrendingDown },
        { id: 'competition', label: t.competitors, icon: Swords },
        { id: 'whatif', label: 'What-If Simülasyon', icon: Calculator },
        { id: 'reports', label: t.reports, icon: BarChart3 },
        { id: 'expenses', label: t.expenses, icon: Wallet },
    ];

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 transition-transform flex flex-col",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            <div className="flex h-16 items-center border-b border-slate-800 px-6">
                <span className="text-xl font-bold tracking-tight">FinOps</span>
            </div>
            <nav className="space-y-1 px-3 py-4 flex-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 pb-4">
                <button
                    onClick={() => setActiveTab('product-management')}
                    className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                        activeTab === 'product-management'
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <Layers className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                    {t.productManagement}
                </button>
            </div>

            <div className="border-t border-slate-800 pt-4 pb-6 px-4 space-y-1">
                <button
                    onClick={() => setActiveTab('integrations')}
                    className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                        activeTab === 'integrations' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <svg className="w-5 h-5 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
                    Entegrasyonlar
                </button>

                <button
                    onClick={() => setActiveTab('help')}
                    className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                        activeTab === 'help' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <svg className="w-5 h-5 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Yardım Merkezi
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                        activeTab === 'settings' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <Settings className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                    Ayarlar
                </button>
            </div>
        </aside>
    );
}
