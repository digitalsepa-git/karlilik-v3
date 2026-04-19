import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
    InsufficientDataEmptyState, StrategicHeader, DataQualityStrip, 
    KpiCard, ChartCard, TableCard, InsightCard, AksiyonMerkezi, 
    COMPETITOR_COLORS, C, cn 
} from './SharedStrategicComponents';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const CompetitorDepthTab = () => {
    const { productsData } = useData();
    const { products } = productsData;

    const metrics = useMemo(() => {
        if (!products || products.length < 10) return { insufficient: true };

        // Synthetic Competitor Data Generation for UI Demo
        const competitors = [
            { id: 'c1', name: 'Rakip A (Lider)', isSelf: false, type: 'leader', avgPriceDiff: 1.15, skuCount: Math.floor(products.length * 1.5) },
            { id: 'self', name: 'Biz', isSelf: true, type: 'self', avgPriceDiff: 1.0, skuCount: products.length },
            { id: 'c2', name: 'Rakip B (Takipçi)', isSelf: false, type: 'follower', avgPriceDiff: 0.9, skuCount: Math.floor(products.length * 0.8) },
            { id: 'c3', name: 'Rakip C (Niş)', isSelf: false, type: 'nicher', avgPriceDiff: 1.4, skuCount: Math.floor(products.length * 0.3) },
            { id: 'c4', name: 'Rakip D (Fiyat Kırıcı)', isSelf: false, type: 'challenger', avgPriceDiff: 0.75, skuCount: Math.floor(products.length * 1.1) }
        ];

        let ourAvgPrice = 0;
        let matchedProducts = [];

        products.forEach(p => {
            const cost = p.unitCost || 50;
            const price = Math.max(cost * 1.5, Math.random() * 200 + 100);
            ourAvgPrice += price;

            // Generate synthetic match for this product
            const matches = competitors.filter(c => !c.isSelf).map(c => {
                const isMatched = Math.random() > 0.3; // 70% match rate
                if (!isMatched) return null;
                const compPrice = price * c.avgPriceDiff * (1 + (Math.random() * 0.2 - 0.1));
                return { cId: c.id, price: compPrice };
            }).filter(Boolean);

            if (matches.length > 0) {
                let minCompPrice = matches[0].price;
                let minCompId = matches[0].cId;
                matches.forEach(m => {
                    if (m.price < minCompPrice) { minCompPrice = m.price; minCompId = m.cId; }
                });

                let positionTitle = 'Orta';
                if (price < minCompPrice * 0.95) positionTitle = 'En Ucuz';
                if (price > minCompPrice * 1.05) positionTitle = 'En Pahalı';

                matchedProducts.push({
                    id: p.id,
                    sku: p.sku || 'N/A',
                    name: p.name || 'Ürün',
                    ourPrice: price,
                    matches,
                    minCompPrice,
                    minCompId,
                    positionTitle
                });
            }
        });

        ourAvgPrice = products.length > 0 ? ourAvgPrice / products.length : 0;

        // Matrix Data
        const matrixData = competitors.map(c => {
            const p = c.isSelf ? ourAvgPrice : ourAvgPrice * c.avgPriceDiff;
            return {
                id: c.id, name: c.name, type: c.type, isSelf: c.isSelf,
                avgPrice: p,
                skuCount: c.skuCount,
                pazarPayiTahmini: c.isSelf ? 20 : (c.type === 'leader' ? 40 : c.type === 'challenger' ? 25 : 10)
            };
        });

        let ucuzCount = 0, ortaCount = 0, pahaliCount = 0;
        matchedProducts.forEach(m => {
            if (m.positionTitle === 'En Ucuz') ucuzCount++;
            else if (m.positionTitle === 'Orta') ortaCount++;
            else pahaliCount++;
        });

        const actions = [];
        if (pahaliCount > matchedProducts.length * 0.3) {
            actions.push({ priority: 'acil', title: 'Yüksek Fiyat Dezavantajı', desc: `${pahaliCount} üründe pazardaki en pahalı opsiyon sunuluyor. Rakipler pazar payı çalıyor olabilir. Fiyat simülatörüne geçin.`, cta: 'Simülatöre Git' });
        }
        actions.push({ priority: 'önemli', title: 'Rakip Kampanya Sinyali', desc: 'Rakip D (Fiyat Kırıcı) son 48 saatte 12 ana üründe fiyatları ortalama %18 düşürdü. Hafta sonu kampanyası hazırlığı olabilir.', cta: 'Kampanya Yanıtı Hazırla' });

        return { matchedProducts, matrixData, ucuzCount, ortaCount, pahaliCount, ourAvgPrice, actions };
    }, [products]);

    if (!metrics) return null;
    if (metrics.insufficient) return <InsufficientDataEmptyState featureName="Rekabet Derinlik Analizi" required="En az 10 ürün ve eşleştirilmiş rakip datası" available={`${products?.length || 0} ürün`} />;

    const { matchedProducts, matrixData, ucuzCount, ortaCount, pahaliCount, ourAvgPrice, actions } = metrics;
    const sortedMatches = [...matchedProducts].sort((a,b) => b.ourPrice - a.ourPrice);

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            <StrategicHeader 
                title="Rekabet Derinlik & Pozisyonlama" 
                subtitle="Sizin ve eşleştirilen rakiplerinizin fiyat, ürün kapsamı ve pazar gücüne göre stratejik konumu."
                breadcrumbs={['Rapor Merkezi', 'Stratejik', 'Rekabet Derinlik']}
            />

            <DataQualityStrip quality={65} issues={['Rakip D fiyat verisi son güncelleme 48 saat önce', 'Ürünlerin %30\'u rakiplerle eşleştirilemedi (SKU gap)']} />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <KpiCard title="Aktif Rakip Sayısı" value="4" delta="Takip edilen" tone="neutral" />
                <KpiCard title="Eşleşen Kapsam" value={pct((matchedProducts.length / products.length)*100)} delta={`${matchedProducts.length} Ürün`} tone="positive" />
                <KpiCard title="Fiyat Pozisyonu" value="Pahalı" delta="Rakiplere kıyasla %8" tone="negative" />
                <KpiCard title="En Ucuz Olunan Ürün" value={ucuzCount} delta={`%${((ucuzCount/matchedProducts.length)*100).toFixed(0)}`} tone="positive" />
                <KpiCard title="En Pahalı Olunan" value={pahaliCount} delta={`%${((pahaliCount/matchedProducts.length)*100).toFixed(0)}`} tone="negative" />
                <KpiCard title="Aktif Sinyal" value="2" delta="Son 7 gün kampanya" tone="warning" />
            </div>

            {/* Matrix */}
            <div className="h-[450px]">
                <ChartCard 
                    title="Rakip Haritası (Positioning Matrix)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis type="number" dataKey="avgPrice" name="Ortalama Fiyat" unit="₺" tick={{ fontSize: 11 }} />
                                <YAxis type="number" dataKey="skuCount" name="Çeşitlilik (SKU)" tick={{ fontSize: 11 }} />
                                <ZAxis type="number" dataKey="pazarPayiTahmini" range={[100, 1000]} name="Pazar Payı Etkisi" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => name === 'Ortalama Fiyat' ? fmt(val) : val} />
                                {matrixData.map((entry, index) => (
                                    <Scatter key={index} name={entry.name} data={[entry]} fill={COMPETITOR_COLORS[entry.type]} fillOpacity={entry.isSelf ? 1 : 0.7} />
                                ))}
                                <ReferenceLine x={ourAvgPrice} stroke="#7D7DA6" strokeDasharray="3 3" opacity={0.5} label={{ position: 'top', value: 'Bizim Fiyat Ort.' }} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* Table */}
            <TableCard
                title="Fiyat Karşılaştırma Cihazı (Master Tablo)"
                columns={[
                    { key: 'urun', label: 'Ürün', align: 'left' },
                    { key: 'biz', label: 'Kendi Fiyatımız', align: 'right', className: 'bg-[#FAFAFB]' },
                    { key: 'min', label: 'En Ucuz Rakip Fiyatı', align: 'right' },
                    { key: 'fark', label: 'Fark (%)', align: 'right' },
                    { key: 'roz', label: 'Stratejik Konum', align: 'left' },
                    { key: 'islem', label: 'Aksiyon', align: 'right' }
                ]}
                rows={sortedMatches.slice(0, 50).map(m => {
                    const diff = m.ourPrice > 0 ? ((m.minCompPrice - m.ourPrice) / m.ourPrice) * 100 : 0;
                    return {
                        urun: <div><div className="font-bold text-[#0F1223] text-xs max-w-[200px] truncate">{m.name}</div><div className="text-[10px] text-[#7D7DA6] font-mono">{m.sku}</div></div>,
                        biz: <span className="font-bold text-[#514BEE]">{fmt(m.ourPrice)}</span>,
                        min: <div><span className="font-bold">{fmt(m.minCompPrice)}</span><div className="text-[10px] text-[#7D7DA6]">Rakip {m.minCompId}</div></div>,
                        fark: <span className={`font-bold ${diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</span>,
                        roz: <span className={cn("px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider", m.positionTitle === 'En Ucuz' ? 'bg-emerald-50 text-emerald-700' : m.positionTitle === 'En Pahalı' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700')}>{m.positionTitle}</span>,
                        islem: <button className="text-[11px] font-bold text-[#514BEE]">Detay</button>
                    };
                })}
            />
            
            <div className="px-4 py-3 bg-[#FAFAFB] border border-[#EDEDF0] rounded-lg text-xs text-[#7D7DA6] font-medium mt-[-10px]">
                Özet: <strong>{ucuzCount}</strong> üründe en ucuz (%{((ucuzCount/matchedProducts.length)*100).toFixed(0)}), <strong>{ortaCount}</strong> üründe orta (%{((ortaCount/matchedProducts.length)*100).toFixed(0)}), <strong>{pahaliCount}</strong> üründe en pahalı (%{((pahaliCount/matchedProducts.length)*100).toFixed(0)}).
            </div>

            <AksiyonMerkezi actions={actions} />

        </div>
    );
};
