import React, { useState, useEffect } from 'react';
import {
    Check, ArrowRight, TrendingUp, Shield, BarChart3, PieChart, X,
    AlertTriangle, Zap, Headset, Bot, Shirt, ShoppingBag,
    Globe, Users, Menu, Star
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- MVP Components ---

const ProblemSection = () => (
    <section className="py-24 bg-slate-50 relative z-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                
                {/* Left: The Problem */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-600 text-xs font-bold mb-6 hover:bg-red-200 transition-colors">
                        <AlertTriangle className="h-4 w-4" />
                        ESKİ YÖNTEM
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                        Karanlıkta Yürümeyin <br />
                        <span className="text-red-500">Kâr Ettiğinizi Sanırken Batmayın.</span>
                    </h2>
                    
                    <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-lg">
                        Karışık Excel dosyaları, iade kesintileri ve hesaplanamayan kargo maliyetleri. Günün sonunda cebinize ne kadar kaldığını gerçekten biliyor musunuz?
                    </p>

                    <div className="space-y-6 w-full max-w-md">
                        {/* Messy Card 1 */}
                        <div className="p-5 bg-white border border-red-100 rounded-xl flex items-start gap-4 hover:border-red-300 transition-colors transform -rotate-1 hover:rotate-0 hover:scale-105 duration-300 shadow-sm w-full">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-1">
                                <span className="text-red-500 font-bold text-xl">?</span>
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900">Hangi ürün gerçekten kârlı?</h4>
                                <p className="text-sm text-slate-500 mb-1">Ciro yüksek ama banka hesabı boş. Kaçak nerede?</p>
                                <span className="text-[10px] font-mono text-red-400 block px-2 py-0.5 bg-red-50 rounded w-max mt-2">#HATA! #DEĞER!</span>
                            </div>
                        </div>

                        {/* Messy Card 2 */}
                        <div className="p-5 bg-white border border-orange-100 rounded-xl flex items-start gap-4 hover:border-orange-300 transition-colors transform rotate-1 hover:rotate-0 hover:scale-105 duration-300 shadow-sm w-full ml-auto">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-1">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900">İade maliyetleri ne kadar?</h4>
                                <p className="text-sm text-slate-500 mb-1">Kargo ve komisyon kesintileri kârınızı sessizce eritiyor.</p>
                                <span className="text-[10px] font-mono text-orange-400 block px-2 py-0.5 bg-orange-50 rounded w-max mt-2">#REF!</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: The Solution */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:bg-emerald-100"></div>
                    
                    <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold mb-6 hover:bg-emerald-200 transition-colors">
                            <Check className="h-4 w-4" />
                            FINOPS YÖNTEMİ
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            Veriye Dayalı Netlik
                        </h2>

                        <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                            Tek bir ekranda tüm operasyonel maliyetleri, net kârınızı ve büyüme fırsatlarını görün. Artık tahmin yok, sadece strateji var.
                        </p>

                        {/* Holy Card (Light Theme) */}
                        <div className="p-6 bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/5 w-full max-w-md group-hover:border-emerald-300 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl flex items-center justify-center -mt-10 -mr-10"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="z-10 relative">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Net Kâr (Bu Ay)</div>
                                    <div className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        ₺42.500
                                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full flex items-center border border-emerald-200 shadow-sm animate-pulse">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            %12.4
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 z-10 relative text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1 shadow-sm">
                                    <Zap className="h-3 w-3" />
                                    Kârlılık Artıyor
                                </div>
                            </div>

                            <div className="space-y-3 z-10 relative">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600 font-semibold">Hedef: ₺50.000</span>
                                        <span className="text-emerald-600 font-bold">%85 Tamamlandı</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-[85%] rounded-full shadow-inner"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
);

const ComparisonTable = () => (
    <div className="bg-white py-24 relative z-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-16">
                Hangi Taraftasınız?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-[1000px] mx-auto">
                {/* Left Side (Eski Yöntem) */}
                <div className="p-8 md:p-10 bg-slate-50 border border-slate-200 rounded-3xl opacity-90 hover:opacity-100 transition-opacity flex flex-col h-full hover:shadow-lg duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <AlertTriangle className="h-6 w-6 text-slate-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-600">Eski Yöntem</h4>
                    </div>

                    <ul className="space-y-6 flex-1 text-slate-700 font-medium">
                        <li className="flex items-start gap-4">
                            <X className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-slate-800 text-lg">Haftada 5+ Saat Giriş</div>
                                <div className="text-sm text-slate-500">Her pazartesi aynı manuel veri yükleme stresi.</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <X className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-slate-800 text-lg">Yüksek Hata Riski</div>
                                <div className="text-sm text-slate-500">Tek bir hatalı Excel formülü net kârı tamamen silebilir.</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <X className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-slate-800 text-lg">Tahmini Karar</div>
                                <div className="text-sm text-slate-500">Eksik veri yüzünden tamamen içgüdülerle yönetim.</div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Right Side (FinOps) */}
                <div className="relative group flex flex-col h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative flex-1 bg-white border border-indigo-100 rounded-3xl p-8 md:p-10 shadow-xl flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                <Check className="h-7 w-7 text-white" />
                            </div>
                            <h4 className="text-2xl font-bold text-slate-900">FinOps Yöntemi</h4>
                        </div>

                        <ul className="space-y-6 flex-1 text-slate-800 font-medium">
                            <li className="flex items-start gap-4">
                                <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 text-lg">Sıfır Saat (Tam Otomatik)</div>
                                    <div className="text-sm text-slate-600">Arkanıza yaslanın. API entegrasyonu ile kendi çalışır.</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 text-lg">%100 Kurumsal Doğruluk</div>
                                    <div className="text-sm text-slate-600">Tüm iadeler, kargo ve komisyonlar kuruşuna kadar net.</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 text-lg">Veriye Dayalı Aksiyon</div>
                                    <div className="text-sm text-slate-600">Hangi ürün zararda, hangisi kârlı anında görün.</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    </div>
);

const AIAssistantDemo = () => {
    const [messages, setMessages] = useState([]);
    const [textIndex, setTextIndex] = useState(0);

    const CONVERSATIONS = [
        [
            { id: 1, text: "Bu ay kargoda kâr kaybımız var mı?", sender: 'user', delay: 500 },
            { id: 2, text: "Analiz ediyorum...", sender: 'ai', delay: 1500, typing: true },
            { id: 3, text: "Evet, kargo firması A ile gönderilen hacimli ürünlerde iade oranı %12 artmış. ⚠️ Düşük desi kotalarını aşmış olabilirsiniz.", sender: 'ai', delay: 3000 }
        ],
        [
            { id: 1, text: "En zarar ettiren ürünümüz hangisi?", sender: 'user', delay: 500 },
            { id: 2, text: "Verileri tarıyorum...", sender: 'ai', delay: 1500, typing: true },
            { id: 3, text: "Yazlık T-Shirt modelinin yüksek iade oranı ve reklam harcaması sebebiyle sipariş başına net 20₺ zarar yazıyor. Satışları durdurmalısınız. 🛑", sender: 'ai', delay: 3000 }
        ],
        [
            { id: 1, text: "Nakit akışını rahatlatacak stok var mı?", sender: 'user', delay: 500 },
            { id: 2, text: "Stok kontrolü yapılıyor...", sender: 'ai', delay: 1500, typing: true },
            { id: 3, text: "Depoda 6 aydır hareketsiz duran 85.000₺ değerinde ürün stoğunuz var. Likiditeyi artırmak için zararına bile olsa bundle kampanyası ile eritin. 📦", sender: 'ai', delay: 3000 }
        ]
    ];

    useEffect(() => {
        let timeouts = [];
        const currentSequence = CONVERSATIONS[textIndex];
        setMessages([]);
        let totalDelay = 0;

        currentSequence.forEach(({ id, text, sender, delay }) => {
            totalDelay += delay;
            const timeout = setTimeout(() => {
                setMessages(prev => [...prev, { id, text, sender }]);
            }, totalDelay);
            timeouts.push(timeout);
        });

        const nextConversationDelay = totalDelay + 4000;
        const loopTimeout = setTimeout(() => {
            setTextIndex((prev) => (prev + 1) % CONVERSATIONS.length);
        }, nextConversationDelay);
        timeouts.push(loopTimeout);

        return () => timeouts.forEach(clearTimeout);
    }, [textIndex]);

    return (
        <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-lg h-[400px] flex flex-col relative overflow-hidden group hover:border-indigo-300 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Bot className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">FinOps Asistanı</h4>
                    <p className="text-[11px] font-medium text-slate-500">Mali Akıllı Takip (Proaktif)</p>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-visible mt-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn(
                        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                    )}>
                        <div className={cn(
                            "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-medium",
                            msg.sender === 'user'
                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FinancialXRayDemo = () => {
    return (
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-lg h-[400px] relative overflow-hidden group hover:border-rose-300 transition-colors flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
                <h4 className="font-bold text-slate-900 text-lg">Kârlılık Röntgeni</h4>
                <div className="flex items-center gap-1 text-xs text-rose-700 font-bold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg shadow-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Zarar Edenler
                </div>
            </div>

            {/* Simulated Waterfall Chart with CSS Animation (Light Theme) */}
            <div className="flex items-end justify-between h-48 pb-2 border-b border-slate-200 gap-3 relative z-10 px-2 mt-auto">
                <div className="flex-1 bg-emerald-100 border-t-2 border-x border-emerald-500 rounded-t-md h-[80%] relative group">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-sm">200K</div>
                    <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-emerald-600 hidden sm:block">Ciro</div>
                </div>
                <div className="flex-1 bg-slate-100 border-t-2 border-x border-slate-400 rounded-t-md h-[50%] mb-[30%] relative group">
                    <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-slate-500 hidden sm:block">Ürün.M</div>
                </div>
                <div className="flex-1 bg-orange-100 border-t-2 border-x border-orange-400 rounded-t-md h-[15%] mb-[15%] relative group">
                     <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-orange-600 hidden sm:block">İade</div>
                </div>
                <div className="flex-1 bg-rose-100 border-t-2 border-x border-rose-500 rounded-t-md h-[30%] mb-[-15%] relative group animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded shadow-sm border border-rose-200">-40K</div>
                    <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-rose-600 hidden sm:block">REKLAM</div>
                </div>
                <div className="flex-1 bg-indigo-100 border-t-2 border-x border-indigo-500 rounded-t-md h-[15%] relative group">
                    <div className="absolute top-0 -left-8 w-8 border-t border-indigo-200 border-dashed"></div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-sm">30K</div>
                    <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-indigo-600 hidden sm:block">NET</div>
                </div>
            </div>
            
            <p className="text-center text-sm font-medium text-slate-500 mt-10">Gizli iade komisyonları ve aşırı reklam yükü gerçeği gösterir.</p>
        </div>
    );
};

const FeatureShowcase = () => {
    return (
        <section id="features" className="py-24 bg-white relative overflow-hidden border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4 border border-indigo-100">
                        <BarChart3 className="h-4 w-4" />
                        A'DAN Z'YE KONTROL
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Operasyonel Körlüğe Son</h2>
                    <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
                        Uygulama size sadece ne kadar sattığınızı değil, günün sonunda kasanıza tam olarak ne kadar kaldığını adım adım şeffaflaştırır.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mx-auto max-w-5xl">
                    <FinancialXRayDemo />
                    <AIAssistantDemo />
                </div>
            </div>
        </section>
    );
};

const SocialProofSection = () => {
    const TESTIMONIALS = [
        { name: "Ahmet Y.", role: "Pazaryeri Satıcısı", text: "Ölü stoklarımı tespit edip nakit akışımı %30 artırdım. Artık hangi ürüne yatırım yapacağımı biliyorum.", impact: "NAKİT ARTIŞI", initial: "AY" },
        { name: "Selin K.", role: "Giyim Markası", text: "Zarar eden 15 reklam kampanyasını durdurdum. Kârımın aslında iadelere gittiğini bu panelde gördüm.", impact: "GİZLİ ZARAR YOK", initial: "SK" },
        { name: "Zeynep T.", role: "Dijital Girişimci", text: "Komisyon oranları ve kargo desi kesintileri sonrası gerçek kazancımı görmek inanılmaz rahatlattı.", impact: "TAM KONTROL", initial: "ZT" }
    ];

    return (
        <div className="py-24 bg-slate-50 relative z-20 overflow-hidden border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Gerçek Satıcılar, Net Rakamlar</h2>
                <p className="text-slate-600 text-lg">Finansal darlığı aşıp, yönetimi eline alanların deneyimleri.</p>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="flex gap-1 mb-6 text-amber-400">
                            {[...Array(5)].map((_, j) => (
                                <Star key={j} className="h-5 w-5 fill-current" />
                            ))}
                        </div>
                        <div className="mb-8 flex-1">
                            <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold border mb-4 bg-indigo-50 border-indigo-100 text-indigo-700">
                                SONUÇ: {t.impact}
                            </span>
                            <p className="text-slate-700 font-medium leading-relaxed text-lg">
                                "{t.text}"
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {t.initial}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">{t.name}</div>
                                <div className="text-sm font-medium text-slate-500">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PricingSection = ({ onLogin }) => {
    return (
        <section id="pricing" className="py-24 bg-white relative border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Karmaşık Özellikler Yok, <br/>Siz Sadece Kazanın</h2>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                        Aylık tek bir hatalı iade kesintisini yakalamanın getireceği tasarruf, platformun maliyetini anında amorti eder.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* MVP Basic Plan */}
                    <div className="relative p-8 lg:p-10 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Standart</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-slate-900">₺990</span>
                            <span className="text-slate-500 font-medium">/ay</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["1 Mağaza / Pazaryeri Bağlantısı", "Temel Kârlılık ve Unit Economics", "Günlük Veri Güncelleme", "Ölü Stok Takibi", "Satıcı Forumuna Erişim"].map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full p-0.5 bg-emerald-50 text-emerald-600">
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 font-medium">{feat}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={onLogin} className="w-full py-4 rounded-xl font-bold transition-all bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                            Hemen Başla
                        </button>
                    </div>

                    {/* MVP Pro Plan */}
                    <div className="relative p-8 lg:p-10 rounded-3xl border-2 border-indigo-500 bg-white shadow-2xl scale-100 lg:scale-[1.03] z-10 flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            EN POPÜLER
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Profesyonel</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-slate-900">₺2.490</span>
                            <span className="text-slate-500 font-medium">/ay</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["5 Mağazaya Kadar Bağlantı", "Anlık API Veri Entegrasyonu", "Yapay Zeka Finansal Asistanı", "Zarar Eden (Toxic) Ürün Bildirimi", "Trend Envanter Analizleri", "Öncelikli Canlı Destek"].map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full p-0.5 bg-indigo-50 text-indigo-600">
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-900 font-bold">{feat}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={onLogin} className="w-full py-4 rounded-xl font-bold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                            14 Gün Ücretsiz Dene
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const LandingPage = ({ onLogin }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                FinOps
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Özellikler</a>
                            <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Fiyatlandırma</a>
                            <button onClick={onLogin} className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                                Giriş Yap
                            </button>
                            <button onClick={onLogin} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md">
                                Ücretsiz Dene
                            </button>
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2">
                        <a href="#features" className="block text-slate-700 font-bold p-3 rounded-lg hover:bg-slate-50">Özellikler</a>
                        <a href="#pricing" className="block text-slate-700 font-bold p-3 rounded-lg hover:bg-slate-50">Fiyatlandırma</a>
                        <button onClick={onLogin} className="block w-full text-left text-slate-700 font-bold p-3 rounded-lg hover:bg-slate-50">Giriş Yap</button>
                        <button onClick={onLogin} className="block w-full bg-indigo-600 text-white font-bold p-4 rounded-xl text-center shadow-md">Ücretsiz Dene</button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-24 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-indigo-50 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-sky-50 rounded-full blur-[100px] -z-10 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold mb-8 shadow-sm hover:shadow-md transition-shadow">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            E-Ticaret Karlılık Operasyon Platformu
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight text-slate-900">
                            Cironuz Artıyor Ama <br />
                            Kasanız Boş Mu?
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-[1.7] font-medium max-w-3xl">
                            E-ticarette "gizli maliyetlerin" kârınızı eritmesine izin vermeyin. Kargo, komisyon ve iade kaçaklarınızı anında tespit edin.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                            <button onClick={onLogin} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                                Şimdi Ücretsiz Başla
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <ProblemSection />
            <ComparisonTable />
            <FeatureShowcase />
            <PricingSection onLogin={onLogin} />
            <SocialProofSection />

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Paranızı Masada Bırakmayın</h2>
                    <p className="text-xl text-slate-400 mb-10 font-medium">
                        Zarar eden ürünleri bularak saatler içinde platform masrafını amorti edin.
                    </p>
                    <button onClick={onLogin} className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-black text-xl hover:scale-105 hover:bg-indigo-400 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                        Hemen Panele Girin
                    </button>
                    <p className="mt-6 text-sm text-slate-500 font-medium tracking-wide border-t border-slate-800 pt-6 max-w-xs mx-auto">
                        Kredi kartı gerekmeden başla.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-slate-200 bg-white text-slate-500 font-medium text-center">
                <div className="flex justify-center gap-8 mb-4">
                    <a href="#" className="hover:text-slate-900 transition-colors">Gizlilik & KVKK</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Şartlar</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">İletişim</a>
                </div>
                <p>&copy; 2026 FinOps Analitik A.Ş.</p>
            </footer>
        </div>
    );
};
