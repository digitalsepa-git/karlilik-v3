import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGlossaryTooltip } from '../hooks/useGlossaryTooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [placeholderText, setPlaceholderText] = useState('');
    const [currentView, setCurrentView] = useState('home'); // 'home' | 'article' | 'inventory_article' | 'generic_article'
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [showModal, setShowModal] = useState(false); // Controls DOM rendering
    const [animateIn, setAnimateIn] = useState(false); // Controls opacity transitions

    const inputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (selectedVideo) {
            setShowModal(true);
            // Small delay to trigger CSS transition
            setTimeout(() => setAnimateIn(true), 10);
        }
    }, [selectedVideo]);

    const handleCloseModal = () => {
        setAnimateIn(false); // Trigger exit animation
        setTimeout(() => {
            setShowModal(false);
            setSelectedVideo(null);
        }, 300); // Wait for transition
    };

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if modal is open and not already closing
            if (e.key === 'Escape' && showModal) {
                handleCloseModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    const videos = [
        {
            id: 1,
            title: "Fiyat Simülatörü ile Zarar Etmeden Satış Yapın",
            desc: "Başabaş noktasını hesaplayarak doğru fiyat stratejisini nasıl kuracağınızı öğrenin.",
            thumbnail: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80",
            duration: "02:45",
            fullDuration: "05:00",
            category: "Fiyatlandırma Stratejisi",
            chapters: [
                { time: "00:00", title: "Giriş ve Kavramlar", desc: "Başabaş noktası nedir?" },
                { time: "01:20", title: "Sabit Giderleri Girme", desc: "" },
                { time: "03:45", title: "Simülasyon Sonuçlarını Okuma", desc: "" }
            ]
        },
        {
            id: 2,
            title: "Stok Alarmı Kurma ve Kritik Seviye Yönetimi",
            desc: "Stock-out yaşamamak için doğru alarm seviyelerini belirleyin ve otomatik bildirimler alın.",
            thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
            duration: "01:30",
            fullDuration: "03:15",
            category: "Stok Yönetimi",
            chapters: [
                { time: "00:00", title: "Stok Alarmı Nedir?", desc: "Kritik stok seviyesi önemi." },
                { time: "00:45", title: "Alarm Kurulumu", desc: "Ayarlar menüsünden alarm ekleme." },
                { time: "02:10", title: "Bildirim Ayarları", desc: "SMS ve E-posta bildirimlerini açma." }
            ]
        },
        {
            id: 3,
            title: "Yapay Zeka ile SEO Uyumlu Ürün Açıklaması",
            desc: "AI Asistan'a sadece ürün adını vererek pazaryeri uyumlu profesyonel açıklamalar yazdırın.",
            thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
            duration: "03:10",
            badge: "Yeni Özellik",
            fullDuration: "04:45",
            category: "Yapay Zeka Asistanı",
            chapters: [
                { time: "00:00", title: "AI Asistan Tanıtımı", desc: "Özelliklere genel bakış." },
                { time: "01:05", title: "Ürün Açıklaması Yazdırma", desc: "Anahtar kelimeleri kullanma." },
                { time: "03:30", title: "SEO Uyumluluk Kontrolü", desc: "Pazaryeri kriterlerine uygunluk." }
            ]
        },
        {
            id: 4,
            title: "Rakip Analizi ve Fiyat İzleme",
            desc: "Rakiplerinizin fiyatlarını otomatik takip edin ve rekabet avantajı sağlayın.",
            thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
            duration: "05:20",
            fullDuration: "08:10",
            category: "Rekabet Analizi",
            chapters: [
                { time: "00:00", title: "Rakip Takibi Neden Önemli?", desc: "Pazar dinamiklerini anlama." },
                { time: "02:15", title: "Rakip Ekleme", desc: "Ürün bazlı rakip tanımlama." },
                { time: "06:00", title: "Fiyat Değişim Raporları", desc: "Tarihsel fiyat hareketlerini inceleme." }
            ]
        },
        {
            id: 5,
            title: "Vergi Dairesi Entegrasyonu",
            desc: "Faturalarınızı otomatik olarak muhasebe sisteminize nasıl aktaracağınızı öğrenin.",
            thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
            duration: "04:15",
            fullDuration: "06:30",
            category: "Entegrasyonlar",
            chapters: [
                { time: "00:00", title: "GİB Entegrasyonu", desc: "Vergi mükellefiyeti doğrulama." },
                { time: "01:40", title: "e-Fatura Ayarları", desc: "Fatura serisi ve numaralandırma." },
                { time: "05:10", title: "Otomatik Gönderim", desc: "Kesilen faturaları GİB'e iletme." }
            ]
        }
    ];

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -340 : 340;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Auto-scan content for glossary terms
    useGlossaryTooltip(currentView);

    const articleDatabase = {
        'finance': {
            breadcrumbs: ['Finansal Raporlar', 'ROI Analizi'],
            sidebarTitle: 'Finansal Analiz',
            sidebarLinks: [
                { text: 'ROI (Yatırım Getirisi) Hesabı', active: true },
                { text: 'Gider Kalemlerini Yönetme', active: false },
                { text: 'Net Kâr vs Brüt Kâr', active: false }
            ],
            content: `
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">ROI (Yatırım Getirisi) Nasıl Hesaplanır?</h1>
                <p class="text-sm text-gray-500 leading-relaxed mb-6">
                    ROI (Return on Investment), yaptığınız reklam ve ürün maliyeti yatırımlarının size ne kadar kâr olarak döndüğünü gösteren en temel başarı metriğidir.
                </p>

                <div class="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                    <h3 class="text-xs font-bold text-blue-800 uppercase mb-2">Formül</h3>
                    <div class="font-mono text-lg text-blue-900">
                        ((Toplam Ciro - Toplam Maliyet) / Toplam Maliyet) x 100
                    </div>
                </div>

                <div class="my-8 p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center group hover:border-blue-400 transition-colors">
                    <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl mb-3">📊</div>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">📸 Ekran Görüntüsü Gelecek</span>
                    <p class="text-sm text-gray-600 font-medium mt-1">"Finansal Performans > Satış ve Kâr Grafiği"</p>
                    <p class="text-xs text-gray-400 mt-2 max-w-md">Kullanıcıya, dashboard ana sayfasındaki mavi/yeşil çizgi grafiğinin neresine bakması gerektiğini gösteren görsel.</p>
                </div>

                <h3 class="font-bold text-gray-900 text-lg mb-2">ROI Neden Düşük Çıkar?</h3>
                <ul class="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Yüksek ACOS:</strong> Reklam harcamalarınız ciroyu eritiyor olabilir.</li>
                    <li><strong>Gizli Giderler:</strong> Kargo veya iade maliyetlerini hesaba katmamış olabilirsiniz.</li>
                </ul>
            `
        },
        'integration': {
            breadcrumbs: ['Entegrasyonlar', 'API Kurulumu'],
            sidebarTitle: 'Bağlantı Ayarları',
            sidebarLinks: [
                { text: 'API Anahtarı Oluşturma', active: true },
                { text: 'Sipariş Senkronizasyon Hataları', active: false },
                { text: 'Stok Eşitleme Sorunları', active: false }
            ],
            content: `
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Pazaryeri API Bağlantısı Kurulumu</h1>
                <p class="text-sm text-gray-500 leading-relaxed mb-8">
                    Trendyol mağazanızı FinOps'a bağlamak için API bilgilerini kopyalayıp panelimize yapıştırmanız yeterlidir.
                </p>

                <div class="mb-8">
                    <h3 class="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Trendyol Panelinden Bilgileri Alma
                    </h3>
                    
                    <figure class="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                        <div class="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            <div class="ml-4 text-[10px] text-gray-400 font-mono">partner.trendyol.com</div>
                        </div>
                        
                        <div class="relative bg-white aspect-video flex items-center justify-center group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Trendyol API Screen">
                            
                            <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">GIF</div>

                            <div class="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-indigo-500 animate-ping opacity-75"></div>
                            <div class="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-indigo-600 rounded-full shadow-lg border-2 border-white"></div>
                            
                            <svg class="absolute top-[52%] left-[51%] w-6 h-6 text-gray-900 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 3.21l.01 16.59 4.37-5.17 3.32 7.35 2.66-1.19-3.32-7.39h5.95L5.5 3.21z"/></svg>
                        </div>
                    </figure>
                    <p class="text-xs text-gray-500 mt-2 pl-1">
                        Hesap Bilgileri > Entegrasyon Bilgileri menüsüne gidin.
                    </p>
                </div>

                <div class="mb-8">
                    <h3 class="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                        FinOps Paneline Yapıştırma
                    </h3>
                    
                    <figure class="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                        <div class="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div class="ml-4 text-[10px] text-gray-400 font-mono">app.finops.com/settings</div>
                        </div>
                        
                        <div class="relative bg-white aspect-video flex items-center justify-center">
                            <div class="w-3/4 space-y-4 p-8 border border-gray-100 rounded-lg shadow-sm">
                                <div class="space-y-1">
                                    <div class="h-2 w-20 bg-gray-200 rounded"></div>
                                    <div class="h-8 w-full bg-indigo-50 border border-indigo-200 rounded flex items-center px-3 text-xs text-gray-400">
                                        ty_api_... (Yapıştırıldı)
                                    </div>
                                </div>
                                <div class="h-8 w-32 bg-indigo-600 rounded"></div>
                            </div>
                             <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">GIF</div>
                        </div>
                    </figure>
                    <p class="text-xs text-gray-500 mt-2 pl-1">
                        API Key ve API Secret alanlarını doldurup 'Kaydet' butonuna basın.
                    </p>
                </div>

                <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p class="text-xs text-indigo-800 leading-relaxed">
                        <strong>Not:</strong> Bağlantı kurulduktan sonra ürünlerinizin panelde görünmesi envanter büyüklüğüne bağlı olarak 5-15 dakika sürebilir.
                    </p>
                </div>
            `
        },
        'ai': {
            breadcrumbs: ['AI Asistan', 'İçerik Üretimi'],
            sidebarTitle: 'Yapay Zeka Araçları',
            sidebarLinks: [
                { text: 'SEO Uyumlu Açıklama Yazdırma', active: true },
                { text: 'Veri Analizi Komutları', active: false },
                { text: 'Prompt Mühendisliği İpuçları', active: false }
            ],
            content: `
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">AI ile SEO Uyumlu Açıklama Yazdırma</h1>
                <p class="text-sm text-gray-500 leading-relaxed mb-8">
                    Ürün açıklamalarınızı manuel yazmakla vakit kaybetmeyin. FinOps AI, ürün özelliklerini analiz ederek pazaryeri algoritmalarına uygun metinler üretir.
                </p>

                <div class="mb-8">
                    <h3 class="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">1</span>
                        AI Optimize Modalı Kullanımı
                    </h3>

                    <figure class="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                        <div class="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            <div class="ml-4 text-[10px] text-gray-400 font-mono">app.finops.com/products/optimizer</div>
                        </div>
                        
                        <div class="relative bg-white aspect-video flex items-center justify-center group cursor-pointer">
                             <div class="w-2/3 space-y-4 p-8 border border-purple-100 rounded-lg shadow-sm bg-purple-50/30">
                                <div class="flex gap-2 mb-4">
                                     <div class="h-2 w-12 bg-purple-200 rounded"></div>
                                     <div class="h-2 w-24 bg-purple-100 rounded"></div>
                                </div>
                                <div class="h-24 w-full bg-white border-2 border-purple-200 rounded-lg p-3 relative">
                                    <div class="h-2 w-full bg-gray-100 rounded mb-2"></div>
                                    <div class="h-2 w-3/4 bg-gray-100 rounded mb-2"></div>
                                    <div class="h-2 w-5/6 bg-gray-100 rounded"></div>
                                    
                                     <div class="absolute -bottom-3 -right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg animate-bounce">✨</div>
                                </div>
                                <div class="h-8 w-32 bg-purple-600 rounded"></div>
                            </div>

                            <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">GIF</div>
                            
                            <!-- Focus Ring -->
                            <div class="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-purple-400 animate-ping opacity-50"></div>
                        </div>
                    </figure>
                    <p class="text-xs text-gray-500 mt-2 pl-1">
                        Ürün detay sayfasındaki mor renkli 'AI ile Optimize Et' penceresinin açık hali.
                    </p>
                </div>

                <div class="bg-purple-50 border border-purple-100 rounded-xl p-5">
                    <h4 class="text-sm font-bold text-purple-900 mb-2">💡 İpucu: Anahtar Kelimeler</h4>
                    <p class="text-xs text-purple-700">
                        AI'a komut verirken "Ergonomik, Kablosuz, Sessiz" gibi ürünün öne çıkan 3 özelliğini mutlaka belirtin.
                    </p>
                </div>
            `
        },
        'settings': {
            breadcrumbs: ['Ayarlar', 'Ekip Yönetimi'],
            sidebarTitle: 'Hesap Yönetimi',
            sidebarLinks: [
                { text: 'Ekip Üyesi Davet Etme', active: true },
                { text: 'Roller ve Yetkiler', active: false },
                { text: 'Şifre Değiştirme', active: false }
            ],
            content: `
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Ekip Üyesi Davet Etme</h1>
                <p class="text-sm text-gray-500 leading-relaxed mb-6">
                    Finansal verilerinizi veya depo yönetimini paylaşmak için ekibinizi davet edebilirsiniz. Farklı roller (Admin, Editör, İzleyici) atayarak güvenliği sağlayın.
                </p>

                <div class="my-8 p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center group hover:border-gray-400 transition-colors">
                    <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl mb-3">👥</div>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">📸 Ekran Görüntüsü Gelecek</span>
                    <p class="text-sm text-gray-600 font-medium mt-1">"Ayarlar > Kullanıcılar Tablosu"</p>
                    <p class="text-xs text-gray-400 mt-2 max-w-md">Kullanıcı listesi ve sağ üstteki 'Yeni Davet Gönder' butonu.</p>
                </div>

                <h3 class="font-bold text-gray-900 text-lg mb-2">Roller Hakkında</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div class="p-3 border border-gray-200 rounded-lg">
                        <div class="text-xs font-bold text-gray-900">Admin</div>
                        <div class="text-[10px] text-gray-500 mt-1">Tam yetki. Fatura ve ödeme bilgilerini görebilir.</div>
                    </div>
                    <div class="p-3 border border-gray-200 rounded-lg">
                        <div class="text-xs font-bold text-gray-900">Editör</div>
                        <div class="text-[10px] text-gray-500 mt-1">Ürün ve fiyat düzenleyebilir, ayarları değiştiremez.</div>
                    </div>
                    <div class="p-3 border border-gray-200 rounded-lg">
                        <div class="text-xs font-bold text-gray-900">İzleyici</div>
                        <div class="text-[10px] text-gray-500 mt-1">Sadece raporları görüntüleyebilir.</div>
                    </div>
                </div>
            `
        }
    };

    // Data
    const categories = [
        {
            id: 'simulator',
            title: 'Fiyat Simülatörü',
            desc: 'Kârlılık hesaplamaları, başabaş noktası, fiyat simülasyonu ve senaryo analizleri.',
            articleCount: '4 Makale',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            hoverTextColor: 'group-hover:text-indigo-600',
            hoverLinkColor: 'hover:text-indigo-600',
            iconPath: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
            quickLinks: [
                { title: "Başabaş noktası nasıl hesaplanır?", url: "#" },
                { title: "Hedef kâr marjı belirleme", url: "#" }
            ],
            onClick: () => setCurrentView('article')
        },
        {
            id: 'inventory',
            title: 'Stok & Envanter',
            desc: 'Stok cover süreleri, kritik seviyeler ve tedarik yönetimi.',
            articleCount: '6 Makale',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            hoverTextColor: 'group-hover:text-emerald-600',
            hoverLinkColor: 'hover:text-emerald-600',
            iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
            quickLinks: [
                { title: "Stok alarmı kurma", url: "#" },
                { title: "Kritik stok seviyesi nedir?", url: "#" }
            ],
            onClick: () => setCurrentView('inventory_article')
        },
        // ... (Keep other categories)
        {
            id: 'finance',
            title: 'Finansal Raporlar',
            desc: 'Ciro analizleri, gider kalemleri ve ROI takibi.',
            articleCount: '3 Makale',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            hoverTextColor: 'group-hover:text-blue-600',
            hoverLinkColor: 'hover:text-blue-600',
            iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            quickLinks: [
                { title: "ROI (Yatırım Getirisi) hesabı", url: "#" },
                { title: "Gider kalemlerini yönetme", url: "#" }
            ],
            onClick: () => { setSelectedArticleId('finance'); setCurrentView('generic_article'); }
        },
        {
            id: 'marketplace',
            title: 'Pazaryeri Entegrasyonu',
            desc: 'Trendyol, Hepsiburada ve Amazon API bağlantıları.',
            articleCount: '5 Makale',
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            hoverTextColor: 'group-hover:text-orange-600',
            hoverLinkColor: 'hover:text-orange-600',
            iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
            quickLinks: [
                { title: "API Anahtarı oluşturma", url: "#" },
                { title: "Sipariş senkronizasyon hataları", url: "#" }
            ],
            onClick: () => setCurrentView('integration_article')
        },
        {
            id: 'ai_assistant',
            title: 'FinOps AI Asistan',
            desc: 'Yapay zeka ile veri analizi ve içerik üretimi.',
            articleCount: 'YENİ',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            hoverTextColor: 'group-hover:text-purple-600',
            hoverLinkColor: 'hover:text-purple-600',
            iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
            quickLinks: [
                { title: "SEO uyumlu açıklama yazdırma", url: "#" },
                { title: "Veri analizi komutları", url: "#" }
            ],
            onClick: () => { setSelectedArticleId('ai'); setCurrentView('generic_article'); }
        },
        {
            id: 'settings',
            title: 'Hesap & Ayarlar',
            desc: 'Kullanıcı yönetimi, faturalandırma ve güvenlik.',
            articleCount: '2 Makale',
            iconBg: 'bg-gray-50',
            iconColor: 'text-gray-600',
            hoverTextColor: 'group-hover:text-gray-800',
            hoverLinkColor: 'hover:text-gray-900',
            iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
            quickLinks: [
                { title: "Ekip üyesi davet etme", url: "#" },
                { title: "Şifre değiştirme", url: "#" }
            ],
            onClick: () => { setSelectedArticleId('settings'); setCurrentView('generic_article'); }
        }
    ];

    const faqs = [ /* ... (Same FAQs) ... */
        {
            question: "Ürün Sağlık Skoru (0-100) nasıl hesaplanıyor?",
            answer: "Ürün skoru 5 ana metriğin ağırlıklı ortalamasıdır: Kârlılık (%25), Ciro Katkısı (%20), Rekabet Gücü (%20), Satış Hızı (%20) ve Stok Sağlığı (%15). Bu metriklerin detaylarını buradan inceleyebilirsiniz."
        },
        {
            question: "Veriler pazaryerlerinden ne sıklıkla çekiliyor?",
            answer: "Stok ve Fiyat verileri API üzerinden anlık (Real-time) olarak güncellenir. Finansal raporlar ve iade verileri ise her gece 03:00'da güncellenerek sisteme yansıtılır."
        },
        {
            question: "Simülasyon sonuçlarını dışa aktarabilir miyim?",
            answer: "Evet, Fiyat Simülatörü sayfasında sağ üstte bulunan \"Raporu İndir\" butonunu kullanarak simülasyon sonuçlarınızı PDF veya Excel formatında alabilirsiniz."
        }
    ];

    // --- Effects (Typewriter & Shortcut) ---
    useEffect(() => {
        const phrases = ["Marj nasıl hesaplanır?", "Stok alarmı kurma...", "Buybox nedir?", "Kârlılık analizi..."];
        let currentPhraseIndex = 0, currentCharIndex = 0, isDeleting = false, timeout;
        const type = () => {
            const current = phrases[currentPhraseIndex];
            if (isDeleting) { setPlaceholderText(current.substring(0, currentCharIndex - 1)); currentCharIndex--; }
            else { setPlaceholderText(current.substring(0, currentCharIndex + 1)); currentCharIndex++; }
            let typeSpeed = isDeleting ? 30 : 50;
            if (!isDeleting && currentCharIndex === current.length) { typeSpeed = 2000; isDeleting = true; }
            else if (isDeleting && currentCharIndex === 0) { isDeleting = false; currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length; typeSpeed = 500; }
            timeout = setTimeout(type, typeSpeed);
        };
        timeout = setTimeout(type, 100);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter Logic
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const lowerQ = searchQuery.toLowerCase();
        return categories.filter(c => c.title.toLowerCase().includes(lowerQ) || c.desc.toLowerCase().includes(lowerQ));
    }, [searchQuery]);

    const filteredFaqs = useMemo(() => {
        if (!searchQuery) return faqs;
        const lowerQ = searchQuery.toLowerCase();
        return faqs.filter(f => f.question.toLowerCase().includes(lowerQ) || f.answer.toLowerCase().includes(lowerQ));
    }, [searchQuery]);

    const dropdownResults = useMemo(() => {
        if (!searchQuery) return { tools: [], articles: [] };
        const lowerQ = searchQuery.toLowerCase();
        return {
            tools: categories.filter(c => c.title.toLowerCase().includes(lowerQ)),
            articles: faqs.filter(f => f.question.toLowerCase().includes(lowerQ))
        };
    }, [searchQuery]);
    const hasDropdownResults = dropdownResults.tools.length > 0 || dropdownResults.articles.length > 0;


    // --- ARTICLE COMPONENT ---
    const ArticleView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <nav className="flex mb-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <button onClick={() => setCurrentView('home')} className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                            Yardım Merkezi
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-medium text-gray-500">Fiyat Simülatörü</span>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-bold text-indigo-600">Başabaş Noktası Hesaplama</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Existing Article Content ... */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 class="text-xs font-bold text-gray-900 uppercase">Bu Kategoride</h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            <a href="#" className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border-l-4 border-indigo-600">
                                Başabaş Noktası Nasıl Hesaplanır?
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                Hedef Kâr Marjı Belirleme
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                Senaryo Analizi (What-If)
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                Komisyon ve Gider Yönetimi
                            </a>
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-8">

                    <div className="article-content">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Başabaş Noktası (Break-even Point) Nasıl Hesaplanır?</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Başabaş noktası, bir ürünün satışından elde edilen gelirin, o ürün için yapılan tüm maliyetleri (sabit ve değişken) tam olarak karşıladığı noktadır. Bu noktada ne kâr ne de zarar edilir.
                        </p>
                    </div>

                    <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10">
                            <svg className="w-32 h-32 -mr-8 -mt-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
                        </div>
                        <h3 className="text-xs font-bold text-indigo-300 uppercase mb-4">Matematiksel Formül</h3>
                        <div className="flex items-center gap-4 text-xl font-mono">
                            <div className="bg-white/10 px-4 py-2 rounded-lg">Sabit Giderler</div>
                            <span className="text-indigo-400">÷</span>
                            <div className="bg-white/10 px-4 py-2 rounded-lg">(Satış Fiyatı - Değişken Giderler)</div>
                        </div>
                        <p className="text-xs text-indigo-300 mt-4 italic">
                            *Değişken Giderler: Komisyon, Kargo, Paketleme vb.
                        </p>
                    </div>

                    <div className="prose prose-sm text-gray-600 max-w-none article-content">
                        <h3 className="text-gray-900 font-bold text-lg mb-2">Simülatörde Nasıl Kullanılır?</h3>
                        <p className="mb-4">
                            FinOps Fiyat Simülatörü, girdiğiniz maliyet verilerini kullanarak başabaş noktasını otomatik hesaplar. Manuel hesaplama yapmanıza gerek yoktur, ancak mantığı anlamak strateji kurmanıza yardımcı olur.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-bold text-yellow-800 text-xs uppercase mb-2">⚠️ Zarar Bölgesi</h4>
                                <p className="text-xs text-yellow-700">
                                    Satış fiyatınız başabaş noktasının altındaysa, sattığınız her ürün başına nakit kaybedersiniz. Bu strateji sadece "Stok Eritme" dönemlerinde kabul edilebilir.
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-bold text-green-800 text-xs uppercase mb-2">✅ Kâr Bölgesi</h4>
                                <p className="text-xs text-green-700">
                                    Başabaş noktasının üzerindeki her kuruş doğrudan net kârınıza eklenir. İdeal marj genellikle bu noktanın %15-20 üzeridir.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-gray-900 font-bold text-lg mb-2">Adım Adım Hesaplama Örneği</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li><strong>Ürün Maliyeti:</strong> 100 TL</li>
                            <li><strong>Kargo + Komisyon:</strong> 50 TL (Değişken)</li>
                            <li><strong>Sabit Gider Payı:</strong> 10 TL</li>
                            <li><strong>Toplam Maliyet:</strong> 160 TL</li>
                        </ul>
                        <p>
                            Bu durumda, başabaş noktanız <strong>160 TL</strong>'dir. Eğer ürünü 160 TL'ye satarsanız, cebinize giren para 0 TL olur. 200 TL'ye satarsanız, 40 TL net kâr edersiniz.
                        </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-900">Hemen Hesaplayın</h4>
                            <p className="text-xs text-gray-500 mt-1">Bu bilgileri kullanarak kendi ürününüzü analiz edin.</p>
                        </div>
                        <button onClick={() => window.location.hash = '#simulator'} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            Simülatörü Aç
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-8 mt-8">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Bu makale yardımcı oldu mu?</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👍 Evet</button>
                                <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👎 Hayır</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const InventoryArticleView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <nav className="flex mb-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <button onClick={() => setCurrentView('home')} className="text-xs font-medium text-gray-500 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                            Yardım Merkezi
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-medium text-gray-500">Stok & Envanter</span>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-bold text-emerald-600">Stok Cover Hesaplama</span>
                        </div>
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 class="text-xs font-bold text-gray-900 uppercase">Envanter Yönetimi</h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            <a href="#" className="block px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border-l-4 border-emerald-500">
                                Stok Cover (Yeterlilik) Hesaplama
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                Kritik Stok Alarmı Kurma
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                Ölü Stok (Dead Stock) Nedir?
                            </a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">
                                ABC Analizi ile Sınıflandırma
                            </a>
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-8">

                    <div className="article-content">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Stok Cover Süresi (Inventory Days) Nedir?</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Stok Cover, elinizdeki mevcut envanterin, şu anki satış hızınızla sizi kaç gün daha idare edebileceğini gösteren kritik bir metriktir. "Stock Out" (stok bitmesi) yaşamamak veya "Overstock" (aşırı stok) maliyetine katlanmamak için bu süreyi dengede tutmalısınız.
                        </p>
                    </div>

                    <div className="bg-emerald-900 rounded-xl p-8 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-40 h-40 -mr-10 -mb-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                        </div>

                        <h3 className="text-xs font-bold text-emerald-300 uppercase mb-6 tracking-wider">Hesaplama Formülü</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-xl font-mono relative z-10">
                            <div className="flex flex-col items-center">
                                <span className="bg-white/10 px-6 py-3 rounded-lg border border-emerald-700">Mevcut Stok Adedi</span>
                                <span class="text-[10px] text-emerald-400 mt-2">Depodaki kullanılabilir miktar</span>
                            </div>

                            <span className="text-emerald-400 text-3xl">÷</span>

                            <div className="flex flex-col items-center">
                                <span className="bg-white/10 px-6 py-3 rounded-lg border border-emerald-700">Günlük Satış Hızı</span>
                                <span class="text-[10px] text-emerald-400 mt-2">Son 30 günün ortalaması</span>
                            </div>

                            <span class="text-emerald-400 text-3xl">=</span>

                            <div className="flex flex-col items-center">
                                <span className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg shadow-xl ring-4 ring-emerald-500/30">Gün Sayısı</span>
                                <span class="text-[10px] text-emerald-200 mt-2 font-bold">Cover Süresi</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h4 className="font-bold text-red-800 text-sm">Cover &lt; Tedarik Süresi</h4>
                            </div>
                            <p className="text-xs text-red-700 leading-relaxed">
                                <strong>Tehlike!</strong> Eğer ürününüzün stok cover süresi (örn: 5 gün), tedarikçinizin teslimat süresinden (örn: 10 gün) kısaysa, ürün "Yok Satacak" (Stock Out) demektir. Hemen sipariş vermelisiniz.
                            </p>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                                <h4 className="font-bold text-orange-800 text-sm">Cover &gt; 90 Gün</h4>
                            </div>
                            <p className="text-xs text-orange-800 leading-relaxed">
                                <strong>Atıl Stok!</strong> Paranızı raflara bağlamış durumdasınız. Bu ürün depolama maliyeti yaratıyor. "Fiyat Simülatörü"nü kullanarak indirim yapmayı ve nakite dönmeyi düşünün.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">💡</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Stratejik İpucu: Lead Time Buffer</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                İdeal Stok Cover süresi = <strong>Tedarik Süresi (Lead Time) + Güvenlik Payı (Safety Stock)</strong> olmalıdır. Örneğin Çin'den 45 günde gelen bir ürün için en az 60 günlük stok cover hedeflemelisiniz.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={() => window.location.hash = '#inventory'} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2">
                            Envanter Raporunu İncele
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Son güncelleme: 2 gün önce</span>
                        <div className="flex gap-2">
                            <button className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 px-3 py-1.5 rounded transition-colors">Yararlı Buldum</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

    const GenericArticleView = () => {
        const data = articleDatabase[selectedArticleId];
        if (!data) return <div>Yükleniyor...</div>;

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <nav className="flex mb-8" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <button onClick={() => setCurrentView('home')} className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                                Yardım Merkezi
                            </button>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                                <span className="ml-1 text-xs font-medium text-gray-500">{data.breadcrumbs[0]}</span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                                <span className="ml-1 text-xs font-bold text-indigo-600">{data.breadcrumbs[1]}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="text-xs font-bold text-gray-900 uppercase">{data.sidebarTitle}</h3>
                            </div>
                            <nav className="p-2 space-y-1">
                                {data.sidebarLinks.map((link, idx) => (
                                    <a key={idx} href="#" className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${link.active ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}`}>
                                        {link.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="lg:col-span-9 space-y-8">
                        <div className="article-content" dangerouslySetInnerHTML={{ __html: data.content }}></div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">Yardımcı oldu mu?</h4>
                                <p className="text-xs text-gray-500 mt-1">Geri bildiriminiz bizim için değerli.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👍 Evet</button>
                                <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👎 Hayır</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const TroubleshootingWizard = () => {
        const [currentStep, setCurrentStep] = useState('start');
        const [history, setHistory] = useState([]);

        const steps = {
            start: {
                question: "Hangi platformda stok sorunu yaşıyorsunuz?",
                options: [
                    { label: "Trendyol", next: "check_scope" },
                    { label: "Hepsiburada", next: "check_scope" },
                    { label: "Amazon", next: "check_scope" }
                ]
            },
            check_scope: {
                question: "Sorun tek bir üründe mi, yoksa tüm ürünlerde mi?",
                options: [
                    { label: "Sadece Bir Üründe", next: "single_issue" },
                    { label: "Tüm Ürünlerde", next: "api_issue" }
                ]
            },
            api_issue: {
                question: "Son 24 saat içinde API şifrenizi değiştirdiniz mi?",
                options: [
                    { label: "Evet", next: "res_api_update" },
                    { label: "Hayır", next: "res_sync_delay" }
                ]
            },
            single_issue: {
                question: "Ürünün 'Barkod' bilgisi FinOps ve Pazaryerinde birebir aynı mı?",
                options: [
                    { label: "Evet, Aynı", next: "res_manual_sync" },
                    { label: "Emin Değilim", next: "res_check_sku" }
                ]
            },
            res_api_update: {
                type: "solution",
                title: "API Anahtarını Yenileyin",
                message: "Pazaryeri şifreniz değiştiği için bağlantı kopmuş. Ayarlar > Entegrasyonlar menüsünden yeni API bilgilerinizi girin.",
                action: "Ayarlara Git",
                isFinal: true
            },
            res_sync_delay: {
                type: "solution",
                title: "Senkronizasyon Gecikmesi",
                message: "API bağlantınız aktif görünüyor. Bazen pazaryerleri stok güncellemelerini 15-20 dakika geç yansıtabilir. Lütfen biraz bekleyin.",
                action: "Yeniden Kontrol Et",
                isFinal: true
            },
            res_check_sku: {
                type: "solution",
                title: "Barkod Hatası",
                message: "FinOps ürünleri eşleştirmek için Barkod/SKU kullanır. Eğer pazaryerindeki barkod ile buradaki farklıysa stok güncellenemez.",
                action: "Ürünü Düzenle",
                isFinal: true
            },
            res_manual_sync: {
                type: "contact",
                title: "Destek Talebi Oluşturun",
                message: "Görünüşe göre teknik bir sorun var. Barkodlar eşleşiyor ve API çalışıyor. Bunu incelememiz gerekecek.",
                action: "Talep Oluştur",
                isFinal: true
            }
        };

        const currentData = steps[currentStep] || steps.start;

        const handleOptionClick = (next) => {
            setHistory([...history, currentStep]);
            setCurrentStep(next);
        };

        const handleReset = () => {
            setCurrentStep('start');
            setHistory([]);
        };

        return (
            <div className="my-8 max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col md:flex-row transition-all duration-300">
                <div className="bg-indigo-900 p-6 flex flex-col items-center justify-center text-center md:w-1/3">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 relative">
                        <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900 shadow-sm animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-bold text-sm">FinOps Tanı Aracı</h3>
                    <p className="text-indigo-200 text-xs mt-2">Sorunu tespit etmek için size birkaç soru soracağım.</p>
                    {history.length > 0 && (
                        <button onClick={handleReset} className="mt-4 text-[10px] text-indigo-300 hover:text-white underline">Başa Dön</button>
                    )}
                </div>

                <div className="p-6 md:w-2/3 bg-gray-50 flex flex-col justify-center min-h-[300px]" id="wizard-container">
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
                        {currentData.isFinal ? (
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${currentData.type === 'solution' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {currentData.type === 'solution' ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{currentData.title}</h4>
                                <p className="text-sm text-gray-600 mb-6">{currentData.message}</p>
                                <div className="flex gap-3 justify-center">
                                    <button onClick={handleReset} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Başa Dön</button>
                                    <button className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${currentData.type === 'solution' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                        {currentData.action}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4 className="text-sm font-bold text-gray-900 mb-4">{currentData.question}</h4>
                                <div className="space-y-2">
                                    {currentData.options?.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(opt.next)}
                                            className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm flex items-center justify-between group"
                                        >
                                            {opt.label}
                                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const IntegrationArticleView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <nav className="flex mb-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <button onClick={() => setCurrentView('home')} className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                            Yardım Merkezi
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-medium text-gray-500">Entegrasyonlar</span>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span className="ml-1 text-xs font-bold text-orange-600">API Kurulumu</span>
                        </div>
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-900 uppercase">Bağlantı Ayarları</h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            <a href="#" className="block px-3 py-2 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold border-l-4 border-orange-500">API Anahtarı Oluşturma</a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">Sipariş Senkronizasyon Hataları</a>
                            <a href="#" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium border-l-4 border-transparent transition-colors">Stok Eşitleme Sorunları</a>
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Pazaryeri API Bağlantısı Kurulumu</h1>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Trendyol, Hepsiburada veya Amazon mağazanızı FinOps'a bağlamak için API anahtarlarına ihtiyacınız vardır. Bu işlem tek seferliktir.
                        </p>
                    </div>

                    {/* Interactive Tour Trigger */}
                    <div className="my-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-inner">
                                <svg className="h-8 w-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-white">Okumakla vakit kaybetmeyin!</h3>
                                <p className="mt-1 text-indigo-100 text-sm leading-relaxed">
                                    Sizi doğrudan ilgili ekrana götürelim ve bu özelliği adım adım, uygulama üzerinde canlı olarak gösterelim.
                                </p>
                            </div>
                            <button onClick={() => window.startInteractiveTour('integration')} className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-white px-6 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap">
                                <span>Canlı Turu Başlat</span>
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Troubleshooting Wizard */}
                    <TroubleshootingWizard />

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                            Trendyol Panelinden Bilgileri Alma
                        </h3>

                        <figure className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                            <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                <div className="ml-4 text-[10px] text-gray-400 font-mono">partner.trendyol.com</div>
                            </div>

                            <div className="relative bg-white aspect-video flex items-center justify-center group cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Trendyol API Screen" />

                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">GIF</div>

                                <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-indigo-500 animate-ping opacity-75"></div>
                                <div className="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-indigo-600 rounded-full shadow-lg border-2 border-white"></div>

                                <svg className="absolute top-[52%] left-[51%] w-6 h-6 text-gray-900 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 3.21l.01 16.59 4.37-5.17 3.32 7.35 2.66-1.19-3.32-7.39h5.95L5.5 3.21z" /></svg>
                            </div>
                        </figure>
                        <p className="text-xs text-gray-500 mt-2 pl-1">
                            Hesap Bilgileri &gt; Entegrasyon Bilgileri menüsüne gidin.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                            FinOps Paneline Yapıştırma
                        </h3>

                        <figure className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                            <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="ml-4 text-[10px] text-gray-400 font-mono">app.finops.com/settings</div>
                            </div>

                            <div className="relative bg-white aspect-video flex items-center justify-center">
                                <div className="w-3/4 space-y-4 p-8 border border-gray-100 rounded-lg shadow-sm">
                                    <div className="space-y-1">
                                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                                        <div className="h-8 w-full bg-indigo-50 border border-indigo-200 rounded flex items-center px-3 text-xs text-gray-400">
                                            ty_api_... (Yapıştırıldı)
                                        </div>
                                    </div>
                                    <div className="h-8 w-32 bg-indigo-600 rounded"></div>
                                </div>
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">GIF</div>
                            </div>
                        </figure>
                        <p className="text-xs text-gray-500 mt-2 pl-1">
                            API Key ve API Secret alanlarını doldurup 'Kaydet' butonuna basın.
                        </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center justify-between mt-8">
                        <div>
                            <h4 className="font-bold text-gray-900">Yardımcı oldu mu?</h4>
                            <p className="text-xs text-gray-500 mt-1">Geri bildiriminiz bizim için değerli.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👍 Evet</button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">👎 Hayır</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in zoom-in-95 duration-500">
            {currentView === 'home' && (
                <>
                    {/* HERO SECTION */}
                    <div className="relative py-12 mb-10">
                        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-50/80 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-end justify-between gap-12">

                            <div className="w-full lg:w-2/3 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wide mb-4 shadow-sm">
                                    👋 Merhaba Hakan, hoş geldin
                                </div>
                                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Nasıl yardımcı olabiliriz?</h1>
                                <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-lg">
                                    Hesaplama araçları, entegrasyon ayarları veya stratejiler hakkında arama yapın.
                                </p>

                                <div className="relative group shadow-sm hover:shadow-md transition-shadow rounded-xl bg-white z-50">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        ref={inputRef}
                                        id="help-search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                        placeholder={placeholderText || "Sorunuzu yazın (örn: 'Stok alarmı', 'Marj hesabı')..."}
                                        className="block w-full pl-12 pr-12 py-4 bg-transparent border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 text-gray-900 outline-none"
                                        autoComplete="off"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-400 font-sans">⌘ K</kbd>
                                    </div>

                                    {/* Dropdown Logic */}
                                    {isFocused && searchQuery && (
                                        <div id="adv-search-dropdown" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
                                            {hasDropdownResults ? (
                                                <div className="py-2">
                                                    {dropdownResults.tools.length > 0 && (
                                                        <>
                                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Araçlar & Modüller</div>
                                                            {dropdownResults.tools.map(tool => (
                                                                <div key={tool.id} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer group flex items-center gap-3 transition-colors">
                                                                    <div className={`p-1.5 rounded-md ${tool.iconBg} ${tool.iconColor}`}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tool.iconPath}></path></svg>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{tool.title}</div>
                                                                        <div className="text-xs text-slate-500 truncate max-w-[400px]">{tool.desc}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                    {dropdownResults.articles.length > 0 && (
                                                        <>
                                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 border-t border-gray-100">Yardım Makaleleri</div>
                                                            {dropdownResults.articles.map((article, idx) => (
                                                                <div key={idx} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer group transition-colors">
                                                                    <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{article.question}</div>
                                                                    <div className="text-xs text-slate-500 truncate">{article.answer}</div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="text-xs text-center text-gray-400 py-1">Tüm sonuçları görmek için <kbd className="font-sans border border-gray-200 px-1 rounded bg-gray-50 text-gray-500">Enter</kbd> basın</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900">Sonuç bulunamadı</h3>
                                                    <p className="text-xs text-gray-500 mt-1 mb-4">"{searchQuery}" hakkında makale bulamadık.</p>
                                                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors w-full">
                                                        Destek Talebi Oluştur
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">Popüler:</span>
                                    <button onClick={() => setSearchQuery('Fiyat Simülasyonu')} className="px-3 py-1 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full text-xs text-gray-500 transition-colors">🚀 Fiyat Simülasyonu</button>
                                    <button onClick={() => setSearchQuery('Stok Cover')} className="px-3 py-1 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full text-xs text-gray-500 transition-colors">📦 Stok Cover</button>
                                    <button onClick={() => setSearchQuery('Entegrasyon')} className="px-3 py-1 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full text-xs text-gray-500 transition-colors">💳 Entegrasyon</button>
                                </div>
                            </div>

                            <div className="w-full lg:w-1/3 min-w-[300px]">
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg shadow-gray-100/50 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Sistem Durumu</h3>
                                        </div>
                                        <span className="flex h-2 w-2 relative" title="Canlı İzleniyor">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs group">
                                            <span className="text-gray-600 flex items-center gap-2 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-indigo-500 transition-colors"></div>
                                                FinOps Panel
                                            </span>
                                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold">Operasyonel</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs group">
                                            <span className="text-gray-600 flex items-center gap-2 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-orange-500 transition-colors"></div>
                                                Trendyol API
                                            </span>
                                            <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Gecikme Var
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs group">
                                            <span className="text-gray-600 flex items-center gap-2 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 transition-colors"></div>
                                                Hepsiburada API
                                            </span>
                                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold">Operasyonel</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs group opacity-60">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                                Veritabanı Bakımı
                                            </span>
                                            <span className="text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-[9px]">03:00 - 04:00</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 flex justify-between items-center">
                                        <span>Son güncelleme: Şimdi</span>
                                        <a href="#" className="text-indigo-600 hover:underline">Tümünü gör →</a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kaldığın Yerden Devam Et</h2>
                            <a href="#" className="text-xs text-indigo-600 font-medium hover:underline">Tüm geçmişi gör →</a>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-center">

                                <a href="#" className="group flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">Başabaş Noktası Nasıl Hesaplanır?</h3>
                                            <span className="text-[10px] text-gray-400">2 saat önce</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">Fiyat simülatörü kullanarak zarar etmeme noktasını belirleme rehberi.</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">Fiyat Simülatörü</span>
                                            <span className="text-[9px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Okumaya devam et →</span>
                                        </div>
                                    </div>
                                </a>

                                <a href="#" className="group flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-700">API Anahtarı Oluşturma</h3>
                                            <span className="text-[10px] text-gray-400">Dün</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">Trendyol mağaza entegrasyonu için gerekli adımlar.</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">Entegrasyon</span>
                                        </div>
                                    </div>
                                </a>

                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-0 shadow-sm relative overflow-hidden flex flex-col h-full">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">Kurulum İlerlemesi</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">FinOps'tan %100 verim alın.</p>
                                    </div>
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90 text-indigo-100" viewBox="0 0 36 36">
                                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                            <path className="text-indigo-600 drop-shadow-sm" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-[10px] font-bold text-indigo-700">%60</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg opacity-50">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 line-through">Trendyol API Bağlandı</span>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg opacity-50">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 line-through">Maliyetler Girildi</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-900">İlk Simülasyonu Yap</p>
                                                <p className="text-[10px] text-indigo-600">Kârlılık analizi için gerekli.</p>
                                            </div>
                                        </div>
                                        <button className="px-2 py-1 bg-white text-indigo-600 text-[10px] font-bold rounded border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors">
                                            Başla
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg">
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                        <span className="text-xs font-medium text-gray-600">Stok Alarmı Oluştur</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Categories Grid */}
                    {
                        filteredCategories.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">Konulara Göz Atın</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCategories.map(cat => (
                                        <div key={cat.id}
                                            onClick={cat.onClick}
                                            className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full ${cat.onClick ? 'cursor-pointer' : 'cursor-default'}`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`w-10 h-10 ${cat.iconBg} ${cat.iconColor} rounded-lg flex items-center justify-center`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.iconPath}></path>
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{cat.articleCount}</span>
                                            </div>
                                            <h3 className={`font-bold text-gray-900 mb-1 ${cat.hoverTextColor} transition-colors`}>{cat.title}</h3>
                                            <p className="text-xs text-gray-500 mb-4 flex-1">{cat.desc}</p>

                                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                                {cat.quickLinks.map((link, idx) => (
                                                    <a key={idx} href={link.url} className={`flex items-center text-xs text-gray-600 ${cat.hoverLinkColor} font-medium transition-colors`}>
                                                        <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        {link.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Video Akademi</h2>
                                <p className="text-xs text-gray-500 mt-1">Okumaya vaktiniz yok mu? Kısa videolarla özellikleri keşfedin.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => scroll('left')}
                                        className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => scroll('right')}
                                        className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={() => setCurrentView('video_library')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                    Tüm videoları gör
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                        </div>


                        <div ref={scrollContainerRef} className="flex overflow-x-auto pb-6 gap-6 snap-x -mx-6 px-6 scrollbar-hide">
                            {videos.map((video) => (
                                <div key={video.id} onClick={() => setSelectedVideo(video)} className="group cursor-pointer min-w-[300px] w-[320px] snap-center">
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                        <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Video Thumbnail" />

                                        {video.badge && (
                                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">
                                                {video.badge}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {video.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Video Player Modal */}
                    {selectedVideo && (
                        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">

                            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}></div>

                            <div className="fixed inset-0 z-10 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

                                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-5xl animate-in zoom-in-95 duration-200">

                                        <button type="button" onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-20 text-white hover:text-gray-200 bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 h-full lg:h-[600px]">

                                            <div className="lg:col-span-2 bg-black flex items-center justify-center relative group">
                                                <div className="w-full h-full flex flex-col justify-center bg-gray-900 relative">
                                                    <img src={selectedVideo.thumbnail.replace('&w=600', '&w=1200')} className="w-full h-full object-contain opacity-50" alt="Video Content" />

                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <button className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 border border-white/30">
                                                            <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </button>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 pb-3 gap-4">
                                                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                                                            <div className="w-1/3 h-full bg-indigo-500"></div>
                                                        </div>
                                                        <span className="text-xs text-white font-mono">{selectedVideo.duration} / {selectedVideo.fullDuration}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 bg-white p-6 flex flex-col h-full overflow-y-auto custom-scrollbar border-l border-gray-100">

                                                <div className="mb-6">
                                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-2">{selectedVideo.category}</span>
                                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedVideo.title}</h2>
                                                    <p className="text-sm text-gray-500 mt-2">{selectedVideo.desc}</p>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Bölümler</h3>
                                                    <div className="space-y-1 relative">
                                                        <div className="absolute left-3 top-2 bottom-4 w-px bg-gray-100"></div>

                                                        {selectedVideo.chapters.map((chapter, idx) => (
                                                            <button key={idx} className={`w-full flex items-start gap-3 p-2 rounded-lg transition-colors text-left group relative z-10 ${idx === 0 ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}>
                                                                {idx === 0 ? (
                                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-sm ring-2 ring-white">
                                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 text-[10px] font-bold group-hover:border-indigo-300 group-hover:text-indigo-600">
                                                                        {chapter.time}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className={`text-xs font-bold ${idx === 0 ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{chapter.time} {chapter.title}</span>
                                                                    {chapter.desc && <p className={`text-[10px] mt-0.5 ${idx === 0 ? 'text-indigo-600' : 'text-gray-400'}`}>{chapter.desc}</p>}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                                        <span>Simülatörü Şimdi Dene</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                    </button>
                                                    <a href="#" className="block text-center text-xs text-gray-500 hover:text-indigo-600 underline">Yazılı dokümanı görüntüle</a>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* FAQ Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-sm font-bold text-gray-900">Sıkça Sorulan Sorular</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, index) => (
                                    <details key={index} className="group p-4 cursor-pointer">
                                        <summary className="flex justify-between items-center font-medium text-sm text-gray-800 hover:text-indigo-600 transition-colors list-none outline-none">
                                            <span>{faq.question}</span>
                                            <span className="transition-transform duration-200 group-open:rotate-180 text-gray-400">
                                                <svg fill="none" height="20" width="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                                            </span>
                                        </summary>
                                        <div className="text-gray-500 text-xs mt-3 leading-relaxed pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    Aramanızla eşleşen sonuç bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Support Banner */}
                    <div className="mt-12 border-t border-gray-200 pt-10 pb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                            <div className="col-span-2 md:col-span-1">
                                <span className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-4">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </span>
                                    Karlılık Analizi
                                </span>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    E-ticaret operasyonlarınızda net kârlılığınızı artırmanız için tasarlanmış yeni nesil finansal işletim sistemi.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-4">Dokümantasyon</h4>
                                <ul className="space-y-2 text-xs text-gray-500">
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Başlangıç Rehberi</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">API Referansları</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">SDK & Kütüphaneler</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Sürüm Notları</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-4">Topluluk</h4>
                                <ul className="space-y-2 text-xs text-gray-500">
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Geliştirici Forumu</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Discord Kanalı</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Webinarlar</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Etkinlikler</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-4">Destek</h4>
                                <ul className="space-y-2 text-xs text-gray-500">
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Sistem Durumu</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Bilet Oluştur</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">İletişim</a></li>
                                    <li><a href="#" className="hover:text-indigo-600 transition-colors">Güvenlik</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-[10px] text-gray-400">© 2026 Karlılık Analizi. Tüm hakları saklıdır.</p>
                            <div className="flex items-center gap-4 text-gray-400">
                                <a href="#" className="hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
                                <a href="#" className="hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 3.368 1.376 6.391 3.554 8.566l-2.014 4.541-4.053 2.026 2.302-3.837c-1.396-1.854-2.215-4.155-2.215-6.669 0-6.198 5.097-11.229 11.428-11.229 6.294 0 11.424 4.995 11.424 11.129 0 6.183-5.076 11.233-11.332 11.233-1.896 0-3.692-.477-5.269-1.3l-5.694 2.134 1.832-5.918c-.689-1.229-1.12-2.613-1.12-4.148 0-6.236 5.034-11.278 11.328-11.278 6.258 0 11.4 5.094 11.4 11.378 0 6.234-5.083 11.275-11.332 11.275z" /></svg></a>
                                <a href="#" className="hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {currentView === 'article' && <ArticleView />}
            {currentView === 'inventory_article' && <InventoryArticleView />}
            {currentView === 'integration_article' && <IntegrationArticleView />}
            {currentView === 'generic_article' && <GenericArticleView />}
            {currentView === 'video_library' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <nav className="flex mb-6" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <button onClick={() => setCurrentView('home')} className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                                    Yardım Merkezi
                                </button>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                                    <span className="ml-1 text-xs font-bold text-indigo-600">Video Akademi</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 text-white mb-10 shadow-2xl group">
                        <div className="absolute inset-0">
                            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-10 md:p-14 max-w-2xl">
                            <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30 mb-4">ÖNE ÇIKAN MASTERCLASS</span>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                                E-Ticaret Kârlılık Stratejileri: Sıfırdan Zirveye
                            </h1>
                            <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                                FinOps uzmanları tarafından hazırlanan bu 5 bölümlük seride, fiyatlandırma psikolojisinden stok optimizasyonuna kadar her şeyi öğrenin.
                            </p>

                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedVideo(videos[0])} className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    İzlemeye Başla
                                </button>
                                <button className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Listeme Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
                        <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">Tümü</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-medium rounded-full whitespace-nowrap transition-colors">🚀 Başlangıç Rehberi</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-medium rounded-full whitespace-nowrap transition-colors">📈 Satış Stratejileri</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-medium rounded-full whitespace-nowrap transition-colors">🤖 AI & Otomasyon</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-medium rounded-full whitespace-nowrap transition-colors">🔧 Teknik Ayarlar</button>
                    </div>

                    <div className="space-y-12">

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                🔰 Yeni Başlayanlar İçin
                                <span className="h-px flex-1 bg-gray-100 ml-4"></span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {videos.slice(0, 4).map((video) => (
                                    <div key={video.id} className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {video.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                🚀 Strateji ve Büyüme
                                <span className="h-px flex-1 bg-gray-100 ml-4"></span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.slice(2, 5).map((video) => (
                                    <div key={video.id} className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {video.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="mt-16 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 text-lg mb-2">Aradığınız videoyu bulamadınız mı?</h3>
                        <p className="text-indigo-600 text-sm mb-6">Her hafta yeni eğitimler ekliyoruz. İstediğiniz bir konu varsa bize bildirin.</p>
                        <button className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                            Eğitim Talebi Oluştur
                        </button>
                    </div>
                </div>
            )}
            {currentView === 'generic_article' && <GenericArticleView />}
        </div >
    );
};
