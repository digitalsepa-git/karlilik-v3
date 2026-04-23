import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, ChannelBadge, SEGMENT_COLORS, SEGMENT_LABELS, InsufficientDataEmptyState } from './SharedCustomerComponents';
import { PieChart, Pie, Cell, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { Target, Users, Search, Filter } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const RfmTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const customerMap = {};
        const today = new Date();

        orders.forEach(o => {
            if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') return;
            if (!o.customerId) return; // Skip totally anonymous orders for RFM
            
            const cId = o.customerId;
            const cName = o.customerObj?.name || 'Anonim Müşteri';

            if (!customerMap[cId]) {
                customerMap[cId] = {
                    id: cId,
                    name: cName,
                    orders: 0,
                    revenue: 0,
                    lastOrderDate: new Date('2000-01-01'),
                    firstOrderDate: new Date('2099-01-01'),
                    channel: o.channel
                };
            }

            const d = new Date(o.dateRaw || o.date);
            customerMap[cId].orders++;
            customerMap[cId].revenue += (o.revenue || 0);
            if (d > customerMap[cId].lastOrderDate) customerMap[cId].lastOrderDate = d;
            if (d < customerMap[cId].firstOrderDate) customerMap[cId].firstOrderDate = d;
        });

        const rfmData = Object.values(customerMap).map(c => {
            const recency = Math.floor((today - c.lastOrderDate) / (1000 * 60 * 60 * 24));
            return { ...c, recency, frequency: c.orders, monetary: c.revenue };
        });

        if (rfmData.length < 10) return { insufficient: true, rfmData }; // Needs at least some data

        // Sort and quintile
        const sortAndScore = (arr, key, reverse = false) => {
            const sorted = [...arr].sort((a, b) => a[key] - b[key]);
            if (reverse) sorted.reverse();
            const chunk = Math.ceil(sorted.length / 5);
            const scores = {};
            sorted.forEach((item, i) => {
                scores[item.id] = Math.min(5, Math.floor(i / chunk) + 1);
            });
            return scores;
        };

        const rScores = sortAndScore(rfmData, 'recency', true); // lower recency = higher score
        const fScores = sortAndScore(rfmData, 'frequency');
        const mScores = sortAndScore(rfmData, 'monetary');

        let champCount = 0, riskCount = 0, totalScore = 0;
        let totalCiro = 0;

        const segmented = rfmData.map(c => {
            const r = rScores[c.id], f = fScores[c.id], m = mScores[c.id];
            totalScore += (r + f + m) / 3;
            totalCiro += c.monetary;

            let segmentKey = 'lost';
            if (r >= 4 && f >= 4 && m >= 4) segmentKey = 'champion';
            else if (r >= 3 && f >= 4) segmentKey = 'loyal';
            else if (r >= 3 && f <= 3) segmentKey = 'potentialLoyal';
            else if (r >= 4 && f === 1) segmentKey = 'newCustomer';
            else if (r >= 3 && f <= 3) segmentKey = 'promising';
            else if (r >= 2 && f >= 2) segmentKey = 'needAttention';
            else if (r >= 2 && f <= 2) segmentKey = 'aboutToSleep';
            else if (r <= 2 && f >= 2) segmentKey = 'atRisk';
            else if (r <= 2 && f >= 4) segmentKey = 'cantLoseThem';
            else if (r <= 2 && f <= 2) segmentKey = 'hibernating';
            
            if (segmentKey === 'champion') champCount++;
            if (segmentKey === 'atRisk' || segmentKey === 'cantLoseThem') riskCount++;

            return { ...c, rScore: r, fScore: f, mScore: m, segment: segmentKey };
        });

        // Group by segment
        const segGroup = {};
        Object.keys(SEGMENT_LABELS).forEach(k => segGroup[k] = { count: 0, ciro: 0 });
        segmented.forEach(c => {
            if (segGroup[c.segment]) {
                segGroup[c.segment].count++;
                segGroup[c.segment].ciro += c.monetary;
            }
        });

        const pieData = Object.keys(segGroup).filter(k => segGroup[k].count > 0).map(k => ({
            name: SEGMENT_LABELS[k],
            value: segGroup[k].count,
            ciro: segGroup[k].ciro,
            color: SEGMENT_COLORS[k]
        }));

        const barData = Object.keys(segGroup).filter(k => segGroup[k].count > 0).map(k => ({
            name: SEGMENT_LABELS[k],
            MüşteriPayı: segmented.length > 0 ? (segGroup[k].count / segmented.length) * 100 : 0,
            CiroPayı: totalCiro > 0 ? (segGroup[k].ciro / totalCiro) * 100 : 0,
            color: SEGMENT_COLORS[k]
        }));

        return { 
            segmented, 
            pieData, 
            barData,
            champCount, 
            riskCount, 
            avgScore: segmented.length > 0 ? (totalScore / segmented.length) : 0,
            totalCiro
        };
    }, [orders]);

    if (!metrics) return <EmptyState title="Veri Bulunamadı" />;
    if (metrics.insufficient) return <InsufficientDataEmptyState featureName="RFM Algoritması" required={50} available={metrics.rfmData.length} />;

    const { segmented, pieData, barData, champCount, riskCount, avgScore, totalCiro } = metrics;
    const sortedSegments = [...barData].sort((a,b) => b.CiroPayı - a.CiroPayı);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-1" style={{color: data.color}}>{data.name}</p>
                    <p>Müşteri Sayısı: <span className="font-bold">{data.value}</span></p>
                    <p>Toplam Ciro: <span className="font-bold">{fmt(data.ciro)}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Toplam İşlenen Müşteri" 
                    value={segmented.length} 
                    delta="Tekil Alıcı" 
                    tone="neutral" 
                    tooltip="Veri kaynağındaki siparişlerin ayrıştırılmasıyla elde edilen, RFM algoritmasına tabi tutulmuş benzersiz (tekil) müşteri sayısı." 
                />
                <KpiCard 
                    title="Champion & Loyal Sayısı" 
                    value={champCount} 
                    delta={pct(champCount / segmented.length)} 
                    tone="positive" 
                    tooltip="Son zamanlarda alışveriş yapmış, sık satın alan ve yüksek ciro bırakan en kazançlı ve sadık müşteri segmentleriniz." 
                />
                <KpiCard 
                    title="Risk Altındaki Değerliler" 
                    value={riskCount} 
                    delta="At Risk / Can't Lose Them" 
                    tone={riskCount > 20 ? "negative" : "warning"} 
                    tooltip="Geçmişte sık ve yüklü alışveriş yapmış ancak normal alım döngüsünü aşmış (uzun süredir sepet oluşturmamış) ve acil reaktivasyon isteyen müşteriler." 
                />
                <KpiCard 
                    title="Ortalama RFM Skoru" 
                    value={avgScore.toFixed(1)} 
                    delta="x / 5" 
                    tone="positive" 
                    tooltip="Tüm müşterilerinizin Recency (Yenilik), Frequency (Sıklık) ve Monetary (Ciro) quintile (beşli öbek) puanlarının elde edilen genel ortalaması." 
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartCard 
                    title="Müşteri Segment Dağılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#0F1223]">{segmented.length}</text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#7D7DA6]">Aktif</text>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Segmentlerin Ciro ve Müşteri Payları (%)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedSegments} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#0F1223', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val) => pct(val)} cursor={{ fill: '#F4F4F8' }} />
                                <Bar dataKey="MüşteriPayı" fill="#E0DDFF" radius={[0,2,2,0]} barSize={10} />
                                <Bar dataKey="CiroPayı" fill={C.primary} radius={[0,2,2,0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </div>


            {/* SEGMENT SÖZLÜĞÜ */}
            <div className="bg-white p-6 rounded-xl border border-[#EDEDF0]">
                <h3 className="text-[14px] font-bold text-[#0F1223] mb-4">RFM Segmentasyon Terminolojisi (Sözlük)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[
                        { k: 'champion', t: 'Çok yeni, çok sık, çok kazançlı sipariş döngüsü.', n: 'Champion' },
                        { k: 'loyal', t: 'Frekansı yüksek, sizi sürekli tercih eden kitle.', n: 'Loyal' },
                        { k: 'potentialLoyal', t: 'Düzenli alışverişleriyle gelişmeye açık olanlar.', n: 'Potential Loyalist' },
                        { k: 'newCustomer', t: 'Yakın zamanda ilk siparişini vermiş müşteriler.', n: 'New Customer' },
                        { k: 'promising', t: 'Frekansı yeni oturan ve sadakat potansiyeli olanlar.', n: 'Promising' },
                        { k: 'needAttention', t: 'Ortalama seviyede ancak eski sıklığını kaybedenler.', n: 'Need Attention' },
                        { k: 'aboutToSleep', t: 'Azalan frekans ile sizi unutmaya başlayan kullanıcılar.', n: 'About To Sleep' },
                        { k: 'atRisk', t: 'Eskiden çok alışveriş yapıp uzaklaşan önemli kitle.', n: 'At Risk' },
                        { k: 'cantLoseThem', t: 'En değerlilerinizdi, uzun süredir yoklar. Acil kampanya şart.', n: 'Can\'t Lose Them' },
                        { k: 'hibernating', t: 'Kış uykusuna yatmış, düşük frekanslı uzak müşteriler.', n: 'Hibernating' },
                    ].map(s => (
                        <div key={s.k} className="flex gap-2">
                            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: SEGMENT_COLORS[s.k] }} />
                            <div>
                                <div className="text-xs font-bold" style={{ color: SEGMENT_COLORS[s.k] }}>{s.n}</div>
                                <div className="text-[11px] text-[#7D7DA6] leading-tight mt-0.5">{s.t}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scatter RFM */}
            <div className="h-[400px]">
                <ChartCard 
                    title="RFM Haritası (X: Recency, Y: Frequency, Bubble: Ciro)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis type="number" dataKey="recency" name="Gün Önce" unit="g" tick={{ fontSize: 10 }} reversed />
                                <YAxis type="number" dataKey="frequency" name="Siparişler" unit="x" tick={{ fontSize: 10 }} />
                                <ZAxis type="number" dataKey="monetary" range={[50, 800]} name="Ciro" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => name === 'Ciro' ? fmt(val) : val} />
                                {segmented.map((entry, index) => (
                                    <Scatter key={index} name={entry.name} data={[entry]} fill={SEGMENT_COLORS[entry.segment]} fillOpacity={0.7} />
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABlO */}
            <TableCard
                title="Müşteri RFM Veritabanı"
                columns={[
                    { key: 'name', label: 'Müşteri (PII Masked)', align: 'left' },
                    { key: 'segment', label: 'Segment', align: 'left' },
                    { key: 'rfm', label: 'R / F / M', align: 'center', className: 'font-mono' },
                    { key: 'recency', label: 'Son Sipariş', align: 'right' },
                    { key: 'frequency', label: 'Toplam Sip.', align: 'right' },
                    { key: 'monetary', label: 'Toplam Ciro', align: 'right' },
                ]}
                rows={segmented.slice(0, 50).map(c => ({
                    name: <div className="font-semibold text-[#0F1223] flex items-center gap-2">
                        {c.name.includes('*') ? c.name : c.name.substring(0,2) + '*** ' + (c.name.split(' ')[1] || '').substring(0,1) + '***'}
                        <ChannelBadge channelId={c.channel} />
                    </div>,
                    segment: <span className="px-2 py-1 text-[11px] font-bold rounded-md" style={{backgroundColor: SEGMENT_COLORS[c.segment]+'15', color: SEGMENT_COLORS[c.segment]}}>{SEGMENT_LABELS[c.segment]}</span>,
                    rfm: `${c.rScore} / ${c.fScore} / ${c.mScore}`,
                    recency: `${c.recency} gün önce`,
                    frequency: <span className="font-bold">{c.frequency}</span>,
                    monetary: <span className="font-bold text-[#514BEE]">{fmt(c.monetary)}</span>
                }))}
            />

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard 
                    type={champCount > 0 ? "suggestion" : "trend"} 
                    title={champCount > 0 ? "Champion Aksiyonu" : "Geliştirilebilir Sadakat"} 
                    body={champCount > 0 ? `RFM Veritabanınızda ${champCount} adet Şampiyon seviyesinde karlı müşteri tespit edildi. Bu gruba VIP indirim veya erken erişim kampanyaları düzenleyerek bağlılıklarını pekiştirin.` : "Kullanıcılarınız henüz Şampiyon sadakat seviyesine ulaşmadı. RFM skorlarını artırmak için sadakat programı kurgulayabilirsiniz."} 
                />
                <InsightCard 
                    type={riskCount > 20 ? "alert" : "positive"} 
                    title={riskCount > 0 ? "Risk Uyarısı" : "Güçlü Profil Özeti"} 
                    body={riskCount > 0 ? `Sistemde ${riskCount} adet değerli müşteri "At Risk" veya "Can't Lose Them" sinyaline sahip. Geri kazanım e-posta otomasyonlarını anında aktif edin.` : "Sepetinizde veya geçmiş siparişlerde risk grubuna giren değerli müşteri saptanmadı. Müşteri tutma başarınız son derece stabil."} 
                />
            </div>
        </div>
    );
};
