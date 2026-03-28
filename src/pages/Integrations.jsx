import React, { useState } from 'react';

// IntegrationLogo Component
const IntegrationLogo = ({ item, className }) => {
    const [imgSrc, setImgSrc] = useState(item.logoUrl);
    const [fallbackLevel, setFallbackLevel] = useState(0);

    if (imgSrc && fallbackLevel < 2) {
        return (
            <img 
                src={imgSrc} 
                alt={item.name} 
                className={`w-full h-full object-contain mix-blend-multiply ${className || 'p-2 rounded-lg'}`}
                onError={() => {
                    if (fallbackLevel === 0 && item.domain) {
                        setImgSrc(`https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`);
                        setFallbackLevel(1);
                    } else {
                        setFallbackLevel(2); 
                    }
                }}
            />
        );
    }

    return <>{item.logoContent}</>;
};

// Internal Modal Component
const IntegrationModal = ({ integration, dbConfig, onSave, onClose }) => {
    const [localKeys, setLocalKeys] = useState(dbConfig || {});

    // Reset local keys when modal opens for a different integration
    React.useEffect(() => {
        setLocalKeys(dbConfig || {});
    }, [integration, dbConfig]);

    if (!integration) return null;

    const isActive = integration.status === 'active';
    const isComingSoon = integration.status === 'coming_soon';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border ${integration.logoBg} ${integration.logoColor} ${integration.logoBorder} overflow-hidden`}>
                            <IntegrationLogo item={integration} className="p-1.5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{integration.category === 'marketplaces' ? 'Pazaryeri' : integration.category === 'ecommerce' ? 'E-Ticaret Altyapısı' : integration.category === 'marketing' ? 'Pazarlama' : integration.category === 'accounting' ? 'Muhasebe' : 'Bildirim'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {isComingSoon ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h4 className="text-gray-900 font-bold mb-2">Çok Yakında!</h4>
                            <p className="text-gray-500 text-sm">Bu entegrasyon şu anda geliştirme aşamasında. Hazır olduğunda size haber vereceğiz.</p>
                            <button onClick={onClose} className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                                Anladım
                            </button>
                        </div>
                    ) : isActive ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Senkronizasyon Ayarları</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                        <span className="text-sm text-gray-700 font-medium">Sipariş Entegrasyonu</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                        <span className="text-sm text-gray-700 font-medium">Stok Eşitleme (Çift Yönlü)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                        <span className="text-sm text-gray-700 font-medium">Fiyat Güncelleme</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                    İptal
                                </button>
                                <button onClick={() => { onSave(integration.id, localKeys); alert('Ayarlar kaydedildi!'); onClose(); }} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                    Kaydet
                                </button>
                            </div>
                            <button onClick={() => { onSave(integration.id, null); alert('Bağlantı kesildi.'); onClose(); }} className="w-full text-xs text-rose-500 font-bold hover:text-rose-600 hover:underline">
                                Bağlantıyı Kes
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-lg flex gap-3 items-start">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>{integration.name} hesabınızı bağlamak için API bilgilerini giriniz.</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        {integration.id === 'ikas' ? 'Client ID' : integration.id === 'googleads' ? 'Hesap ID' : 'API Key / Mağaza ID'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={localKeys.apiKey || localKeys.clientId || localKeys.propertyId || ''}
                                        onChange={(e) => setLocalKeys({...localKeys, [integration.id === 'ikas' ? 'clientId' : integration.id === 'googleads' ? 'propertyId' : 'apiKey']: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                        placeholder="Örn: 12345678" 
                                    />
                                </div>
                                {integration.id !== 'googleads' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            {integration.id === 'ikas' ? 'Client Secret' : 'API Secret / Şifre'}
                                        </label>
                                        <input 
                                            type="password" 
                                            value={localKeys.apiSecret || localKeys.clientSecret || ''}
                                            onChange={(e) => setLocalKeys({...localKeys, [integration.id === 'ikas' ? 'clientSecret' : 'apiSecret']: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                            placeholder="••••••••••••••" 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button onClick={() => { onSave(integration.id, localKeys); alert('Bağlantı başarılı!'); onClose(); }} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                    Bağla ve Yetkilendir
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Integrations = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [dbConfig, setDbConfig] = useState({});

    React.useEffect(() => {
        fetch('/api/integrations')
            .then(res => res.json())
            .then(data => setDbConfig(data))
            .catch(err => console.error("Could not load integrations:", err));
    }, []);

    const handleSaveConfig = async (integrationId, keys) => {
        try {
            const updatedDoc = { [integrationId]: keys };
            
            // local UI instant update
            setDbConfig(prev => {
                const newDb = { ...prev };
                if (keys === null) {
                    delete newDb[integrationId];
                } else {
                    newDb[integrationId] = keys;
                }
                return newDb;
            });

            await fetch('/api/integrations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDoc)
            });
            
        } catch (err) {
            console.error("Failed to save integration to DB:", err);
        }
    };

    const integrationsData = [
        {
            id: 'ty',
            name: 'Trendyol',
            category: 'marketplaces',
            logoBg: 'bg-orange-50',
            logoColor: 'text-orange-600',
            logoBorder: 'border-orange-100',
            logoContent: 'ty',
            status: 'active',
            description: 'Sipariş, stok ve fiyat senkronizasyonu tam zamanlı çalışıyor.',
            lastSync: 'Son eşitleme: 2 dk önce',
            actionText: 'Ayarları Yönet',
            actionStyle: 'secondary'
        },
        {
            id: 'hb',
            name: 'Hepsiburada',
            category: 'marketplaces',
            logoBg: 'bg-orange-50',
            logoColor: 'text-orange-600',
            logoBorder: 'border-orange-100',
            logoContent: 'hb',
            status: 'active',
            description: 'Katalog eşleşmesi ve buybox takibi aktif.',
            lastSync: 'Son eşitleme: 5 dk önce',
            actionText: 'Ayarları Yönet',
            actionStyle: 'secondary'
        },
        {
            id: 'amz',
            name: 'Amazon TR',
            category: 'marketplaces',
            logoBg: 'bg-gray-50',
            logoColor: 'text-gray-600',
            logoBorder: 'border-gray-100',
            logoContent: 'amz',
            status: 'disconnected',
            description: 'Amazon Seller Central hesabınızı bağlayarak FBA stoklarını yönetin.',
            metaText: 'API Anahtarı gerekli',
            actionText: 'Bağla', // Standardized from "Şimdi Bağla"
            actionStyle: 'primary'
        },
        {
            id: 'ciceksepeti',
            name: 'Çiçeksepeti',
            category: 'marketplaces',
            logoBg: 'bg-green-50',
            logoColor: 'text-green-600',
            logoBorder: 'border-green-100',
            logoContent: 'çs',
            status: 'disconnected',
            description: 'Çiçeksepeti satıcı panelinizi bağlayarak siparişlerinizi tek ekrandan yönetin.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'n11',
            name: 'N11',
            category: 'marketplaces',
            logoBg: 'bg-red-50',
            logoColor: 'text-red-600',
            logoBorder: 'border-red-100',
            logoContent: 'n11',
            status: 'disconnected',
            description: 'N11 mağazanız için tam zamanlı stok ve fiyat güncellemesi sağlayın.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'pttavm',
            name: 'PttAVM',
            category: 'marketplaces',
            logoBg: 'bg-yellow-50',
            logoColor: 'text-yellow-600',
            logoBorder: 'border-yellow-100',
            logoContent: 'ptt',
            status: 'coming_soon',
            description: 'PttAVM mağaza yönetimi entegrasyonu geliştirme aşamasındadır.',
            metaText: 'Geliştirme aşamasında',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled'
        },
        {
            id: 'boyner',
            name: 'Boyner',
            category: 'marketplaces',
            logoBg: 'bg-slate-50',
            logoColor: 'text-slate-800',
            logoBorder: 'border-slate-200',
            logoContent: 'B',
            status: 'coming_soon',
            description: 'Boyner pazaryeri satıcıları için özel katalog yönetimi eklenecektir.',
            metaText: 'Geliştirme aşamasında',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled'
        },
        {
            id: 'parasut',
            name: 'Paraşüt',
            category: 'accounting',
            logoBg: 'bg-blue-50',
            logoColor: 'text-blue-600',
            logoBorder: 'border-blue-100',
            logoContent: 'P',
            status: 'disconnected',
            description: 'Satış faturalarını otomatik oluşturun ve giderleri eşleyin.',
            metaText: 'e-Fatura entegrasyonu',
            actionText: 'Bağla',
            actionStyle: 'secondary-blue'
        },
        {
            id: 'logo-isbasi',
            name: 'Logo İşbaşı',
            category: 'accounting',
            logoBg: 'bg-indigo-50',
            logoColor: 'text-indigo-600',
            logoBorder: 'border-indigo-100',
            logoContent: 'L',
            status: 'disconnected',
            description: 'Logo maliyetlerinizi ve e-Fatura süreçlerinizi doğrudan yöneterek senkronize kalın.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'secondary-blue'
        },
        {
            id: 'birfatura',
            name: 'BirFatura',
            category: 'accounting',
            logoBg: 'bg-sky-50',
            logoColor: 'text-sky-600',
            logoBorder: 'border-sky-100',
            logoContent: 'BF',
            status: 'disconnected',
            description: 'Tüm pazaryeri satışlarınızı tek tıkla faturalandırın ve kargo barkodlarını basın.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'secondary-blue'
        },
        {
            id: 'bizimhesap',
            name: 'Bizim Hesap',
            category: 'accounting',
            logoBg: 'bg-emerald-50',
            logoColor: 'text-emerald-600',
            logoBorder: 'border-emerald-100',
            logoContent: 'B',
            status: 'coming_soon',
            description: 'Satışlarınızı kolayca takip edebileceğiniz ön muhasebe altyapısı yakında aktif.',
            metaText: 'Geliştirme aşamasında',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled'
        },
        {
            id: 'slack',
            name: 'Slack Bildirimleri',
            category: 'notifications',
            logoBg: 'bg-purple-50',
            logoColor: 'text-purple-600',
            logoBorder: 'border-purple-100',
            logoContent: '#',
            status: 'active',
            description: 'Buybox kayıpları ve kritik stok uyarıları #finops kanalına düşüyor.',
            lastSync: 'Webhook Aktif',
            actionText: 'Ayarları Yönet',
            actionStyle: 'secondary'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            category: 'notifications',
            logoBg: 'bg-green-50',
            logoColor: 'text-green-600',
            logoBorder: 'border-green-100',
            logoContent: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            ),
            status: 'coming_soon',
            description: "Günlük özet raporları sabah 09:00'da cebinize gelsin.",
            metaText: 'Beta erişim',
            actionStyle: 'disabled',
            isNew: true
        },
        {
            id: 'telegram',
            name: 'Telegram',
            category: 'notifications',
            logoBg: 'bg-sky-50',
            logoColor: 'text-sky-500',
            logoBorder: 'border-sky-100',
            logoContent: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.833.94z"/></svg>
            ),
            status: 'disconnected',
            description: 'Tüm sipariş ve envanter uyarılarınızı Telegram grubunuza anlık olarak alın.',
            metaText: 'Bot Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        // E-commerce Platforms
        {
            id: 'ikas',
            name: 'Ikas',
            category: 'ecommerce',
            logoBg: 'bg-indigo-50',
            logoColor: 'text-indigo-600',
            logoBorder: 'border-indigo-100',
            logoContent: 'ik',
            status: 'active',
            description: 'Siparişler, stoklar ve ürün maliyetleri anlık olarak senkronize ediliyor.',
            lastSync: 'Son eşitleme: 1 dk önce',
            actionText: 'Ayarları Yönet',
            actionStyle: 'secondary'
        },
        {
            id: 'shopify',
            name: 'Shopify',
            category: 'ecommerce',
            logoBg: 'bg-emerald-50',
            logoColor: 'text-emerald-600',
            logoBorder: 'border-emerald-100',
            logoContent: 'S',
            status: 'disconnected',
            description: 'Shopify mağazanızı bağlayarak tüm satışlarınızı tek ekrandan yönetin.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'ticimax',
            name: 'Ticimax',
            category: 'ecommerce',
            logoBg: 'bg-blue-50',
            logoColor: 'text-blue-600',
            logoBorder: 'border-blue-100',
            logoContent: 'tx',
            status: 'disconnected',
            description: 'Ticimax altyapılı e-ticaret sitenizi entegre edin ve stoklarınızı eşitleyin.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'woocommerce',
            name: 'WooCommerce',
            category: 'ecommerce',
            logoBg: 'bg-purple-50',
            logoColor: 'text-purple-600',
            logoBorder: 'border-purple-100',
            logoContent: 'Woo',
            status: 'coming_soon',
            description: 'WordPress tabanlı e-ticaret siteniz için entegrasyon çok yakında aktif olacak.',
            metaText: 'Geliştirme aşamasında',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled'
        },
        {
            id: 'ideasoft',
            name: 'IdeaSoft',
            category: 'ecommerce',
            logoBg: 'bg-sky-50',
            logoColor: 'text-sky-600',
            logoBorder: 'border-sky-100',
            logoContent: 'is',
            status: 'disconnected',
            description: 'IdeaSoft mağazanızı kolayca bağlayın ve tüm e-ticaret operasyonunuzu merkezileştirin.',
            metaText: 'API Kurulumu gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'tsoft',
            name: 'T-Soft',
            category: 'ecommerce',
            logoBg: 'bg-red-50',
            logoColor: 'text-red-600',
            logoBorder: 'border-red-100',
            logoContent: 'Ts',
            status: 'coming_soon',
            description: 'T-Soft altyapısı kullanan işletmelerimiz için entegrasyon hazırlıkları devam ediyor.',
            metaText: 'Geliştirme aşamasında',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled'
        },
        {
            id: 'opencart',
            name: 'OpenCart',
            category: 'ecommerce',
            logoBg: 'bg-cyan-50',
            logoColor: 'text-cyan-600',
            logoBorder: 'border-cyan-100',
            logoContent: 'OC',
            status: 'coming_soon',
            description: 'Açık kaynaklı OpenCart sitenizle tam entegrasyon çok yakında sizlerle.',
            metaText: 'Beta erişim',
            actionText: 'Bekleme Listesi',
            actionStyle: 'disabled',
            isNew: true
        },
        // Marketing Platforms
        {
            id: 'googleads',
            name: 'Google Ads',
            category: 'marketing',
            logoBg: 'bg-yellow-50',
            logoColor: 'text-yellow-600',
            logoBorder: 'border-yellow-100',
            logoContent: 'G',
            status: 'disconnected',
            description: 'Google reklam harcamalarınızı ve dönüşümlerinizi doğrudan ürün maliyetlerinize yansıtın.',
            metaText: 'Google Hesabı gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        },
        {
            id: 'metaads',
            name: 'Meta Ads',
            category: 'marketing',
            logoBg: 'bg-blue-50',
            logoColor: 'text-blue-600',
            logoBorder: 'border-blue-100',
            logoContent: 'M',
            status: 'disconnected',
            description: 'Facebook ve Instagram reklam verilerinizi çekerek gerçek kârlılığınızı hesaplayın.',
            metaText: 'Meta Business hesabı gerekli',
            actionText: 'Bağla',
            actionStyle: 'primary'
        }
    ];

    const logoMap = {
        'ty': 'trendyol.com',
        'hb': 'hepsiburada.com',
        'amz': 'amazon.com.tr',
        'ciceksepeti': 'ciceksepeti.com',
        'n11': 'n11.com',
        'pttavm': 'pttavm.com',
        'boyner': 'boyner.com.tr',
        'parasut': 'parasut.com',
        'logo-isbasi': 'isbasi.com',
        'birfatura': 'birfatura.com',
        'bizimhesap': 'bizimhesap.com',
        'slack': 'slack.com',
        'whatsapp': 'whatsapp.com',
        'telegram': 'telegram.org',
        'ikas': 'ikas.com',
        'shopify': 'shopify.com',
        'ticimax': 'ticimax.com',
        'woocommerce': 'woocommerce.com',
        'ideasoft': 'ideasoft.com.tr',
        'tsoft': 'tsoft.com.tr',
        'opencart': 'opencart.com',
        'googleads': 'google.com',
        'metaads': 'meta.com'
    };

    const integrations = integrationsData.map(item => {
        // Auto-detect connection status based on dbConfig presence (excluding coming_soon variants)
        let activeStatus = item.status;
        if (item.status !== 'coming_soon') {
            const hasKeys = dbConfig[item.id] && Object.keys(dbConfig[item.id]).length > 0;
            activeStatus = hasKeys ? 'active' : 'disconnected';
            
            // Hardcode ty and ikas as active for simulation fallback if empty initially
            if (!hasKeys && (item.id === 'ty' || item.id === 'ikas')) {
                activeStatus = 'active'; 
            }
        }

        return {
            ...item,
            status: activeStatus,
            actionText: activeStatus === 'active' ? 'Ayarları Yönet' : item.actionText,
            actionStyle: activeStatus === 'active' ? 'secondary' : item.actionStyle,
            domain: logoMap[item.id],
            logoUrl: logoMap[item.id] ? `https://logo.clearbit.com/${logoMap[item.id]}` : null
        };
    });

    const filteredIntegrations = activeTab === 'all'
        ? integrations
        : integrations.filter(item => item.category === activeTab);

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            <IntegrationModal
                integration={selectedIntegration}
                dbConfig={selectedIntegration ? dbConfig[selectedIntegration.id] : null}
                onSave={handleSaveConfig}
                onClose={() => setSelectedIntegration(null)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Entegrasyonlar</h1>
                    <p className="text-sm text-gray-500 mt-1">Pazaryerleri, muhasebe ve bildirim araçlarını buradan yönetin.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div className="text-xs">
                        <span className="block text-gray-500 font-medium">Sistem Durumu</span>
                        <span className="block text-gray-900 font-bold">Tüm Veriler Güncel (3 dk önce)</span>
                    </div>
                    <button className="ml-2 p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-md transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max" aria-label="Tabs">
                    <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tümü</button>
                    <button onClick={() => setActiveTab('ecommerce')} className={`${activeTab === 'ecommerce' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>E-ticaret Altyapıları</button>
                    <button onClick={() => setActiveTab('marketplaces')} className={`${activeTab === 'marketplaces' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Pazaryerleri</button>
                    <button onClick={() => setActiveTab('accounting')} className={`${activeTab === 'accounting' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Muhasebe & ERP</button>
                    <button onClick={() => setActiveTab('marketing')} className={`${activeTab === 'marketing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Pazarlama</button>
                    <button onClick={() => setActiveTab('notifications')} className={`${activeTab === 'notifications' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Bildirim Araçları</button>
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredIntegrations.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group relative">
                        {item.isNew && (
                            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">YENİ</div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border ${item.logoBg} ${item.logoColor} ${item.logoBorder} overflow-hidden`}>
                                <IntegrationLogo item={item} className="p-2" />
                            </div>

                            {item.status === 'active' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <svg className="w-1.5 h-1.5 mr-1.5 fill-emerald-500" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3"></circle></svg>
                                    Aktif
                                </span>
                            )}
                            {item.status === 'disconnected' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    Bağlı Değil
                                </span>
                            )}
                            {item.status === 'coming_soon' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    Yakında
                                </span>
                            )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">{item.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-400">{item.lastSync || item.metaText}</span>

                            {item.actionStyle === 'secondary' && (
                                <button onClick={() => setSelectedIntegration(item)} className="text-sm font-bold text-gray-700 hover:text-indigo-600 border border-gray-300 hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors bg-white">
                                    {item.actionText}
                                </button>
                            )}
                            {item.actionStyle === 'primary' && (
                                <button onClick={() => setSelectedIntegration(item)} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200">
                                    {item.actionText}
                                </button>
                            )}
                            {item.actionStyle === 'secondary-blue' && (
                                <button onClick={() => setSelectedIntegration(item)} className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-lg transition-colors">
                                    {item.actionText}
                                </button>
                            )}
                            {item.actionStyle === 'disabled' && (
                                <button onClick={() => setSelectedIntegration(item)} className="text-sm font-bold text-gray-400 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg cursor-not-allowed">
                                    {item.actionText}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
