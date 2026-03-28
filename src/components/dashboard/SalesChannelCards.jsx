import React from 'react';
import { ShoppingBag, Globe, Store, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SalesChannelCards() {
    const channels = [
        {
            id: 1,
            name: "Trendyol",
            icon: ShoppingBag,
            revenue: "₺145,000",
            orders: "410 Sipariş",
            margin: "%18",
            marginClass: "bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10"
        },
        {
            id: 2,
            name: "Hepsiburada",
            icon: ShoppingBag,
            revenue: "₺98,500",
            orders: "285 Sipariş",
            margin: "%14",
            marginClass: "bg-yellow-50 text-yellow-700 border-yellow-100 ring-yellow-500/10"
        },
        {
            id: 3,
            name: "Web Sitem",
            icon: Globe,
            revenue: "₺42,000",
            orders: "55 Sipariş",
            margin: "%28",
            marginClass: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10"
        },
        {
            id: 4,
            name: "Diğer / Toplam",
            icon: MoreHorizontal,
            revenue: "₺12,500",
            orders: "22 Sipariş",
            margin: "%16",
            marginClass: "bg-gray-100 text-gray-600 border-gray-200 ring-gray-500/10"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Store className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Satış Kanalları ve Karlılık</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {channels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                        <div
                            key={channel.id}
                            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-semibold text-slate-700">{channel.name}</span>
                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                                    {channel.revenue}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-xs font-medium text-slate-500">{channel.orders}</span>
                                <div className={cn(
                                    "flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full border ring-1 ring-inset text-[10px] font-bold uppercase",
                                    channel.marginClass
                                )}>
                                    <span>Net Kar:</span>
                                    <span className="text-xs">{channel.margin}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
