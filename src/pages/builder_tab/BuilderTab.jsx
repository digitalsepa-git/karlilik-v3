import React, { useState } from 'react';
import { 
    LayoutDashboard, Plus, Search, BarChart2, PieChart, LineChart, 
    Settings, Undo, Redo, Play, Save, Share2, Download, MoreHorizontal,
    X, Grid, Image as ImageIcon, Type, Target, Map, Wand2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Responsive as ResponsiveGridLayout, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ResponsiveGridLayout);
// --- STUB COMPONENTS FOR SPRINTS ---

const BuilderHeader = ({ dashboardName, hasUnsaved, setMode, mode }) => (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#EDEDF0] bg-white">
        <div className="flex items-center gap-4">
            <input 
                type="text" 
                defaultValue={dashboardName} 
                className="text-lg font-bold text-[#0F1223] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#514BEE] rounded px-2 -ml-2"
            />
            {hasUnsaved && <span className="flex items-center gap-1.5 justify-center py-0.5 px-2 bg-amber-50 rounded-full border border-amber-200 text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Kaydedilmedi
            </span>}
        </div>
        <div className="flex items-center gap-2">
            <div className="flex border border-[#EDEDF0] rounded-lg bg-[#FAFAFB] p-0.5 mr-2">
                <button title="Geri Al" className="p-1.5 text-[#B4B4C8] hover:text-[#0F1223] transition-colors rounded"><Undo size={16} /></button>
                <button title="İleri Al" className="p-1.5 text-[#B4B4C8] hover:text-[#0F1223] transition-colors rounded"><Redo size={16} /></button>
            </div>
            
            <button
                onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
                className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-colors", 
                    mode === 'preview' ? "bg-[#514BEE] text-white border-[#514BEE]" : "bg-white text-[#0F1223] border-[#EDEDF0] hover:bg-[#FAFAFB]"
                )}
            >
                {mode === 'preview' ? <><Settings size={14} /> Düzenle</> : <><Play size={14} fill="currentColor" /> Önizle</>}
            </button>
            
            <button className="px-3 py-1.5 rounded-lg bg-white border border-[#EDEDF0] text-[#0F1223] text-sm font-semibold hover:bg-[#FAFAFB] flex items-center gap-2 shadow-sm">
                <Save size={14} /> Kaydet
            </button>
            
            <div className="h-6 w-px bg-[#EDEDF0] mx-1"></div>
            
            <button className="p-2 rounded-lg text-[#7D7DA6] hover:bg-[#FAFAFB] hover:text-[#0F1223]"><Share2 size={16} /></button>
            <button className="p-2 rounded-lg text-[#7D7DA6] hover:bg-[#FAFAFB] hover:text-[#0F1223]"><Download size={16} /></button>
            <button className="p-2 rounded-lg text-[#7D7DA6] hover:bg-[#FAFAFB] hover:text-[#0F1223]"><MoreHorizontal size={16} /></button>
        </div>
    </div>
);

const FilterBar = () => (
    <div className="px-6 py-2 border-b border-[#EDEDF0] bg-[#FAFAFB] flex items-center gap-2 overflow-x-auto hide-scrollbar">
        <span className="text-[10px] font-bold text-[#B4B4C8] uppercase tracking-wider mr-2">Global Filtreler:</span>
        <div className="flex items-center gap-1.5 bg-white border border-[#EDEDF0] rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer hover:border-[#B4B4C8]">
            <span className="text-[#7D7DA6]">Tarih:</span> <span>Son 30 Gün</span>
        </div>
        <button className="flex items-center justify-center w-7 h-7 rounded-lg border border-dashed border-[#B4B4C8] text-[#7D7DA6] hover:text-[#514BEE] hover:border-[#514BEE] hover:bg-[#F3F1FF] transition-all">
            <Plus size={14} />
        </button>
    </div>
);

