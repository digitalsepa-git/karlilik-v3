import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    User,
    Building,
    Users,
    CreditCard,
    Bell,
    Link,
    Upload,
    Plus,
    Check,
    Mail,
    Shield,
    Lock,
    X,
    Copy,
    Smartphone,
    Monitor,
    Image as ImageIcon,
    ShieldCheck,
    ShieldAlert,
    MoreVertical,
    Pencil,
    Send,
    PauseCircle,
    Trash2,
    Key,
    FileText,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Settings = ({ t, initialTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync internal state if prop changes (e.g. from Header dropdown)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const MENU_ITEMS = [
        { id: 'profile', label: "Profilim", icon: User },
        { id: 'company', label: "Şirket Bilgileri", icon: Building },
        { id: 'team', label: "Ekip Yönetimi", icon: Users },
        { id: 'billing', label: "Abonelik & Faturalar", icon: CreditCard },
        { id: 'notifications', label: "Bildirim Ayarları", icon: Bell },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'company': return <CompanySettings />;
            case 'team': return <TeamSettings />;
            case 'billing': return <BillingSettings />;
            case 'notifications': return <NotificationSettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
                    <p className="text-sm text-slate-500 mt-1">Hesap ve işletme tercihlerinizi yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="lg:col-span-3">
                    <nav className="space-y-1 sticky top-6">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                                            : "bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components (Placeholders with basic UI) ---

const ProfileSettings = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

    const handleToggle2FA = () => {
        if (is2FAEnabled) {
            setIs2FAEnabled(false);
        } else {
            setIsSetupModalOpen(true);
        }
    };

    return (
        <div className="p-6 max-w-2xl relative">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Profil Bilgileri</h2>

            <div className="flex items-center gap-6 mb-8">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl border-4 border-white shadow-sm">
                    HD
                </div>
                <div>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Fotoğraf Değiştir
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF veya PNG. Max 1MB.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                        <input type="text" defaultValue="Hakan" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
                        <input type="text" defaultValue="Doğan" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ünvan (Job Title)</label>
                        <input type="text" placeholder="Örn: Finans Müdürü, Kurucu Ortak" defaultValue="Kurucu" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yetki Seviyesi</label>
                        <div className="relative">
                            <input
                                type="text"
                                defaultValue="Yönetici (Admin)"
                                readOnly
                                className="w-full bg-slate-50 text-slate-500 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 cursor-not-allowed focus:outline-none"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input type="email" defaultValue="hakan@gilan360.com" className="w-full rounded-lg border-slate-200 text-sm pl-10 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Login & Security Section */}
            <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Giriş ve Güvenlik</h3>

                {!isChangingPassword ? (
                    // UI State A: Summary View
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                        <div className="flex items-center">
                            <span className="font-medium text-slate-900">Giriş Şifresi</span>
                            <span className="ml-8 text-slate-400 tracking-widest">••••••••••••••</span>
                        </div>
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                            Şifremi Değiştir
                        </button>
                    </div>
                ) : (
                    // UI State B: Edit Form
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4">Şifreni Güncelle</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mevcut Şifre</label>
                                <input type="password" placeholder="••••••••" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                                    <input type="password" placeholder="En az 8 karakter" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input type="password" placeholder="••••••••" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setIsChangingPassword(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Vazgeç
                                </button>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                    Şifreyi Güncelle
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mt-6 border border-slate-100">
                    <div>
                        <h4 className="font-medium text-slate-900">İki Aşamalı Doğrulama (2FA)</h4>
                        <p className="text-sm text-slate-500 mt-1">Hesabınızı SMS veya Authenticator uygulaması ile güvenceye alın.</p>
                    </div>
                    <button
                        onClick={handleToggle2FA}
                        className={cn(
                            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                            is2FAEnabled ? "bg-green-500" : "bg-slate-200"
                        )}
                        role="switch"
                        aria-checked={is2FAEnabled}
                    >
                        <span className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            is2FAEnabled ? "translate-x-5" : "translate-x-0"
                        )}></span>
                    </button>
                </div>
            </div>

            <div className="mt-8 mb-8 border-t border-slate-100"></div>

            {/* Active Sessions Section */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Aktif Oturumlar</h3>
                <p className="text-sm text-slate-500 mb-6">Hesabınızın şu an açık olduğu cihazlar ve konumlar.</p>

                <div className="space-y-4">
                    {/* Current Session */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                    Chrome (Mac OS)
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                        Bu Cihaz
                                    </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">İstanbul, TR • 88.234.xx.xx</p>
                            </div>
                        </div>
                    </div>

                    {/* Other Session */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900">Safari (iOS 17.2)</h4>
                                <p className="text-xs text-slate-500 mt-1">Ankara, TR • Son aktif: 2 saat önce</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
                            Çıkış Yap
                        </button>
                    </div>

                    <div className="pt-2">
                        <button className="text-sm font-medium text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:text-slate-900 hover:border-slate-300 transition">
                            Diğer tüm cihazlardan çıkış yap
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow">
                    Değişiklikleri Kaydet
                </button>
            </div>

            {/* 2FA Setup Modal */}
            <TwoFactorSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                onComplete={() => {
                    setIs2FAEnabled(true);
                    setIsSetupModalOpen(false);
                }}
            />
        </div>
    );
};

const TwoFactorSetupModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setCode('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">
                        {step === 1 ? 'Authenticator Kurulumu' : '2FA Başarıyla Etkinleştirildi! 🎉'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-slate-600">
                                    Telefonunuzdaki Google Authenticator veya Authy uygulamasını açın ve bu QR kodu taratın.
                                </p>
                            </div>

                            {/* QR Placeholder */}
                            <div className="flex justify-center my-6">
                                <div className="w-48 h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                    <span className="text-xs">QR Code Placeholder</span>
                                </div>
                            </div>

                            {/* Manual Entry */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                                <code className="text-xs font-mono text-slate-700">XK92-M4A1-92KL-P012</code>
                                <button className="text-indigo-600 hover:text-indigo-700 p-1">
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Doğrulama Kodu</label>
                                <input
                                    type="text"
                                    placeholder="000 000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full text-center text-xl tracking-[0.5em] font-mono py-3 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={code.length < 6}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Doğrula ve Etkinleştir
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                                <p className="font-semibold mb-1">⚠️ Kurtarma kodlarını kaydedin</p>
                                <p className="opacity-90">Telefonunuza erişimi kaybederseniz hesabınıza sadece bu kodlarla girebilirsiniz.</p>
                            </div>

                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 grid grid-cols-2 gap-3 text-center">
                                <span>8239-1293</span>
                                <span>9921-3012</span>
                                <span>1234-5678</span>
                                <span>8765-4321</span>
                                <span>4567-8901</span>
                                <span>2345-6789</span>
                            </div>

                            <button className="flex items-center justify-center gap-2 w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                <Copy className="h-4 w-4" />
                                Kodları Kopyala
                            </button>

                            <button
                                onClick={onComplete}
                                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                            >
                                Tamamla
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ... other components remain unchanged ...



const CompanySettings = () => (
    <div className="p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Şirket Bilgileri</h2>

        {/* Block 1: Brand Identity */}
        <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <div>
                <h3 className="font-medium text-slate-900">Şirket Logosu</h3>
                <p className="text-xs text-slate-500 mb-2">Raporlarda ve sipariş formlarında görünür. Max 2MB.</p>
                <div className="flex gap-3">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Yükle</button>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700">Kaldır</button>
                </div>
            </div>
        </div>

        {/* Block 2: Corporate Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Adı</label>
                <input type="text" defaultValue="Gilan 360 Dijital Hizmetler A.Ş." className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            {/* Legal - Compliance */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Dairesi & No</label>
                <input type="text" defaultValue="Zincirlikuyu V.D. - 1234567890" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mersis No</label>
                <input type="text" placeholder="0123..." className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            {/* Legal - Registry */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ticaret Sicil No</label>
                <input type="text" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">KEP Adresi</label>
                <input type="email" placeholder="sirket@hs01.kep.tr" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            {/* Financial Contact */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Web Sitesi</label>
                <input type="url" placeholder="https://..." className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Muhasebe E-postası
                    <span className="ml-2 text-xs font-normal text-slate-500">(Fatura ve ödemeler için)</span>
                </label>
                <input type="email" placeholder="muhasebe@gilan360.com" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                <textarea rows={3} defaultValue="Esentepe Mah. Büyükdere Cad. No:199 Levent, İstanbul" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow">
                Güncelle
            </button>
        </div>
    </div>
);

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('editor');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const ROLES = [
        {
            id: 'admin',
            label: 'Yönetici (Admin)',
            desc: 'Tam erişim. Kullanıcı ekleyebilir, fatura kesebilir ve ayarları değiştirebilir.',
            color: 'indigo'
        },
        {
            id: 'editor',
            label: 'Editör',
            desc: 'Ürün ve stok düzenleyebilir, ancak şirket ayarlarına erişemez.',
            color: 'blue'
        },
        {
            id: 'accountant',
            label: 'Muhasebe',
            desc: 'Sadece fatura ve finansal raporları görüntüler/indirir.',
            color: 'emerald' // Using emerald for consistency with badge logic
        },
        {
            id: 'viewer',
            label: 'İzleyici',
            desc: 'Salt okunur mod. Hiçbir veriyi değiştiremez.',
            color: 'gray'
        }
    ];

    const handleSubmit = async () => {
        if (!email) return;
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        onInvite({
            email,
            role: ROLES.find(r => r.id === selectedRole),
        });

        setIsLoading(false);
        setEmail('');
        setSelectedRole('editor');
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Ekibe Yeni Üye Davet Et</h3>
                        <p className="text-sm text-slate-500 mt-1">Takım arkadaşınızın bilgilerini girin.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta Adresi</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@sirket.com"
                                className="w-full rounded-lg border-slate-200 text-sm pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Erişim Yetkisi</label>
                        <div className="space-y-3">
                            {ROLES.map((role) => {
                                const isSelected = selectedRole === role.id;
                                return (
                                    <div
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={cn(
                                            "relative flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                            isSelected
                                                ? `border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600`
                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex px-1 min-w-0 flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className={cn(
                                                        "text-sm font-semibold",
                                                        isSelected ? "text-indigo-900" : "text-slate-900"
                                                    )}>
                                                        {role.label}
                                                    </p>
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-indigo-600" />
                                                    )}
                                                </div>
                                                <p className={cn(
                                                    "text-xs leading-relaxed",
                                                    isSelected ? "text-indigo-700" : "text-slate-500"
                                                )}>
                                                    {role.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 px-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !email}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Davet Gönder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const TeamSettings = () => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "Hakan Doğan",
            email: "hakan@gilan360.com",
            role: "Yönetici",
            roleColor: "indigo",
            status: "Aktif",
            statusColor: "green",
            lastActive: "şimdi",
            isOnline: true,
            enabled2FA: true
        },
        {
            id: 2,
            name: "Selin Yılmaz",
            email: "selin@gilan360.com",
            role: "Editör",
            roleColor: "blue",
            status: "Aktif",
            statusColor: "green",
            lastActive: "Dün, 14:30",
            isOnline: false,
            enabled2FA: false
        },
        {
            id: 3,
            name: "Mert Demir",
            email: "mert@gilan360.com",
            role: "İzleyici",
            roleColor: "gray",
            status: "Davet Edildi",
            statusColor: "yellow",
            lastActive: "-",
            isOnline: false,
            enabled2FA: null
        },
        {
            id: 4,
            name: "Ayşe Muhasebe",
            email: "muhasebe@gilan360.com",
            role: "Muhasebe",
            roleColor: "emerald",
            status: "Aktif",
            statusColor: "green",
            lastActive: "3 saat önce",
            isOnline: false,
            enabled2FA: true
        },
    ]);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId && !event.target.closest('.action-menu-container') && !event.target.closest('.portal-menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.right + window.scrollX - 224 // Align right edge (w-56 = 224px)
            });
            setOpenMenuId(id);
        }
    };

    const handleDelete = (id) => {
        setUsers(users.filter(user => user.id !== id));
        setOpenMenuId(null);
    };

    const handleStatusChange = (id, newStatus) => {
        setUsers(users.map(user => {
            if (user.id === id) {
                return {
                    ...user,
                    status: newStatus,
                    statusColor: newStatus === 'Aktif' ? 'green' : (newStatus === 'Askıya Alındı' ? 'yellow' : 'yellow')
                };
            }
            return user;
        }));
        setOpenMenuId(null);
    };

    const handleInviteUser = (data) => {
        const newUser = {
            id: users.length + 1,
            name: data.email.split('@')[0], // Mock name from email
            email: data.email,
            role: data.role.label.split(' (')[0], // Extract role name
            roleColor: data.role.color,
            status: "Davet Edildi",
            statusColor: "yellow",
            lastActive: "-",
            isOnline: false,
            enabled2FA: null // Pending
        };
        setUsers([newUser, ...users]); // Add to top
        // Ideally add a toast here
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Ekip Yönetimi</h2>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Üye Davet Et
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kullanıcı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Güvenlik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map((user, idx) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="relative mr-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className={cn(
                                                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                                                user.isOnline ? "bg-green-500" : "bg-slate-300"
                                            )}></div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">Son görülme: {user.lastActive}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        `bg-${user.roleColor}-50 text-${user.roleColor}-700`
                                    )}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {user.enabled2FA === true && (
                                        <div className="flex items-center gap-1.5 text-green-600" title="2FA Aktif">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-xs font-medium">Aktif</span>
                                        </div>
                                    )}
                                    {user.enabled2FA === false && (
                                        <div className="flex items-center gap-1.5 text-orange-600" title="Riskli: 2FA Kapalı">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-xs font-medium">Riskli</span>
                                        </div>
                                    )}
                                    {user.enabled2FA === null && (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                        user.status === 'Aktif' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    )}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative action-menu-container">
                                    <button
                                        onClick={(e) => toggleMenu(e, user.id)}
                                        className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {/* Portal Dropdown Menu */}
                                    {openMenuId === user.id && createPortal(
                                        <div
                                            className="portal-menu-container fixed z-[9999] w-56 bg-white rounded-lg shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 transition-all text-left animate-in fade-in zoom-in-95"
                                            style={{ top: menuPosition.top, left: menuPosition.left }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="divide-y divide-slate-100">
                                                {/* Group 1: General Actions */}
                                                <div className="py-1">
                                                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 gap-3">
                                                        <Pencil className="h-4 w-4 text-slate-400" />
                                                        Profili Düzenle
                                                    </button>
                                                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 gap-3">
                                                        <Key className="h-4 w-4 text-slate-400" />
                                                        Şifre Sıfırla
                                                    </button>
                                                </div>

                                                {/* Group 2: Context Actions */}
                                                <div className="py-1">
                                                    {user.status === 'Davet Edildi' && (
                                                        <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 gap-3">
                                                            <Send className="h-4 w-4 text-slate-400" />
                                                            Daveti Tekrar Gönder
                                                        </button>
                                                    )}
                                                    {user.status === 'Aktif' && (
                                                        <button
                                                            onClick={() => handleStatusChange(user.id, 'Askıya Alındı')}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 gap-3"
                                                        >
                                                            <PauseCircle className="h-4 w-4 text-slate-400" />
                                                            Erişimi Duraklat
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Group 3: Destructive */}
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 gap-3"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Kullanıcıyı Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteUser}
            />
        </div>
    );
};

const PaywallOverlay = ({ isOpen, onClose, onBack }) => {
    if (!isOpen) return null;

    const plans = [
        { name: 'Başlangıç', price: '999', period: '/yıl', features: ['Temel Raporlar', '1 Mağaza Entegrasyonu', 'Haftalık E-posta', 'Standart Destek'], current: false },
        { name: 'FinOps Pro', price: '2.499', period: '/yıl', features: ['Gelişmiş Raporlar', '5 Mağaza Entegrasyonu', 'Stok Takibi', 'Nakit Akışı Simülasyonu', '7/24 Öncelikli Destek'], current: true, popular: true },
        { name: 'Enterprise', price: '4.999', period: '/yıl', features: ['Sınırsız Entegrasyon', 'Özel API Erişimi', 'Yapay Zeka Analizi', 'Özel Account Manager', 'SLA Garantisi'], current: false },
    ];

    return (
        <div className="fixed inset-0 z-[10003] bg-slate-50 overflow-y-auto animate-in fade-in duration-300">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Geri Dön</span>
                </button>
                <div className="text-sm font-medium text-slate-500">
                    Planları Karşılaştır
                </div>
                <div className="w-24"></div> {/* Spacer for balance */}
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">İşletmenizle birlikte büyüyen planlar</h2>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Tüm özelliklere erişin, finansal kontrolü elinize alın. İstediğiniz zaman planınızı değiştirebilir veya iptal edebilirsiniz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={cn(
                            "relative rounded-2xl p-8 flex flex-col transition-all duration-300",
                            plan.popular
                                ? "bg-white ring-2 ring-indigo-600 shadow-2xl scale-105 z-10"
                                : "bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        )}>
                            {plan.popular && (
                                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                    <span className="bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                                        En Popüler
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">₺{plan.price}</span>
                                    <span className="text-slate-500 font-medium">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-4 h-10">
                                    {plan.name === 'Başlangıç' && 'Yeni başlayanlar için temel finansal takip.'}
                                    {plan.name === 'FinOps Pro' && 'Büyüyen işletmeler için detaylı analiz ve takip.'}
                                    {plan.name === 'Enterprise' && 'Büyük ölçekli operasyonlar için tam kapsamlı çözüm.'}
                                </p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-4">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded-full bg-green-100 p-1">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-slate-600 text-sm font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => !plan.current && alert(`${plan.name} planına geçiş yapılıyor...`)}
                                disabled={plan.current}
                                className={cn(
                                    "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm",
                                    plan.current
                                        ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200"
                                        : plan.popular
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200"
                                            : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
                                )}
                            >
                                {plan.current ? 'Mevcut Planınız' : 'Planı Seç'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-slate-500 mb-4">Sorularınız mı var?</p>
                    <button className="text-indigo-600 font-bold hover:underline">Satış ekibimizle iletişime geçin →</button>
                </div>
            </div>
        </div>
    );
};

const PauseSubscriptionModal = ({ isOpen, onClose, onBack }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PauseCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Aboneliği Duraklat</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Aboneliğinizi duraklattığınızda verileriniz korunur ancak panel erişiminiz kısıtlanır. Ne kadar süreyle duraklatmak istersiniz?
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {['1 Ay', '3 Ay', '6 Ay'].map((duration, idx) => (
                            <button key={idx} className="border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition">
                                {duration}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onBack} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                            Vazgeç
                        </button>
                        <button onClick={() => { alert('Abonelik duraklatıldı.'); onClose(); }} className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 shadow-sm">
                            Duraklat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CancelSubscriptionModal = ({ isOpen, onClose, onBack }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-3xl">😢</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Gitmenize üzüldük...</h3>
                    <p className="text-sm text-slate-500 text-center mb-6">
                        Aboneliğinizi iptal etmeden önce size yardımcı olabileceğimiz bir konu var mı?
                        <br />
                        <span className="font-medium text-slate-900">Şu an iptal ederseniz, kalan 8 ayın iadesini alamayacaksınız.</span>
                    </p>

                    <div className="space-y-3 mb-6">
                        <div className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer transition">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded-full border border-slate-300"></div>
                                <span className="text-sm text-slate-700">Ücreti çok yüksek buldum</span>
                            </div>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer transition">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded-full border border-slate-300"></div>
                                <span className="text-sm text-slate-700">Kullanımı çok karmaşık</span>
                            </div>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer transition">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded-full border border-slate-300"></div>
                                <span className="text-sm text-slate-700">Artık ihtiyacım yok</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg transform hover:-translate-y-0.5 transition-all">
                            Planımı Koru (Vazgeç)
                        </button>
                        <button onClick={() => { alert('Abonelik iptal talebi alındı.'); onClose(); }} className="w-full py-2.5 text-rose-600 text-sm font-medium hover:bg-rose-50 rounded-lg transition-colors">
                            Yine de İptal Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanManagementModal = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Plan Yönetimi</h3>
                        <p className="text-sm text-slate-500">Abonelik detaylarınız.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Mevcut Plan</p>
                            <h4 className="text-lg font-bold text-slate-900">FinOps Professional</h4>
                            <p className="text-sm text-slate-600">Yıllık Ödeme • Sonraki yenileme: 12 Ekim 2026</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <Check className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => onNavigate('change_plan')}
                            className="w-full py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-between px-4 group"
                        >
                            <span>Planı Değiştir / Yükselt</span>
                            <span className="text-slate-400 group-hover:text-slate-600">→</span>
                        </button>
                        <button
                            onClick={() => onNavigate('pause_plan')}
                            className="w-full py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-between px-4 group"
                        >
                            <span>Aboneliği Duraklat</span>
                            <span className="text-slate-400 group-hover:text-slate-600">→</span>
                        </button>
                        <button
                            onClick={() => onNavigate('cancel_plan')}
                            className="w-full py-3 border border-rose-100 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition flex items-center justify-between px-4 group"
                        >
                            <span>Aboneliği İptal Et</span>
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">Kapat</button>
                </div>
            </div>
        </div>
    );
};

const BillingInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Fatura Bilgilerini Düzenle</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Ünvanı</label>
                        <input type="text" defaultValue="Gilan 360 Dijital Hizmetler A.Ş." className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Dairesi</label>
                            <input type="text" defaultValue="Zincirlikuyu" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vergi No</label>
                            <input type="text" defaultValue="1234567890" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fatura Adresi</label>
                        <textarea rows={3} defaultValue="Esentepe Mah. Büyükdere Cad. No:199 Levent, İstanbul" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
                    <button onClick={() => { alert('Fatura bilgileri güncellendi.'); onClose(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">Kaydet</button>
                </div>
            </div>
        </div>
    );
};

const PaymentMethodModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Ödeme Yöntemi Güncelle</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex gap-2">
                        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Ödemeleriniz Iyzico altyapısı ile 256-bit SSL koruması altındadır.</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kart Üzerindeki İsim</label>
                        <input type="text" placeholder="Ad Soyad" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kart Numarası</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Son Kullanma (Ay/Yıl)</label>
                            <input type="text" placeholder="MM/YY" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CVC / CVV</label>
                            <input type="text" placeholder="123" className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
                    <button onClick={() => { alert('Ödeme yöntemi başarıyla güncellendi.'); onClose(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">Kartı Güncelle</button>
                </div>
            </div>
        </div>
    );
};

const BillingSettings = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <div className="p-6 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Abonelik & Faturalar</h2>

            {/* Modals */}
            <PlanManagementModal
                isOpen={activeModal === 'plan'}
                onClose={() => setActiveModal(null)}
                onNavigate={(page) => setActiveModal(page)}
            />
            <PaywallOverlay
                isOpen={activeModal === 'change_plan'}
                onClose={() => setActiveModal(null)}
                onBack={() => setActiveModal('plan')}
            />
            <PauseSubscriptionModal
                isOpen={activeModal === 'pause_plan'}
                onClose={() => setActiveModal(null)}
                onBack={() => setActiveModal('plan')}
            />
            <CancelSubscriptionModal
                isOpen={activeModal === 'cancel_plan'}
                onClose={() => setActiveModal(null)}
                onBack={() => setActiveModal('plan')}
            />

            <BillingInfoModal isOpen={activeModal === 'billing'} onClose={() => setActiveModal(null)} />
            <PaymentMethodModal isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} />

            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white mb-8 shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 border border-white/20">PRO PLAN</span>
                            <span className="text-indigo-100 text-xs">Yıllık Ödeme</span>
                        </div>
                        <h3 className="text-2xl font-bold">FinOps Professional</h3>
                        <p className="text-indigo-100 text-sm mt-1">Bir sonraki yenileme: 12 Ekim 2026</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">₺2.499</div>
                        <div className="text-indigo-200 text-xs">/ yıl</div>
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => setActiveModal('plan')}
                        className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-bold shadow hover:bg-indigo-50 transition"
                    >
                        Planı Yönet
                    </button>
                    <button
                        onClick={() => setActiveModal('billing')}
                        className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-medium border border-indigo-500 hover:bg-indigo-600 transition"
                    >
                        Fatura Bilgileri
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Ödeme Yöntemi</h3>
                <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-500">
                            {/* Generic Card Icon / Logo Placeholder */}
                            <div className="flex gap-0.5">
                                <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                                <div className="w-3 h-3 rounded-full bg-orange-400 opacity-80 -ml-1.5"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Mastercard •••• 4242</p>
                            <p className="text-xs text-slate-500">Son Kullanma: 10/2028</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveModal('payment')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                    >
                        Güncelle
                    </button>
                </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Fatura Geçmişi</h3>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Fatura #INV-2024-00{i}</p>
                                <p className="text-xs text-slate-500">12 Ekim 2024</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-900">₺2.499,00</span>
                            <button
                                onClick={() => alert(`Fatura #INV-2024-00${i} indiriliyor... (Mock)`)}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                İndir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    // Initial State with Defaults
    const [settings, setSettings] = useState({
        stock_critical: { email: false, push: true },
        stock_dead: { email: true, push: false },
        finance_drop: { email: true, push: true },
        finance_return: { email: true, push: false },
        finance_report: { email: true, push: false },
        security_login: { email: true, push: true },
    });

    const handleToggle = (key, type) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [type]: !prev[key][type]
            }
        }));
    };

    const ChoiceButton = ({ icon: Icon, label, active, onClick }) => (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
                active
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50"
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </button>
    );

    const NotificationResultRow = ({ title, desc, settingKey }) => (
        <div className="flex items-start justify-between py-4 first:pt-0">
            <div className="max-w-[60%]">
                <h4 className="text-sm font-medium text-slate-900">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
            <div className="flex items-center gap-2">
                <ChoiceButton
                    icon={Mail}
                    label="E-posta"
                    active={settings[settingKey].email}
                    onClick={() => handleToggle(settingKey, 'email')}
                />
                <ChoiceButton
                    icon={Bell}
                    label="Panel"
                    active={settings[settingKey].push}
                    onClick={() => handleToggle(settingKey, 'push')}
                />
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Bildirim Ayarları</h2>

            {/* Section 1: Stock */}
            <div className="border-b border-slate-100 pb-2 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Stok ve Envanter</h3>
                <div className="divide-y divide-slate-50">
                    <NotificationResultRow
                        title="Kritik Stok Seviyesi"
                        desc="Ürünler belirlediğiniz eşiğin altına düştüğünde."
                        settingKey="stock_critical"
                    />
                    <NotificationResultRow
                        title="Ölü Stok Uyarısı"
                        desc="60 gündür satılmayan ürünler tespit edildiğinde."
                        settingKey="stock_dead"
                    />
                </div>
            </div>

            {/* Section 2: Finance */}
            <div className="border-b border-slate-100 pb-2 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Finans ve Ciro</h3>
                <div className="divide-y divide-slate-50">
                    <NotificationResultRow
                        title="Ani Ciro Düşüşü"
                        desc="Günlük satışlar ortalamanın %50 altına düşerse (Olası Teknik Sorun)."
                        settingKey="finance_drop"
                    />
                    <NotificationResultRow
                        title="Yüksek İade Alarmı"
                        desc="Bir ürünün iade oranı %20'yi aşarsa."
                        settingKey="finance_return"
                    />
                    <NotificationResultRow
                        title="Haftalık Finans Raporu"
                        desc="Her Pazartesi 09:00'da geçen haftanın kar/zarar özeti."
                        settingKey="finance_report"
                    />
                </div>
            </div>

            {/* Section 3: Security */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Güvenlik ve Sistem</h3>
                <div className="divide-y divide-slate-50">
                    <NotificationResultRow
                        title="Yeni Cihaz Girişi"
                        desc="Hesabınıza farklı bir cihazdan giriş yapıldığında."
                        settingKey="security_login"
                    />
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow">
                    Kaydet
                </button>
            </div>
        </div>
    );
};

const IntegrationSettings = () => (
    <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Entegrasyonlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { name: "Trendyol", status: "Bağlı", color: "orange", lastSync: "5 dk önce" },
                { name: "Hepsiburada", status: "Bağlı", color: "orange", lastSync: "12 dk önce" },
                { name: "Amazon TR", status: "Bağlanmadı", color: "slate", lastSync: "-" },
                { name: "Iyzico", status: "Bağlı", color: "blue", lastSync: "Anlık" },
                { name: "Aras Kargo", status: "Bağlı", color: "red", lastSync: "1 saat önce" },
                { name: "Google Analytics", status: "Bağlanmadı", color: "yellow", lastSync: "-" },
            ].map((app, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-${app.color}-50 flex items-center justify-center text-${app.color}-600 font-bold border border-${app.color}-100`}>
                            {app.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">{app.name}</h4>
                            <p className="text-xs text-slate-500">{app.status === 'Bağlı' ? `Son eşitleme: ${app.lastSync}` : 'Yapılandırılmadı'}</p>
                        </div>
                    </div>
                    <button className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        app.status === 'Bağlı'
                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            : "bg-indigo-600 border-transparent text-white hover:bg-indigo-700"
                    )}>
                        {app.status === 'Bağlı' ? 'Yönet' : 'Bağla'}
                    </button>
                </div>
            ))}
        </div>
    </div>
);

// Helper Icon for Billing
const FileIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);
