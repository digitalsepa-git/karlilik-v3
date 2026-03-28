import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { RefreshCw } from 'lucide-react';

export function ProductManagement({ t }) {
    const { productsData, ordersData } = useData();
    const { products, loading, error, refetch } = productsData;
    const { orders, loading: ordersLoading } = ordersData; // Fetch genuine orders for velocity calculation
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); // 'list' or 'detail'
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter Logic
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Chart Interaction State
    const [hoveredData, setHoveredData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Advanced Chart Logic
    const renderChart = () => {
        const dataPoints = selectedProduct?.history || [];
        if (!dataPoints || dataPoints.length === 0) {
            return <div className="flex items-center justify-center h-full text-xs text-gray-400">Veri Yok</div>;
        }

        // 1. Calculate Scales
        const prices = dataPoints.map(d => d.price);
        const profits = dataPoints.map(d => d.profit);
        const allValues = [...prices, ...profits];

        const maxVal = Math.max(...allValues) * 1.1;
        const minVal = 0;
        const range = maxVal - minVal;

        // Area dimensions (Leave space for X-axis labels)
        const CHART_HEIGHT = 100; // viewbox units
        const AXIS_HEIGHT = 15;
        const PLOT_HEIGHT = CHART_HEIGHT - AXIS_HEIGHT; // 85

        // 2. Coordinate Helper
        const getCoords = (val, i) => {
            const x = (i / (dataPoints.length - 1)) * 100;
            // Map value to 0 -> PLOT_HEIGHT range, inverted
            const y = PLOT_HEIGHT - ((val - minVal) / range) * PLOT_HEIGHT;
            return { x, y };
        };

        const pricePoints = dataPoints.map((d, i) => {
            const c = getCoords(d.price, i);
            return `${c.x},${c.y}`;
        }).join(" ");

        const profitPoints = dataPoints.map((d, i) => {
            const c = getCoords(d.profit, i);
            return `${c.x},${c.y}`;
        }).join(" ");

        const widthPerPoint = 100 / dataPoints.length;

        // Tooltip Positioning Handler
        const handleMouseEnter = (e, pt, i) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // Position: Center of the trigger bar, slight offset up
            const x = rect.left + rect.width / 2;
            const y = rect.top;

            setTooltipPos({ x, y });
            setHoveredData({ ...pt, index: i });
        };

        const handleMouseMove = (e) => {
            // Optional: Mouse follow logic if strict rect positioning isn't enough
            // But the user's snippet suggested rect-based top and mouse-based left.
            // For smoother UX in React, strict rect-based (above the bar) is often more stable 
            // than following the mouse pixel-by-pixel which can cause jitter. 
            // I'll stick to the stable rect-based positioning established in handleMouseEnter for now,
            // as it prevents the tooltip from covering the cursor.
        };

        return (
            <>
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Grid Lines */}
                    <line x1="0" y1={PLOT_HEIGHT * 0.25} x2="100" y2={PLOT_HEIGHT * 0.25} stroke="#f3f4f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1={PLOT_HEIGHT * 0.50} x2="100" y2={PLOT_HEIGHT * 0.50} stroke="#f3f4f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1={PLOT_HEIGHT * 0.75} x2="100" y2={PLOT_HEIGHT * 0.75} stroke="#f3f4f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1={PLOT_HEIGHT} x2="100" y2={PLOT_HEIGHT} stroke="#e5e7eb" strokeWidth="1" vectorEffect="non-scaling-stroke" />

                    {/* X-Axis Labels (Every 3rd point logic) */}
                    {dataPoints.map((d, i) => {
                        if (i % 3 === 0 || i === dataPoints.length - 1) {
                            const xAnchor = i === 0 ? "start" : (i === dataPoints.length - 1 ? "end" : "middle");
                            const xPos = (i / (dataPoints.length - 1)) * 100;
                            return (
                                <text
                                    key={i}
                                    x={xPos}
                                    y="96"
                                    className="text-[3px] fill-gray-400 font-sans"
                                    textAnchor={xAnchor}
                                >
                                    {d.date}
                                </text>
                            );
                        }
                        return null;
                    })}

                    {/* Profit Area & Line */}
                    <polygon fill="rgba(16, 185, 129, 0.1)" points={`0,${PLOT_HEIGHT} ${profitPoints} 100,${PLOT_HEIGHT}`} />
                    <polyline fill="none" stroke="#10b981" strokeWidth="2" points={profitPoints} vectorEffect="non-scaling-stroke" />

                    {/* Price Line */}
                    <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={pricePoints} vectorEffect="non-scaling-stroke" />

                    {/* Hover Cursor Line */}
                    {hoveredData && (
                        <line
                            x1={getCoords(hoveredData.price, hoveredData.index).x}
                            y1="0"
                            x2={getCoords(hoveredData.price, hoveredData.index).x}
                            y2={PLOT_HEIGHT}
                            stroke="#6b7280"
                            strokeWidth="1"
                            strokeDasharray="4"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Interactive Triggers */}
                    {dataPoints.map((pt, i) => (
                        <rect
                            key={i}
                            x={(i * widthPerPoint) - (widthPerPoint / 2)}
                            y="0"
                            width={widthPerPoint}
                            height="100"
                            fill="transparent"
                            style={{ cursor: 'crosshair' }}
                            onMouseEnter={(e) => handleMouseEnter(e, pt, i)}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                    ))}
                </svg>

                {/* Portal Tooltip */}
                {hoveredData && createPortal(
                    <div
                        className="fixed z-[9999] bg-gray-900/95 backdrop-blur-sm text-white text-[10px] rounded-lg p-3 shadow-xl pointer-events-none min-w-[140px] border border-gray-700/50"
                        style={{
                            top: tooltipPos.y - 120, // Position above the cursor area
                            left: tooltipPos.x - 70, // Center alignment (140px / 2)
                        }}
                    >
                        <div className="font-bold text-gray-300 border-b border-gray-700 pb-1 mb-1">{hoveredData.date}</div>
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-indigo-300 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Fiyat:</span>
                            <span className="font-bold">₺{hoveredData.price}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Net Kâr:</span>
                            <span className="font-bold">₺{hoveredData.profit}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3 mt-1 pt-1 border-t border-gray-700 border-dashed">
                            <span className="text-gray-400">Marj:</span>
                            <span className="font-bold text-white">%{hoveredData.margin}</span>
                        </div>
                        {/* Down Arrow */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700/50"></div>
                    </div>,
                    document.body
                )}
            </>
        );
    };


    // AI Content State
    const [aiResults, setAiResults] = useState({ title: '', desc: '', mainDesc: '' });
    const [loadingField, setLoadingField] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    // AI Image State
    const [isImageGenerating, setIsImageGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    // AI Studio Modal State
    const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
    const [studioPrompt, setStudioPrompt] = useState("");

    const openStudioModal = () => {
        setStudioPrompt("");
        setGeneratedImage(null);
        setIsStudioModalOpen(true);
    };
    const closeStudioModal = () => setIsStudioModalOpen(false);

    const triggerFieldAI = (field) => {
        setLoadingField(field);

        // Immediate Feedback: Show box with loading text
        const stateKey = field === 'main-desc' ? 'mainDesc' : field;
        setAiResults(prev => ({ ...prev, [stateKey]: 'AI düşünüyör...' }));

        // Simulate AI Delay
        setTimeout(() => {
            let result = '';
            if (field === 'title') {
                result = "🚀 Fırsat: Kablosuz Ergonomik Mouse | 2 Yıl Garanti & Hızlı Kargo";
            } else if (field === 'desc') {
                result = "Ofis verimliliğinizi artırın! Sessiz tıklama özelliği ve ergonomik tutuşu ile gün boyu konfor. Şimdi indirimli fiyatıyla keşfedin.";
            } else if (field === 'main-desc') {
                result = "✅ ÜRÜN ÖZELLİKLERİ:\n\nBu üstün performanslı ürün ile çalışma alanınızı yeniden tanımlayın. Profesyoneller için özel olarak geliştirilen ergonomik yapısı, bilek sağlığınızı korurken maksimum verimlilik sağlar.\n\n• Sessiz Çalışma: Kütüphane sessizliğinde çalışın.\n• Uzun Pil Ömrü: Tek şarjla 6 ay kullanım.\n• Yüksek Hassasiyet: Her yüzeyde mükemmel takip.\n\nPazar yerlerindeki rakiplerinden %20 daha hafif ve dayanıklıdır. Hemen sipariş verin, aynı gün kargoya verilsin!";
            }

            setAiResults(prev => ({ ...prev, [stateKey]: result }));
            setLoadingField(null);
        }, 1000);
    };

    const copyField = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName); // Trigger green flash
        setTimeout(() => setCopiedField(null), 300);
    };

    const generateStudioImage = () => {
        setIsImageGenerating(true);

        // Default "Studio" Style (Dramatic Light)
        let resultUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop";

        // Check keywords
        const p = studioPrompt.toLowerCase();
        if (p.includes("neon") || p.includes("cyberpunk") || p.includes("karanlık")) {
            // Neon / Gaming Style
            resultUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop";
        } else if (p.includes("doğa") || p.includes("nature") || p.includes("yaprak")) {
            // Nature Style
            resultUrl = "https://images.unsplash.com/photo-1593121925328-369cc80274d6?q=80&w=800&auto=format&fit=crop";
        } else if (p.includes("minimal") || p.includes("beyaz")) {
            // Minimal Style
            resultUrl = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop";
        } else if (p.includes("mermer") || p.includes("luxury") || p.includes("lüks") || p.includes("marble")) {
            // Luxury / Marble Style
            resultUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop";
        }

        setTimeout(() => {
            setGeneratedImage(resultUrl);
            setIsImageGenerating(false);
        }, 2500);
    };

    const applyAIImage = () => {
        const generatedSrc = generatedImage;
        const mainImg = document.querySelector('.group img'); // Selecting the main image in the detail view

        // Swap animation mimicking the user's snippet
        if (mainImg) mainImg.style.opacity = '0';

        setTimeout(() => {
            setSelectedProduct(prev => ({ ...prev, detailImg: generatedSrc, img: generatedSrc }));
            if (mainImg) mainImg.style.opacity = '1';

            setGeneratedImage(null); // Hide the AI box after applying
            alert("Görsel güncellendi ve galeriye eklendi!");
        }, 300);
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const handleProductClick = (product) => {
        // STOCK LOGIC: Now pulled natively from Ikas via useIkasProducts
        const reserved = product.reserved || 0;
        const available = product.available || product.stock || 0;
        const supplier = "—";
        const costPrice = 0;

        // SALES LOGIC (Calculated from real useOrders data)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Find orders containing this product (by name match, ignoring case)
        const productOrders = orders.filter(order => 
            order.productName && product.name && order.productName.toLowerCase().includes(product.name.toLowerCase())
        );
        
        // Calculate 30-Day Volume
        let sales30Days = 0;
        productOrders.forEach(order => {
            if (new Date(order.dateRaw) > thirtyDaysAgo) {
                // In a real scenario we'd sum order.orderLineItems[x].quantity if we had it, 
                // but useOrders currently returns 1 row per order in the list summary. 
                // We'll count 1 per matching order.
                sales30Days += 1; 
            }
        });

        const dailySalesAverage = sales30Days / 30;

        // Calculate Last 7 Days grouped array for the sparkline chart
        const last7DaysSales = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0,0,0,0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            
            const salesThatDay = productOrders.filter(o => {
                const oDate = new Date(o.dateRaw);
                return oDate >= date && oDate < nextDate;
            }).length;
            
            last7DaysSales.push(salesThatDay);
        }

        const enrichedProduct = {
            ...product,
            reserved,
            available,
            sales30Days,
            dailySalesAverage,
            last7DaysSales,
            supplier,
            costPrice,
            // 1. Competitor Data (Mock)
            competitorPrice: product.price, 
            // 2. Velocity Data (Real)
            salesLast3Days: last7DaysSales.slice(-3).reduce((a, b) => a + b, 0),
            salesLast30Days: sales30Days, 
            // 3. Store Data (Mock)
            storeTotalRevenue: 0,
            detailImg: product.img.replace('40x40', '400x400'),
            leadTime: 0,
            supplierId: `—`,
            lastPurchasePrice: 0,
            averageCost: 0,
            moq: 0
        };

        setSelectedProduct(enrichedProduct);
        setView('detail');
        setAiResults({ title: '', desc: '', mainDesc: '' });
        setGeneratedImage(null);
        window.scrollTo(0, 0);
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedProduct(null);
    };

    const renderStockBadge = (stock) => {
        if (stock === 0) {
            return (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    Yok
                </span>
            );
        } else if (stock < 20) {
            return (
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                    Kritik
                </span>
            );
        } else {
            return <span className="text-gray-900 font-bold">{stock}</span>;
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">

            {/* LIST VIEW */}
            {view === 'list' && (
                <div id="inventory-list-view">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Ürün Yönetimi</h2>
                            <p className="mt-1 text-sm text-gray-500">Tüm ürün envanterini, stok durumunu ve fiyatları buradan yönetin.</p>
                        </div>
                        <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 h-9">
                                <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${loading ? 'animate-pulse' : ''}`}></span>
                                ikas API {loading ? 'Bağlanıyor...' : 'Bağlı'}
                            </span>
                            <button onClick={refetch} disabled={loading} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Ürün Kaynağını Güncelle
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex items-center">
                            <div className="relative w-full max-w-md">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ürün adı, SKU veya marka ara..."
                                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:pl-6">Ürün Detayı</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Kategori</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Marka</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">SKU / ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">Stok</th>
                                        <th scope="col" className="px-3 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-gray-500">Web Fiyat</th>
                                        <th scope="col" className="py-3.5 pl-3 pr-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 sm:pr-6">Kanallar</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-table-body" className="bg-white relative">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <p className="text-sm font-medium">İkas Sunucusundan Canlı Ürün Kataloğu Çekiliyor...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-rose-500">
                                                <p className="font-bold">Bağlantı Hatası</p>
                                                <p className="text-sm">{error}</p>
                                            </td>
                                        </tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-slate-500 text-sm">Arama kriterlerine uygun ürün bulunamadı.</td>
                                        </tr>
                                    ) : filteredProducts.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative z-10">
                                                <td
                                                    className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 cursor-pointer"
                                                    onClick={() => handleProductClick(item)}
                                                >
                                                    <div className="flex items-center group">
                                                        <div className="h-12 w-12 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                                                            <img 
                                                                className="h-full w-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-300" 
                                                                src={item.img} 
                                                                alt={item.name} 
                                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' }} 
                                                            />
                                                        </div>
                                                        <div className="ml-4 max-w-[300px] sm:max-w-md">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate" title={item.name}>{item.name}</div>
                                                                <a
                                                                    href={item.ikasSlug ? `https://gesketurkiye.com/${item.ikasSlug}` : `https://gesketurkiye.com/arama?q=${item.sku}`}
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                    className="text-gray-300 hover:text-indigo-500 transition-colors bg-white rounded-full flex-shrink-0"
                                                                    title="Ürün Sayfasına Git"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                                    </svg>
                                                                </a>
                                                            </div>
                                                            <div className="text-[11px] text-gray-400 font-medium">Ana Ürün</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">{item.brand}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">{item.sku}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    {renderStockBadge(item.stock)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-bold">
                                                    ₺{(item.price || 0).toLocaleString('tr-TR')}
                                                </td>
                                                <td
                                                    className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(item.id);
                                                    }}
                                                >
                                                    <div className="inline-flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition-colors justify-end">
                                                        <span className="text-xs font-medium text-gray-400 mr-1">Kanallar ({item.channels ? item.channels.length : 0})</span>
                                                        <svg
                                                            className={`h-5 w-5 transform transition-transform duration-200 ${expandedRows.has(item.id) ? 'rotate-180 text-indigo-600' : ''}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="2"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                        </svg>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Child Rows for Channels */}
                                            {expandedRows.has(item.id) && item.channels && item.channels.map((ch, idx) => {
                                                let badgeClass = "bg-gray-200 text-gray-700";
                                                if (ch.name === 'Trendyol') badgeClass = "bg-orange-100 text-orange-700 border border-orange-200";
                                                if (ch.name === 'Hepsiburada') badgeClass = "bg-orange-50 text-orange-600 border border-orange-200";
                                                if (ch.name === 'Amazon') badgeClass = "bg-yellow-100 text-yellow-800 border border-yellow-200";

                                                return (
                                                    <tr key={idx} className="bg-gray-50/50 hover:bg-gray-50 transition-colors child-row">
                                                        <td className="whitespace-nowrap py-3 pl-4 pr-3 sm:pl-6 relative">
                                                            {/* Tree Connectors */}
                                                            <div className="absolute left-8 top-0 h-full w-px bg-gray-300"></div>
                                                            <div className="absolute left-8 top-1/2 w-4 h-px bg-gray-300"></div>

                                                            <div className="flex items-center ml-8">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold w-24 justify-center ${badgeClass}`}>
                                                                    {ch.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 italic">{ch.category}</td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">{ch.brand}</td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 font-mono">{ch.sku}</td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-xs text-right text-gray-600 font-medium">{ch.stock} Adet</td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-sm text-right font-bold text-gray-700">₺{(ch.price || 0).toLocaleString('tr-TR')}</td>
                                                        <td className="whitespace-nowrap px-3 py-3 text-right">
                                                            <a 
                                                                href={ch.name === 'Trendyol' ? (ch.customUrl || `https://www.trendyol.com/sr?q=${ch.sku}`) : (ch.ikasSlug ? `https://gesketurkiye.com/${ch.ikasSlug}` : `https://gesketurkiye.com/arama?q=${ch.sku}`)} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium whitespace-nowrap"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Mağazaya Git ↗
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <p className="text-sm text-gray-700">Toplam <span className="font-bold" id="total-inventory-count">{filteredProducts.length}</span> ürün.</p>
                        </div>
                    </div>
                </div>
            )}


            {/* DETAIL VIEW */}
            {view === 'detail' && selectedProduct && (
                <div id="inventory-detail-view" className="bg-gray-50 min-h-screen pb-10">

                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBackToList} className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h1>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className="text-gray-400">Ana SKU:</span>
                                    <span className="font-mono font-medium text-gray-600 bg-gray-100 px-1.5 rounded">{selectedProduct.sku}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-400">Marka:</span>
                                    <span className="font-bold text-indigo-600">{selectedProduct.brand}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-400">Kategori:</span>
                                    <span id="detail-category-header" className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{selectedProduct.category}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Yayında</span>
                            <a href={selectedProduct.ikasSlug ? `https://gesketurkiye.com/${selectedProduct.ikasSlug}` : `https://gesketurkiye.com/arama?q=${selectedProduct.sku}`} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                                Web'de Gör
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        </div>
                    </div>

                    <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

                        {/* COLUMN 1: Visuals */}
                        <div className="lg:col-span-3 flex flex-col gap-6">

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                <div className="relative group aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mb-4">
                                    <img id="detail-img" src={selectedProduct.detailImg || selectedProduct.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />

                                    <button onClick={openStudioModal} className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-white/50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all transform hover:scale-105 z-10">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                        <span>AI Studio</span>
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Varyantlar</p>
                                    <div className="flex flex-wrap gap-2" id="detail-variants">
                                        <span className="w-6 h-6 rounded-full bg-black border border-gray-200 cursor-pointer ring-2 ring-offset-1 ring-gray-300"></span>
                                        <span className="w-6 h-6 rounded-full bg-gray-400 border border-gray-200 cursor-pointer"></span>
                                        <span className="w-6 h-6 rounded-full bg-white border border-gray-200 cursor-pointer"></span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9px] text-gray-400 block uppercase">Eklenme</span>
                                        <span id="detail-date-added" className="text-xs font-bold text-gray-700">{selectedProduct.createdAt || '...'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-gray-400 block uppercase">Son Satış</span>
                                        <span id="detail-date-sold" className="text-xs font-bold text-indigo-600">Bugün</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 flex-1">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">SEO Ayarları</h3>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Slug</p>
                                    <p id="detail-slug" className="text-xs text-gray-600 font-mono bg-gray-50 p-1.5 rounded border border-gray-100 mt-1 truncate">/{selectedProduct.metaData?.slug || selectedProduct.ikasSlug || `urun-${selectedProduct.id}`}</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Meta Title</p>
                                        <button onClick={() => triggerFieldAI('title')} className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors" disabled={loadingField === 'title'}>{loadingField === 'title' ? '...' : '✨ AI'}</button>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-snug font-medium" id="current-meta-title">{selectedProduct.metaData?.title}</p>
                                    {aiResults.title && (
                                        <div id="ai-res-title-box" className="mt-2 relative">
                                            <input type="text" id="ai-res-title" readOnly className="w-full text-xs bg-indigo-50 border border-indigo-200 rounded p-1.5" value={aiResults.title} />
                                            <button onClick={() => copyField(aiResults.title, 'title')} className="absolute right-1 top-1 text-gray-400 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Meta Description</p>
                                        <button onClick={() => triggerFieldAI('desc')} className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors" disabled={loadingField === 'desc'}>{loadingField === 'desc' ? '...' : '✨ AI'}</button>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-snug line-clamp-3" id="current-meta-desc">{selectedProduct.metaData?.description}</p>
                                    {aiResults.desc && (
                                        <div id="ai-res-desc-box" className="mt-2 relative">
                                            <textarea id="ai-res-desc" readOnly className="w-full text-xs bg-indigo-50 border border-indigo-200 rounded p-1.5 h-16 resize-none" value={aiResults.desc}></textarea>
                                            <button onClick={() => copyField(aiResults.desc, 'desc')} className="absolute right-1 top-1 text-gray-400 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: Content */}
                        <div className="lg:col-span-5 flex flex-col gap-6">

                            {/* COMPONENT: Product Health Score */}
                            {(() => {
                                // 1. Profitability (Weight 25%) - Skar = (Margin / 30) * 100 (Capped at 100)
                                const scoreProfit = Math.min(100, Math.max(0, (selectedProduct.margin / 30) * 100));

                                // 2. Revenue Contribution (Weight 20%) - Sciro: Product Rev / Store Rev.
                                const productRevenue = (selectedProduct.sales30Days || 0) * selectedProduct.price;
                                const storeTotalRevenue = selectedProduct.storeTotalRevenue || 1500000;
                                const revenueShare = (productRevenue / storeTotalRevenue) * 100;
                                // Logic: If share > 5%, it's an A-Class product (100pts).
                                const scoreRevenue = Math.min(100, (revenueShare / 5) * 100);

                                // 3. Competitiveness (Weight 20%) - Srek = 1 - ((Price - MinCompetitor) / MinCompetitor)
                                const minComp = selectedProduct.competitorPrice || selectedProduct.price;
                                let scoreCompetition = 0;
                                if (selectedProduct.price <= minComp) {
                                    scoreCompetition = 100;
                                } else {
                                    // Penalty: lose 5 points for every 1% more expensive
                                    const diffPercent = ((selectedProduct.price - minComp) / minComp) * 100;
                                    scoreCompetition = Math.max(0, 100 - (diffPercent * 5));
                                }

                                // 4. Velocity (Weight 20%) - Svel = (Avg3Day * 0.7) + (Avg30Day * 0.3)
                                const avg3 = (selectedProduct.salesLast3Days || 0) / 3;
                                const avg30 = (selectedProduct.salesLast30Days || selectedProduct.sales30Days || 0) / 30;
                                const wma = (avg3 * 0.7) + (avg30 * 0.3);
                                // Logic: Target velocity = 10 units/day (100pts)
                                const scoreVelocity = Math.min(100, (wma / 10) * 100);

                                // 5. Stock Health (Weight 15%) - Stock Cover = Stock / (DailyVelocity * LeadTime)
                                const dailyVel = avg30 || 1;
                                const leadTime = selectedProduct.leadTime || 14;
                                const stockCover = selectedProduct.stock / (dailyVel * leadTime);
                                // Logic: Perfect is 1.5. Distance from 1.5 reduces score.
                                let scoreStock = 100;
                                if (stockCover < 1) scoreStock = 50 * stockCover; // Risk of OOS
                                else if (stockCover > 3) scoreStock = Math.max(0, 100 - ((stockCover - 3) * 20)); // Overstock penalty


                                // Composite Score
                                const finalScore = Math.round(
                                    (scoreProfit * 0.25) +
                                    (scoreRevenue * 0.20) +
                                    (scoreCompetition * 0.20) +
                                    (scoreVelocity * 0.20) +
                                    (scoreStock * 0.15)
                                );

                                let gradeColor = "bg-red-500";
                                let gradeText = "Kritik (D)";
                                if (finalScore >= 85) { gradeColor = "bg-emerald-500"; gradeText = "Mükemmel (A+)"; }
                                else if (finalScore >= 70) { gradeColor = "bg-blue-500"; gradeText = "İyi (B)"; }
                                else if (finalScore >= 50) { gradeColor = "bg-yellow-500"; gradeText = "Orta (C)"; }

                                return (
                                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl shadow-lg p-6 text-white mb-6 relative overflow-hidden animate-fade-in-up">
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Ürün Sağlık Skoru</h3>
                                                <p className="text-[10px] text-indigo-300 mt-1">5 Temel metriğin ağırlıklı analizi</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-black tracking-tighter" id="score-final">{finalScore}</div>
                                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block ${gradeColor}`} id="score-grade">{gradeText}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 mt-6 pt-6 border-t border-white/10">

                                            <div className="text-center group">
                                                <div className="relative w-full h-1.5 bg-indigo-950/50 rounded-full mb-2 overflow-hidden">
                                                    <div id="bar-profit" className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${scoreProfit}%` }}></div>
                                                </div>
                                                <span className="block text-[9px] text-indigo-300 uppercase font-bold mb-0.5">Kârlılık</span>
                                                <span id="val-profit" className="text-xs font-bold text-white">%{Math.round(selectedProduct.margin)}</span>
                                            </div>

                                            <div className="text-center group">
                                                <div className="relative w-full h-1.5 bg-indigo-950/50 rounded-full mb-2 overflow-hidden">
                                                    <div id="bar-revenue" className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${scoreRevenue}%` }}></div>
                                                </div>
                                                <span className="block text-[9px] text-indigo-300 uppercase font-bold mb-0.5">Ciro Payı</span>
                                                <span id="val-revenue" className="text-xs font-bold text-white">%{revenueShare.toFixed(2)}</span>
                                            </div>

                                            <div className="text-center group">
                                                <div className="relative w-full h-1.5 bg-indigo-950/50 rounded-full mb-2 overflow-hidden">
                                                    <div id="bar-competitor" className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${scoreCompetition}%` }}></div>
                                                </div>
                                                <span className="block text-[9px] text-indigo-300 uppercase font-bold mb-0.5">Rekabet</span>
                                                <span id="val-competitor" className="text-xs font-bold text-white">{selectedProduct.price <= minComp ? "Lider" : `%${((selectedProduct.price / minComp) - 1) * 100 | 0} Pahalı`}</span>
                                            </div>

                                            <div className="text-center group">
                                                <div className="relative w-full h-1.5 bg-indigo-950/50 rounded-full mb-2 overflow-hidden">
                                                    <div id="bar-velocity" className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${scoreVelocity}%` }}></div>
                                                </div>
                                                <span className="block text-[9px] text-indigo-300 uppercase font-bold mb-0.5">Hız (WMA)</span>
                                                <span id="val-velocity" className="text-xs font-bold text-white">{wma.toFixed(1)}/gün</span>
                                            </div>

                                            <div className="text-center group">
                                                <div className="relative w-full h-1.5 bg-indigo-950/50 rounded-full mb-2 overflow-hidden">
                                                    <div id="bar-stock" className="h-full bg-teal-400 rounded-full transition-all duration-1000" style={{ width: `${scoreStock}%` }}></div>
                                                </div>
                                                <span className="block text-[9px] text-indigo-300 uppercase font-bold mb-0.5">Stok Cover</span>
                                                <span id="val-stock" className="text-xs font-bold text-white">{stockCover.toFixed(1)}x</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 shrink-0">
                                    <h3 className="text-sm font-bold text-gray-900">Ürün Açıklaması</h3>
                                    <button onClick={() => triggerFieldAI('main-desc')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors" disabled={loadingField === 'main-desc'}>
                                        {loadingField === 'main-desc' ? 'Optimize Ediliyor...' : '✨ AI ile Optimize Et'}
                                    </button>
                                </div>
                                <div id="detail-desc" dangerouslySetInnerHTML={{ __html: selectedProduct.description }} className="prose prose-sm max-w-none text-gray-600 text-xs leading-relaxed max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                </div>

                                {aiResults.mainDesc && (
                                    <div id="ai-res-main-desc-box" className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-up">
                                        <div className="relative">
                                            <textarea id="ai-res-main-desc" readOnly className="w-full h-32 bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-lg p-3 text-xs text-gray-800 resize-none focus:outline-none" value={aiResults.mainDesc}></textarea>
                                            <button onClick={() => copyField(aiResults.mainDesc, 'mainDesc')} className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-indigo-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>

                        {/* COLUMN 3: Commercial */}
                        <div className="lg:col-span-4 flex flex-col gap-6">

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-900">Stok Durumu</h3>
                                    <span id="detail-stock-status-badge" className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedProduct.available < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {selectedProduct.available === 0 ? 'Tükendi' : (selectedProduct.available < 50 ? 'Toparlanıyor' : 'Yeterli')}
                                    </span>
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span id="detail-stock-available" className="text-3xl font-extrabold text-gray-900">{selectedProduct.available}</span>
                                    <span className="text-xs text-gray-500 font-medium">Kullanılabilir</span>
                                </div>

                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div id="detail-stock-bar" className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min((selectedProduct.available / 500) * 100, 100)}%` }}></div>
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>Fiziksel: <strong id="detail-stock-total" className="text-gray-900">{selectedProduct.stock}</strong></span>
                                    <span>Rezerve: <strong id="detail-stock-reserved" className="text-orange-600">{selectedProduct.reserved}</strong></span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Satış Hızı</h3>
                                        <p className="text-[10px] text-gray-400">Son 7 Günlük İvme</p>
                                    </div>
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Yüksek</span>
                                </div>

                                <div className="flex items-end justify-between mt-4">
                                    <div>
                                        <span id="detail-sales-total" className="text-2xl font-bold text-gray-900">{selectedProduct.sales30Days}</span>
                                        <span className="text-[10px] text-gray-500 block">Toplam Satış</span>
                                    </div>
                                    <div className="text-right">
                                        <span id="detail-sales-daily" className="text-sm font-bold text-gray-700">{selectedProduct.dailySalesAverage}</span>
                                        <span className="text-[10px] text-gray-400 block uppercase">Günlük Ort.</span>
                                    </div>
                                </div>

                                <div className="relative mt-4 h-16 w-full flex items-end justify-between gap-1" id="detail-sales-chart-bars">
                                    {(() => {
                                        const salesData = selectedProduct.last7DaysSales || [];
                                        const maxSale = Math.max(...salesData, 1);
                                        return (salesData.length ? salesData : Array(7).fill(0)).map((val, index) => {
                                            const heightPercent = Math.max(15, (val / maxSale) * 100);
                                            return (
                                                <div key={index} className="flex-1 bg-purple-200 rounded-t-sm hover:bg-purple-500 transition-colors" style={{ height: `${heightPercent}%` }}></div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-900">Kârlılık</h3>
                                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">Kârlı</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-100">
                                        <span className="block text-[9px] text-gray-400 uppercase">Fiyat</span>
                                        <span id="detail-price-current" className="text-xs font-bold text-gray-900">₺{selectedProduct.price}</span>
                                    </div>
                                    <div className="text-center p-2 bg-emerald-50 rounded border border-emerald-100">
                                        <span className="block text-[9px] text-emerald-600 uppercase">Kâr</span>
                                        <span id="detail-net-profit" className="text-xs font-bold text-emerald-700">₺{selectedProduct.netProfit}</span>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                        <span className="block text-[9px] text-blue-600 uppercase">Marj</span>
                                        <span id="detail-margin" className="text-xs font-bold text-blue-700">%{selectedProduct.margin}</span>
                                    </div>
                                </div>

                                <div id="chart-wrapper" className="relative h-24 w-full bg-white rounded border border-gray-100 overflow-hidden">
                                    <div id="detail-price-chart" className="absolute inset-0 h-full w-full" style={{ isolation: 'isolate' }}>
                                        {renderChart()}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center shrink-0">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase">Kanal Dağılımı</h3>
                                </div>
                                <div className="divide-y divide-gray-50 text-[11px] overflow-y-auto bg-white flex-1 min-h-[100px]" id="channel-matrix-container">
                                    {selectedProduct.channels?.map((ch, idx) => (
                                        <div key={idx} className="px-4 py-2 flex justify-between items-center">
                                            <span className="font-bold text-gray-700">{ch.name}</span>
                                            <span className="text-gray-500">₺{ch.price}</span>
                                        </div>
                                    ))}
                                    {(!selectedProduct.channels || selectedProduct.channels.length === 0) && (
                                        <div className="px-4 py-2 text-gray-400 italic">Kanal yok</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* AI STUDIO MODAL */}
                    {isStudioModalOpen && (
                        <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={closeStudioModal}></div>

                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="relative transform overflow-hidden rounded-2xl bg-gray-900 text-left shadow-2xl transition-all w-full max-w-5xl border border-gray-800 animate-fadeIn">

                                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-white">AI Image Studio</h3>
                                        </div>
                                        <button onClick={closeStudioModal} className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">

                                        <div className="bg-black/50 p-8 flex items-center justify-center relative border-r border-gray-800">
                                            <div className="relative w-full aspect-square max-w-md rounded-xl overflow-hidden border border-gray-700 shadow-2xl group">
                                                <img src={generatedImage || selectedProduct.detailImg || selectedProduct.img} className="w-full h-full object-cover" alt="Studio Preview" />

                                                {generatedImage && !isImageGenerating && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.preventDefault(); window.open(generatedImage, '_blank'); }} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                            <span>Görseli İndir</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {isImageGenerating && (
                                                    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20">
                                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                        <p className="text-indigo-400 text-xs font-mono animate-pulse">Pikseller işleniyor...</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                                <p className="text-xs text-gray-500 font-mono">Referans Görsel Yüklendi</p>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-gray-900 flex flex-col">
                                            <div className="flex-grow space-y-6">

                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="block text-sm font-bold text-gray-300">Prompt (İstemi Yazın)</label>
                                                        {studioPrompt && (
                                                            <button onClick={() => setStudioPrompt('')} className="text-xs text-gray-500 hover:text-white transition-colors">
                                                                Temizle
                                                            </button>
                                                        )}
                                                    </div>
                                                    <textarea
                                                        value={studioPrompt}
                                                        onChange={(e) => setStudioPrompt(e.target.value)}
                                                        placeholder="Örn: Cyberpunk tarzında, neon ışıklı stüdyo ortamı, 4k çözünürlük..."
                                                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                                                    ></textarea>
                                                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                                        <span onClick={() => setStudioPrompt(p => p + " Neon Işıklar")} className="cursor-pointer text-xs bg-gray-800 text-indigo-400 px-2 py-1 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors whitespace-nowrap">+ Neon</span>
                                                        <span onClick={() => setStudioPrompt(p => p + " Minimal Beyaz")} className="cursor-pointer text-xs bg-gray-800 text-indigo-400 px-2 py-1 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors whitespace-nowrap">+ Minimal</span>
                                                        <span onClick={() => setStudioPrompt(p => p + " Lüks Mermer")} className="cursor-pointer text-xs bg-gray-800 text-indigo-400 px-2 py-1 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors whitespace-nowrap">+ Lüks</span>
                                                        <span onClick={() => setStudioPrompt(p => p + " Doğa Ortamı")} className="cursor-pointer text-xs bg-gray-800 text-indigo-400 px-2 py-1 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors whitespace-nowrap">+ Doğa</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={generateStudioImage}
                                                    disabled={!studioPrompt || isImageGenerating}
                                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                                >
                                                    {isImageGenerating ? 'Görsel Oluşturuluyor...' : '✨ AI İle Görsel Üret'}
                                                </button>

                                            </div>

                                            {generatedImage && (
                                                <div className="border-t border-gray-800 pt-6 mt-6 animate-fadeIn">
                                                    <div className="flex gap-4">
                                                        <button onClick={applyAIImage} className="flex-1 bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                                            Ürüne Uygula
                                                        </button>
                                                        <button onClick={() => setGeneratedImage(null)} className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors">
                                                            Vazgeç
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
