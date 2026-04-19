import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedFinComponents';
import { Treemap, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronRight, AlertCircle, ShoppingCart } from 'lucide-react';
import { expensesData, calculateDailyExpense } from '../../data/expensesData';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const ExpensesTab = () => {
    const { ordersData, globalDateRange } = useData();
    const { orders } = ordersData;

    // Filter Logic
    const { start: dateStart, end: dateEnd } = useMemo(() => {
        return { 
            start: new Date(globalDateRange.startDate + 'T00:00:00Z'), 
            end: new Date(globalDateRange.endDate + 'T23:59:59.999Z') 
        };
    }, [globalDateRange]);

    const _diffDays = Math.max(1, Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate dynamic expenses based on real orders + expensesData rules
    const metrics = useMemo(() => {
        let totalNetCiro = 0;
        if (orders) {
            orders.forEach(o => {
                if (o.statusObj?.label !== 'İade' && o.statusObj?.label !== 'CANCELLED') {
                    totalNetCiro += (o.revenue || 0);
                }
            });
        }

        let catMap = {};
        let totalExpenses = 0;
        let totalFixed = 0;

        expensesData.forEach(ex => {
            if (ex.valueType === 'amount') {
                const amt = calculateDailyExpense(ex) * _diffDays;
                if (!catMap[ex.category]) catMap[ex.category] = { name: ex.category, value: 0 };
                catMap[ex.category].value += amt;
                totalExpenses += amt;
                if (ex.category === 'opex' || ex.category === 'capex') totalFixed += amt; // Simplified mapping
            }
        });

        // Add dummy variable marketing expenses
        const adEx = totalNetCiro * 0.12; 
        if (!catMap['marketing']) catMap['marketing'] = { name: 'Pazarlama', value: 0 };
        catMap['marketing'].value += adEx;
        totalExpenses += adEx;

        const fixedPct = totalExpenses > 0 ? (totalFixed / totalExpenses) * 100 : 0;
        const opexToCiro = totalNetCiro > 0 ? (totalExpenses / totalNetCiro) * 100 : 0;

        return { totalExpenses, fixedPct, opexToCiro, totalNetCiro, catMap: Object.values(catMap) };
    }, [orders, _diffDays]);

    const hasAnyData = expensesData.length > 0;

    if (!hasAnyData) return <EmptyState title="Gider Analizi Verisi Yok" message="Gider raporları için henüz hiç masraf kaydı eklenmemiş." />;

    // Charts Data
    const treemapData = metrics.catMap.map(c => ({
        name: c.name.toUpperCase(),
        size: c.value,
        color: c.name === 'opex' ? '#60A5FA' : (c.name === 'tax' ? '#F87171' : '#FBBF24')
    }));

    const CustomTreemapContent = (props) => {
        const { root, depth, x, y, width, height, index, payload, colors, rank, name, size } = props;
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} style={{ fill: depth < 2 ? '#514BEE' : '#8B5CF6', stroke: '#fff', strokeWidth: 2, fillOpacity: 0.8 }} />
            {width > 50 && height > 30 && (
              <text x={x + 8} y={y + 18} fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
            )}
            {width > 50 && height > 45 && (
              <text x={x + 8} y={y + 32} fill="#fff" fontSize={10}>{fmt(size)}</text>
            )}
          </g>
        );
    };

    const budgetBarData = [
        { name: 'Opex', bütçe: 100000, gerçekleşen: metrics.catMap.find(c=>c.name==='opex')?.value || 0 },
        { name: 'Pazarlama', bütçe: 150000, gerçekleşen: metrics.catMap.find(c=>c.name==='Pazarlama')?.value || 0 },
        { name: 'Finans', bütçe: 20000, gerçekleşen: metrics.catMap.find(c=>c.name==='finance')?.value || 0 }
    ];

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Toplam Gider (Bu Dönem)" 
                    value={fmt(metrics.totalExpenses)} 
                    delta="+ %4.2" 
                    tone="negative" 
                    tooltip="Seçili tarih aralığında gerçekleşen Sabit (Kira, Personel vb.) ve Değişken (Pazarlama, Komisyon vb.) tüm işletme giderlerinizin kümülatif toplamıdır. Şirketinizin kanama/para yakma (burn rate) performansını temsil eder."
                />
                <KpiCard 
                    title="Sabit / Değişken Oranı" 
                    value={`%${metrics.fixedPct.toFixed(1)} / %${(100 - metrics.fixedPct).toFixed(1)}`} 
                    tooltip="Giderlerinizin ne kadarının kemikleşmiş Sabit Gider (OPEX, CAPEX), ne kadarının ise satışa/eyleme duyarlı Değişken Gider (örn. Reklam, Kargo) olduğunu gösterir. Sabit oranının çok yüksek olması kriz anlarında manevra kabiliyetinizi zayıflatır."
                />
                <KpiCard 
                    title="Bütçe Kullanımı" 
                    value="% 84.5" 
                    delta="- %2" 
                    tone="positive" 
                    tooltip="Departmanlar bazında ayrılan toplam masraf bütçenizin bu dönemde ne kadarının harcandığını gösterir. Yüzdenin %100'e yaklaşması bütçenin sonuna geldiğinizi, aşması ise limit aşımı (over-budget) yaşadığınızı uyarır."
                />
                <KpiCard 
                    title="Opex / Net Ciro" 
                    value={`%${metrics.opexToCiro.toFixed(1)}`} 
                    delta="+ 1.2 pp" 
                    tone="warning" 
                    tooltip="Operasyonel (Sabit) Giderlerinizin, kazandığınız Net Ciroya olan oranıdır. Bu oran ne kadar düşükse şirket o kadar operasyonel verimlilikle çalışıyor demektir. (Örn: Kazandığınız her 100 TL'nin kaç TL'si sistemi ayakta tutmak için yakılıyor?)"
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[320px]">
                <ChartCard 
                    title="Gider Kategorileri Dağılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap data={treemapData} dataKey="size" ratio={4 / 3} stroke="#fff" content={<CustomTreemapContent />} />
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Bütçe vs Gerçekleşen"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetBarData} layout="vertical" margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <XAxis type="number" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 500 }} />
                                <Tooltip formatter={(value) => fmt(value)} />
                                <Bar dataKey="bütçe" fill="#EDEDF0" barSize={12} radius={[0,2,2,0]} />
                                <Bar dataKey="gerçekleşen" fill="#514BEE" barSize={12} radius={[0,2,2,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <TableCard
                title="Kategori Bazlı Gider Detayları"
                columns={[
                    { key: 'cat', label: 'Kategori', align: 'left' },
                    { key: 'count', label: 'İşlem Sayısı', align: 'left' },
                    { key: 'cur', label: 'Bu Dönem', align: 'right' },
                    { key: 'prev', label: 'Önceki Dönem', align: 'right' },
                    { key: 'budget', label: 'Bütçe', align: 'right' },
                    { key: 'usage', label: 'Kullanım %', align: 'left' }
                ]}
                rows={[
                    { cat: <span className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Operasyon (OPEX)</span>, count: 14, cur: fmt(metrics.catMap.find(c=>c.name==='opex')?.value), prev: fmt(85000), budget: fmt(100000), usage: <div className="w-full bg-[#EDEDF0] h-1.5 rounded-full mt-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '90%'}}/></div> },
                    { cat: <span className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"/> Pazarlama</span>, count: 5, cur: fmt(metrics.catMap.find(c=>c.name==='Pazarlama')?.value), prev: fmt(120000), budget: fmt(150000), usage: <div className="w-full bg-[#EDEDF0] h-1.5 rounded-full mt-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{width: '65%'}}/></div> },
                    { cat: <span className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"/> Vergi & Yükümlülükler</span>, count: 3, cur: fmt(metrics.catMap.find(c=>c.name==='tax')?.value), prev: fmt(45000), budget: '—', usage: '—' },
                ]}
            />

            {/* INSIGHTS */}
            <div className="bg-white border-2 border-red-100 rounded-xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(239,68,68,0.05)]">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} className="fill-red-100" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F1223] mb-1">Dikkat: Anomali Tespit Edildi</h3>
                            <p className="text-xs text-[#7D7DA6] max-w-lg leading-relaxed"><strong className="text-red-500 font-semibold">[Pazarlama]</strong> gideri, son 3 ayın ortalamasının <strong>%42</strong> üzerinde. Son 3 ayda ortalama ₺ 110.000 iken bu ay hızlı bir ivmelenme kaydedildi.</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-4 py-2 rounded-lg flex items-center gap-1">
                        Detayı İncele <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="trend" title="Personel Gideri Artışı" body="Son düzenlemeler sonucu maaş/SGK giderlerinde kalıcı bir baz artışı görüldü. Opex oranı %2 arttı." />
                <InsightCard type="suggestion" title="SaaS Optimizasyonu" body="Kullanılmayan 3 abonelik tespit edildi. İptal edilmesi aylık ₺ 1.450 tasarruf sağlar." />
            </div>

        </div>
    );
};
