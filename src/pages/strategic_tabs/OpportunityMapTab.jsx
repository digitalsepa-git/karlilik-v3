import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { InsufficientDataEmptyState, StrategicHeader, DataQualityStrip, KpiCard, ChartCard, TableCard, InsightCard, AksiyonMerkezi, AssumptionBar, AssumptionChip, OPPORTUNITY_COLORS, ForecastDisclaimer } from './SharedStrategicComponents';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Treemap } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const OpportunityMapTab = () => {
    const { productsData } = useData();
    const { products } = productsData;

    const metrics = useMemo(() => {
        if (!products || products.length < 5) return { insufficient: true };

        // Synthetic Opportunity Matrix Data
        // X: Pazar Büyüme (%), Y: Bizim Gücümüz (0-100), Z: Pazar Büyüklüğü
        const opps = [
            { id: 1, name: 'Premium Serumu', growth: 65, strength: 80, size: 400000, score: 85, cat: 'star' },
            { id: 2, name: 'Güneş Kremi', growth: 45, strength: 90, size: 600000, score: 75, cat: 'star' },
            { id: 3, name: 'Vegan Temizleyici', growth: 80, strength: 30, size: 200000, score: 60, cat: 'question' },
            { id: 4, name: 'Kolajen Maske', growth: 70, strength: 40, size: 150000, score: 65, cat: 'question' },
            { id: 5, name: 'Klasik Nemlendirici', growth: 5, strength: 85, size: 800000, score: 50, cat: 'cow' },
            { id: 6, name: 'Gül Suyu Tonik', growth: -10, strength: 75, size: 300000, score: 40, cat: 'cow' },
            { id: 7, name: 'Banyo Köpüğü', growth: -5, strength: 20, size: 100000, score: 15, cat: 'dog' },
            { id: 8, name: 'Erkek Bakım', growth: 10, strength: 15, size: 250000, score: 25, cat: 'dog' }
        ];

        let avgScore = 0;
        let hotCount = 0;
        let potentialRev = 0;

        opps.forEach(o => {
            avgScore += o.score;
            if (o.score >= 80) hotCount++;
            if (o.score >= 60) potentialRev += (o.size * 0.15); // Assume we can capture 15% 
        });
        avgScore /= opps.length;

        const getOppColor = (score) => {
            if (score >= 80) return OPPORTUNITY_COLORS.hot;
            if (score >= 60) return OPPORTUNITY_COLORS.warm;
            if (score >= 40) return OPPORTUNITY_COLORS.mild;
            if (score >= 20) return OPPORTUNITY_COLORS.cool;
            return OPPORTUNITY_COLORS.cold;
        };

        const scatterData = opps.map(o => ({ ...o, fill: getOppColor(o.score) }));

        // Treemap for White Space
        const whiteSpaceData = [
            { name: "SPF 50+ Renkli", size: 45, score: 88 },
            { name: "Göz Altı Peptid", size: 30, score: 72 },
            { name: "Leke Karşıtı (Kış)", size: 25, score: 65 },
            { name: "Vegan Saç Serumu", size: 18, score: 54 }
        ];

        const actions = [];
        actions.push({ priority: 'acil', title: 'Odak Fırsatı: Premium Serumu', desc: '85 skor ile en yüksek fırsata sahip kategori. %65 pazar büyümesi görülüyor. Yeni ürün gamına ek bütçe onayı alınmalı.', cta: 'Bütçe Talep Et' });
        actions.push({ priority: 'öneri', title: 'White-Space: SPF 50+ Renkli', desc: 'Sizin satışınız 0 ancak rakiplerin en yoğun yatırım yaptığı ve aramanın en çok olduğu alt segment. Üreticiyle görüş.', cta: 'Ürün Dosyası Aç' });

        return { scatterData, whiteSpaceData, avgScore, hotCount, potentialRev, actions };
    }, [products]);

    if (!metrics) return null;
    if (metrics.insufficient) return <InsufficientDataEmptyState featureName="Fırsat Haritası Analizi" required="Katalog derinliği" available={`${products?.length} ürün`} />;

    const { scatterData, whiteSpaceData, avgScore, hotCount, potentialRev, actions } = metrics;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-2 text-[#0F1223] border-b pb-1">{data.name}</p>
                    <p>Pazar Büyümesi: <span className="font-bold text-emerald-600">+{data.growth}%</span></p>
                    <p>Bizim Gücümüz: <span className="font-bold">{data.strength}/100</span></p>
                    <p>Pazar Hacmi: <span className="font-bold">{fmt(data.size)}</span></p>
                    <p className="mt-2 text-center text-[10px] uppercase font-bold text-white py-1 rounded" style={{backgroundColor: data.fill}}>Skor: {data.score}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            <StrategicHeader 
                title="Stratejik Fırsat Haritası (Nereye Gidelim?)" 
                subtitle="Mevcut rekabet avantajınız ile piyasa büyümesinin kesişiminden doğan boşluk (white-space) analizleri."
                breadcrumbs={['Rapor Merkezi', 'Stratejik', 'Fırsat Haritası']}
            />

            <AssumptionBar>
                <AssumptionChip label="Pazar Hacmi Kaynağı" value="AI Estimate (Market)" />
                <AssumptionChip label="Fırsat Skoru Ağırlığı" value="Dinamik Dağıtım" editable={true} />
            </AssumptionBar>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Fırsat Skoru" value={avgScore.toFixed(1)} delta="Ortalama" tone={avgScore > 50 ? "positive" : "neutral"} />
                <KpiCard title="Sıcak Fırsat (Yıldızlar)" value={hotCount} delta="Skor ≥ 80" tone="positive" />
                <KpiCard title="Tahmini Ciro Potansiyeli" value={fmt(potentialRev)} delta="12 Ay. Projekte" tone="positive" />
                <KpiCard title="Kapsama Oranı (Market)" value="%34" delta="Mevcut portföy ile" tone="warning" />
            </div>

            <ForecastDisclaimer model="Fırsat Ağırlıklandırma Kriteri: Pazar Büyümesi (%30), Mevcut Güç (%40), Rakipler (%30)" confidence="72" dataPoints={250} period={180} />

            {/* Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 h-[450px]">
                <ChartCard 
                    title="Fırsat Matrisi (X: Büyüme, Y: Gücümüz, Renk: Fırsat Skoru)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis type="number" dataKey="growth" name="Pazar Büyümesi" unit="%" tick={{ fontSize: 11 }} />
                                <YAxis type="number" dataKey="strength" name="Rekabet Gücümüz" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <ZAxis type="number" dataKey="size" range={[200, 1500]} name="Pazar Büyüklüğü" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                
                                <ReferenceLine x={25} stroke="#7D7DA6" strokeDasharray="3 3" opacity={0.5} />
                                <ReferenceLine y={50} stroke="#7D7DA6" strokeDasharray="3 3" opacity={0.5} />
                                
                                {scatterData.map((entry, index) => (
                                    <Scatter key={index} name={entry.name} data={[entry]} fill={entry.fill} fillOpacity={0.8} />
                                ))}
                                
                                <text x="80%" y="10%" textAnchor="middle" className="text-xs font-bold fill-[#7D7DA6] opacity-50">💎 YILDIZLAR</text>
                                <text x="20%" y="10%" textAnchor="middle" className="text-xs font-bold fill-[#7D7DA6] opacity-50">🤔 SORU İŞARETLERİ</text>
                                <text x="80%" y="90%" textAnchor="middle" className="text-xs font-bold fill-[#7D7DA6] opacity-50">🐄 NAKİT İNEKLERİ</text>
                                <text x="20%" y="90%" textAnchor="middle" className="text-xs font-bold fill-[#7D7DA6] opacity-50">🐕 KÖPEKLER</text>
                            </ScatterChart>
                        </ResponsiveContainer>
                    }
                />
                
                <div className="bg-white border rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-[#FAFAFB]">
                        <h3 className="font-bold text-[#0F1223] text-sm">Boş Pazar Segmentleri (White Space)</h3>
                        <p className="text-[10px] text-[#7D7DA6] mt-1">Rakipte var, pazar arıyor ama bizde hiç ürün yok.</p>
                    </div>
                    <div className="flex-1 p-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={whiteSpaceData}
                                dataKey="size"
                                stroke="#fff"
                                fill="#8B5CF6"
                                isAnimationActive={false}
                            >
                                <Tooltip formatter={(val)=>`${val} İndeks`} />
                            </Treemap>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 pointer-events-none flex flex-col">
                            {whiteSpaceData.map((w,i) => (
                                <div key={i} className="absolute text-white font-bold text-xs" style={{
                                    left: i===0?'10%':i===1?'60%':'10%', 
                                    top: i===0?'20%':i===1?'20%':i===2?'70%':'80%'
                                }}>{w.name}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AksiyonMerkezi actions={actions} />

        </div>
    );
};