const WidgetLibrary = () => {
    const categories = [
        { name: "KPI & Metrik", items: [ {icon: Grid, label: "KPI Kartı"}, {icon: Target, label: "Hedef Göstergesi"}, {icon: LineChart, label: "Sparkline"} ] },
        { name: "Grafikler", items: [ {icon: LineChart, label: "Line Chart"}, {icon: BarChart2, label: "Bar Chart"}, {icon: PieChart, label: "Pie Chart"} ] },
        { name: "Tablo & Liste", items: [ {icon: LayoutDashboard, label: "Data Tablosu"}, {icon: LayoutDashboard, label: "Pivot Tablo"} ] },
        { name: "Metin & Medya", items: [ {icon: Type, label: "Başlık"}, {icon: ImageIcon, label: "Görsel"} ] }
    ];

    return (
        <div className="w-60 bg-white border-r border-[#EDEDF0] flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-[#EDEDF0]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 text-[#B4B4C8]" size={14} />
                    <input type="text" placeholder="Widget Ara..." className="w-full pl-8 pr-3 py-2 bg-[#FAFAFB] border border-[#EDEDF0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#514BEE]" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {categories.map((cat, i) => (
                    <div key={i}>
                        <h4 className="text-[10px] font-bold text-[#7D7DA6] uppercase tracking-wider mb-2">{cat.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {cat.items.map((item, j) => (
                                <div 
                                    key={j} 
                                    draggable={true}
                                    unselectable="on"
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("widgetType", item.label.toLowerCase().replace(' ', '_'));
                                    }}
                                    className="bg-[#FAFAFB] border border-[#EDEDF0] rounded-lg p-2.5 flex flex-col items-center justify-center text-center cursor-grab hover:border-[#514BEE] hover:shadow-sm transition-all group"
                                >
                                    <item.icon size={18} className="text-[#7D7DA6] mb-1.5 group-hover:text-[#514BEE]" />
                                    <span className="text-[10px] font-medium text-[#0F1223] leading-tight">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PropertyInspector = ({ activeWidget, onClose }) => {
    if (!activeWidget) return null;
    
    return (
        <div className="w-80 bg-white border-l border-[#EDEDF0] flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-200 shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-[#EDEDF0]">
                <div>
                    <h3 className="font-bold text-[#0F1223] text-sm">Widget Ayarları</h3>
                    <p className="text-[10px] text-[#7D7DA6]">KPI Kartı Seçili</p>
                </div>
                <button onClick={onClose} className="text-[#B4B4C8] hover:text-[#0F1223]"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="space-y-5">
                    <div>
                        <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Genel</label>
                        <input type="text" defaultValue="Toplam Ciro" className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Veri Kaynağı</label>
                        <select className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white">
                            <option>Siparişler (Orders)</option>
                            <option>Müşteriler</option>
                            <option>Ürünler</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Metrik</label>
                        <div className="flex gap-2">
                            <select className="flex-1 text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white">
                                <option>Toplam (SUM)</option>
                                <option>Ortalama (AVG)</option>
                            </select>
                            <select className="flex-1 text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white">
                                <option>Revenue</option>
                                <option>Quantity</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TemplateGallery = ({ onSelect }) => {
    const templates = [
        { id: 'fin', emoji: '💰', title: 'Finansal Özet', desc: '6 widget • Ciro, kâr, nakit akışı, giderler' },
        { id: 'com', emoji: '🛒', title: 'Satış Performans', desc: '8 widget • Kanal, ürün, trend, kampanya ROI' },
        { id: 'cus', emoji: '👥', title: 'Müşteri Analizi', desc: '7 widget • RFM, LTV, cohort, segment' },
        { id: 'ops', emoji: '📦', title: 'Operasyon Durumu', desc: '6 widget • Stok, kargo, iade, NPS' },
    ];

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#FAFAFB] p-8 overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#EDEDF0] shadow-sm flex items-center justify-center mb-6">
                <Wand2 size={28} className="text-[#514BEE]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F1223] mb-2 tracking-tight">Özel Dashboard'unuzu İnşa Edin</h2>
            <p className="text-[#7D7DA6] text-center max-w-lg mb-10 text-sm leading-relaxed">
                Rapor Merkezi Builder, kendi metrik kombinasyonlarınızı ve görsellerinizi özgürce drag & drop ile tuvale yerleştirmenize olanak tanır.
            </p>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {templates.map(t => (
                    <div key={t.id} className="bg-white border border-[#EDEDF0] rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group" onClick={() => onSelect(t.id)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-3xl">{t.emoji}</div>
                            <span className="text-[10px] uppercase font-bold text-[#514BEE] opacity-0 group-hover:opacity-100 transition-opacity">Şablonu Uygula &rarr;</span>
                        </div>
                        <h4 className="font-bold text-[#0F1223] mb-1">{t.title}</h4>
                        <p className="text-xs text-[#7D7DA6]">{t.desc}</p>
                    </div>
                ))}
            </div>

            <button onClick={() => onSelect('blank')} className="px-6 py-3 bg-white border border-[#EDEDF0] rounded-xl font-bold text-[#0F1223] hover:bg-[#F3F1FF] hover:text-[#514BEE] hover:border-[#514BEE] transition-all shadow-sm">
                🎨 Boş Tuvalden Başla
            </button>
        </div>
    );
};

const Canvas = ({ mode, widgets, setWidgets, hasWidgets, onEmptyStart, setActiveWidget, activeWidget }) => {
    
    // A mapping function to render the "widget insides"
    const renderWidgetContent = (w) => {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white border border-[#EDEDF0] rounded-lg shadow-sm hover:border-[#514BEE] transition-colors relative group">
                <span className="text-xs font-semibold text-[#0F1223]">{w.type?.toUpperCase()} Widget</span>
                {mode === 'edit' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] bg-[#FAFAFB] border border-[#EDEDF0] px-2 py-0.5 rounded text-[#7D7DA6]">w_{w.i.substr(0,4)}</span>
                    </div>
                )}
            </div>
        );
    };

    const handleLayoutChange = (newLayout) => {
        // Sync the internal layout changes back to widgets state
        const updatedWidgets = widgets.map(w => {
            const layoutItem = newLayout.find(l => l.i === w.i);
            return layoutItem ? { ...w, layoutInfo: layoutItem } : w;
        });
        setWidgets(updatedWidgets);
    };

    const onDrop = (layout, layoutItem, _event) => {
        // The dataTransfer holds the widget type
        const type = _event.dataTransfer?.getData("widgetType") || "kpi";
        
        const newWidget = {
            i: `w_${Date.now()}`,
            type: type,
            layoutInfo: { ...layoutItem, i: `w_${Date.now()}` },
            config: {}
        };
        
        setWidgets(prev => [...prev, newWidget]);
    };

    return (
        <div className="flex-1 bg-[#FAFAFB] relative overflow-auto custom-scrollbar">
            {!hasWidgets ? (
                <TemplateGallery onSelect={onEmptyStart} />
            ) : (
                <div className="min-h-[800px] pb-24">
                    {mode === 'edit' && widgets.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-[#A1A1AA] pointer-events-none">
                            <div className="w-full h-full border-2 border-dashed border-[#EDEDF0] rounded-2xl flex flex-col items-center justify-center bg-white/50">
                                <Plus size={32} className="mb-4 text-[#D4D4D8]" />
                                <p className="font-semibold text-sm">Widget'ları buraya sürükleyin</p>
                                <p className="text-xs mt-1">Sol panelden bir bileşen seçip tuvale bırakın</p>
                            </div>
                        </div>
                    )}
                    <ResponsiveGrid
                        className="layout min-h-[600px] w-full"
                        layouts={{ lg: widgets.map(w => w.layoutInfo) }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={80}
                        onLayoutChange={handleLayoutChange}
                        onDrop={onDrop}
                        isDroppable={mode === 'edit'}
                        isDraggable={mode === 'edit'}
                        isResizable={mode === 'edit'}
                        compactType={null} 
                        useCSSTransforms={true}
                    >
                        {widgets.map((w) => (
                            <div 
                                key={w.i} 
                                data-grid={w.layoutInfo}
                                onClick={() => mode === 'edit' && setActiveWidget(w)}
                                style={{
                                    outline: activeWidget?.i === w.i ? '2px solid #514BEE' : 'none',
                                    outlineOffset: '2px',
                                    borderRadius: '8px'
                                }}
                            >
                                {renderWidgetContent(w)}
                            </div>
                        ))}
                    </ResponsiveGrid>
                </div>
            )}
        </div>
    );
};

export const BuilderTab = () => {
    const [mode, setMode] = useState('edit');
    const [widgets, setWidgets] = useState([]);
    const [activeWidget, setActiveWidget] = useState(null); // null if closed
    const [hasWidgets, setHasWidgets] = useState(false);

    const handleTemplateSelect = (id) => {
        setHasWidgets(true);
        if (id === 'blank') {
            setWidgets([]);
        } else {
            // Load a dummy template array for demonstration
            setWidgets([
                { i: 'w_1', type: 'kpi', layoutInfo: { i: 'w_1', x: 0, y: 0, w: 3, h: 2 } },
                { i: 'w_2', type: 'chart', layoutInfo: { i: 'w_2', x: 3, y: 0, w: 9, h: 4 } },
                { i: 'w_3', type: 'table', layoutInfo: { i: 'w_3', x: 0, y: 4, w: 12, h: 5 } }
            ]);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden text-sm font-sans bg-white border border-[#EDEDF0] rounded-xl shadow-sm mb-4 mx-4 min-h-[800px]">
            <BuilderHeader 
                dashboardName="Ads & Rev Ops Takip"
                hasUnsaved={widgets.length > 0}
                mode={mode}
                setMode={setMode}
            />
            <FilterBar />
            
            <div className="flex-1 flex overflow-hidden relative">
                {/* SOL PANEL (Library) */}
                {mode === 'edit' && <WidgetLibrary />}
                
                {/* ORTA PANEL (Canvas) */}
                <Canvas 
                    mode={mode} 
                    widgets={widgets}
                    setWidgets={setWidgets}
                    hasWidgets={hasWidgets} 
                    onEmptyStart={handleTemplateSelect} 
                    activeWidget={activeWidget}
                    setActiveWidget={setActiveWidget}
                />
                
                {/* SAĞ PANEL (Property Inspector) */}
                {mode === 'edit' && activeWidget && (
                    <PropertyInspector activeWidget={activeWidget} onClose={() => setActiveWidget(null)} />
                )}
            </div>

            {/* Global Styles for Scrollbars in this tab */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #EDEDF0; border-radius: 10px; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};
