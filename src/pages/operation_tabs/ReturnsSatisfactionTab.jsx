import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, AlertStrip, AksiyonMerkezi } from './SharedOperationComponents';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Star, Smile, Frown, Meh, ArrowRight } from 'lucide-react';

const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const ReturnsSatisfactionTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        let totalOrders = 0;
        let returnsCount = 0;
        const reasonsCount = {
            'Beden Uymadı': 0, 'Kusurlu/Hasarlı': 0, 'Beklenti Altı': 0, 
            'Yanlış Ürün': 0, 'Gecikmeli Teslim': 0, 'Vazgeçtim': 0
        };

        const generateMockReturnReason = (o) => {
            const keys = Object.keys(reasonsCount);
            // Determenistic mock reason based on length
            if (o.category?.includes('Kozmetik')) return 'Beklenti Altı';
            if (o.category?.includes('Setler')) return 'Vazgeçtim';
            return keys[o.id.length % keys.length]; 
        };

        orders.forEach(o => {
            if (o.statusObj?.label === 'CANCELLED') return; // Cancel is not return
            totalOrders++;
            if (o.statusObj?.label === 'İade') {
                returnsCount++;
                const reason = generateMockReturnReason(o);
                reasonsCount[reason]++;
            }
        });

        const returnRate = totalOrders > 0 ? (returnsCount / totalOrders) * 100 : 0;

        // Pie Data
        const pieData = Object.keys(reasonsCount)
            .map(k => ({ name: k, value: reasonsCount[k] }))
            .filter(d => d.value > 0)
            .sort((a,b) => b.value - a.value);

        const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#7D7DA6'];
        
        // Mock Rating Distribution
        const ratingDist = [
            { star: '5 Yıldız', count: Math.floor(totalOrders * 0.45) },
            { star: '4 Yıldız', count: Math.floor(totalOrders * 0.25) },
            { star: '3 Yıldız', count: Math.floor(totalOrders * 0.15) },
            { star: '2 Yıldız', count: Math.floor(totalOrders * 0.08) },
            { star: '1 Yıldız', count: Math.floor(totalOrders * 0.07) }
        ];

        let totalRatingPoints = 0, ratedCount = 0;
        ratingDist.forEach((d, i) => {
            totalRatingPoints += d.count * (5 - i);
            ratedCount += d.count;
        });
        const avgRating = ratedCount > 0 ? (totalRatingPoints / ratedCount) : 0;

        // Action Rules
        const actions = [];
        if (returnRate > 10) {
            actions.push({ priority: 'acil', title: `Yüksek İade Oranı: ${pct(returnRate)}`, desc: 'Genel iade oranınız sektör benchmarkının (%5) oldukça üzerinde seyrediyor. Özellikle Beden/Kusur analizi yapılmalı.', cta: 'Kök Neden İncele' });
        }
        if (Object.keys(reasonsCount).find(k => reasonsCount[k] > returnsCount * 0.4)) {
            const worstReason = Object.keys(reasonsCount).reduce((a, b) => reasonsCount[a] > reasonsCount[b] ? a : b);
            actions.push({ priority: 'önemli', title: `Baskın İade Sebebi: ${worstReason}`, desc: `İadelerin %${((reasonsCount[worstReason] / returnsCount)*100).toFixed(0)} kısmı aynı sebepten ( ${worstReason} ) kaynaklanıyor. Açıklama veya Kalite Kontrol hatası olabilir.`, cta: 'Ürünleri Filtrele' });
        }

        const mockAlerts = actions.filter(a => a.priority === 'acil').map(a => ({ message: a.title })).slice(0, 3);

        return { totalOrders, returnsCount, returnRate, avgRating, pieData, COLORS, ratingDist, actions, mockAlerts };
    }, [orders]);

    if (!metrics) return <EmptyState title="İade Verisi Yok" />;

    const { totalOrders, returnsCount, returnRate, avgRating, pieData, COLORS, ratingDist, actions, mockAlerts } = metrics;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-1">{payload[0].name}</p>
                    <p>Adet: <span className="font-bold">{payload[0].value}</span></p>
                    <p>Payı: <span className="font-bold">{pct((payload[0].value/returnsCount)*100)}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            <AlertStrip alerts={mockAlerts} />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam İade Oranı" value={pct(returnRate)} delta="Sipariş vs İade" tone={returnRate > 5 ? "negative" : "positive"} />
                <KpiCard title="Ortalama Müşteri Puanı" value={`★ ${avgRating.toFixed(1)}`} delta="Hedef ≥ 4.5" tone={avgRating >= 4.5 ? "positive" : "warning"} />
                <KpiCard title="Toplam İade İşlemi" value={returnsCount} delta="Son 30 gün" tone="neutral" />
                <KpiCard title="Çözüm Bekleyen İadeler" value="8 Adet" delta=">72 saat olan: 2" tone="warning" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartCard 
                    title="İade Sebepleri Dağılımı (Dinamik Etiketler)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip/>} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#EF4444]">{returnsCount}</text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#7D7DA6]">İade</text>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Müşteri Rating Dağılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDist} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="star" type="category" tick={{ fontSize: 11, fill: '#0F1223', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val) => [`${val} Yorum`, 'Adet']} cursor={{fill: '#FAFAFB'}} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                    {ratingDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 2 ? '#10B981' : index === 2 ? '#F59E0B' : '#EF4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* SENTIMENT BÖLÜMÜ */}
            <div className="bg-white border rounded-xl overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 md:w-1/3 bg-[#FAFAFB] border-r border-[#EDEDF0] flex flex-col justify-center">
                    <h3 className="font-bold text-[#0F1223] mb-2 text-lg">Sentiment Analizi</h3>
                    <p className="text-sm text-[#7D7DA6] leading-relaxed mb-6">Müşterilerinizin bıraktığı organik yorumlardan AI destekli çıkarılan genel duygu durumu.</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Smile size={28} className="text-emerald-500" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-emerald-700">Pozitif</span><span>%64</span></div>
                                <div className="h-2 rounded-full border overflow-hidden"><div className="h-full bg-emerald-500 w-[64%]"></div></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Meh size={28} className="text-amber-500" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-amber-700">Nötr</span><span>%22</span></div>
                                <div className="h-2 rounded-full border overflow-hidden"><div className="h-full bg-amber-500 w-[22%]"></div></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Frown size={28} className="text-red-500" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-red-700">Negatif</span><span>%14</span></div>
                                <div className="h-2 rounded-full border overflow-hidden"><div className="h-full bg-red-500 w-[14%]"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-[#0F1223] mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> En Sık Negatif Kelimeler</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Beden uymadı', 'Geç kargo', 'Kırık geldi', 'Kötü paketleme', 'Beklediğim gibi değil'].map(w => (
                                    <span key={w} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-100">{w}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F1223] mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> En Sık Pozitif Kelimeler</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Çok hızlı', 'Harika kalite', 'Beklediğimden iyi', 'Teşekkürler', 'Sağlam paket', 'Yanında hediye'].map(w => (
                                    <span key={w} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">{w}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AksiyonMerkezi actions={actions} />

        </div>
    );
};
