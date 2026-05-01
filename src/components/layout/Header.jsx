import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Menu, Globe, Sparkles, Calendar, ChevronDown, X, WifiOff, TrendingDown, PackageOpen, FileText, LogOut, Settings, Building, Users, CreditCard, Moon, Sun, ChevronRight, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header({ toggleSidebar, language, setLanguage, t, isChatOpen, toggleChat, onNavigate, filters, onFilterChange, disableGlobalFilters }) {
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Human-readable label for the current date range selection
    const DATE_LABELS = {
        'last30': t.header.last30Days,
        'thisMonth': t.header.thisMonth,
        'lastQuarter': t.header.lastQuarter,
        'thisYear': t.header.thisYear,
    };
    const dateLabel = filters?.dateRange ? (DATE_LABELS[filters.dateRange] || t.header.last30Days) : t.header.last30Days;



    // Notification State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'critical',
            icon: WifiOff,
            title: "Trendyol API Hatası",
            desc: "Son 2 saattir siparişler çekilemiyor. Token süresi dolmuş olabilir.",
            time: "10 dk önce",
            read: false,
            color: "bg-rose-100 text-rose-600"
        },
        {
            id: 2,
            type: 'warning',
            icon: TrendingDown,
            title: "Fiyat Alarmı: Logitech Mouse",
            desc: "Rakip (Teknosa) fiyatı ₺420 seviyesine çekti. Buybox riskte.",
            time: "35 dk önce",
            read: false,
            color: "bg-orange-100 text-orange-600"
        },
        {
            id: 3,
            type: 'alert',
            icon: PackageOpen,
            title: "Kritik Stok Uyarısı",
            desc: "En çok satan 3 ürün tükenmek üzere.",
            time: "2 saat önce",
            read: false,
            color: "bg-yellow-100 text-yellow-600"
        },
        {
            id: 4,
            type: 'info',
            icon: FileText,
            title: "Günlük Rapor Hazır",
            desc: "Dünkü net kar marjınız %22 olarak hesaplandı.",
            time: "09:00",
            read: false,
            color: "bg-blue-100 text-blue-600"
        }
    ]);

    // Profile Menu State
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // Mock state for toggle

    const dateMenuRef = useRef(null);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        // Navigation logic would go here
    };

    // Update happens via props, no local sync needed

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
                setIsDateMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateSelect = (option) => {
        // option is a key like 'last30', 'thisMonth', etc.
        if (option === 'custom') {
            setIsDateModalOpen(true);
            return;
        }
        setIsDateMenuOpen(false);
        setStartDate('');
        setEndDate('');
        onFilterChange && onFilterChange('dateRange', option);
    };

    const handleCustomApply = () => {
        if (startDate && endDate) {
            const start = new Date(startDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short' });
            const end = new Date(endDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short' });
            // Store custom range with start/end info in dateRange key
            onFilterChange && onFilterChange('dateRange', `custom:${startDate}:${endDate}`);
            setIsDateModalOpen(false);
        }
    };

    const handleCustomCancel = () => {
        setIsDateModalOpen(false);
    };

    const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        onFilterChange && onFilterChange('category', category);
    };

    const [selectedChannel, setSelectedChannel] = useState(filters?.channel || 'all');

    const handleChannelChange = (e) => {
        const channel = e.target.value;
        setSelectedChannel(channel);
        onFilterChange && onFilterChange('channel', channel);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-1 md:hidden text-slate-600 hover:bg-slate-100 rounded"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className={cn("flex items-center gap-4 ml-4 h-10 transition-opacity", disableGlobalFilters && "opacity-40 pointer-events-none select-none")}>

                    <div className="flex items-center gap-2 px-3 h-full bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer group">
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-xs font-medium text-slate-500 hidden xl:inline">Tarih:</span>
                        <select
                            value={filters?.dateRange?.startsWith('custom:') ? filters.dateRange : (filters?.dateRange || 'last30')}
                            onChange={(e) => handleDateSelect(e.target.value)}
                            disabled={disableGlobalFilters}
                            className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer outline-none bg-none appearance-none"
                            style={{ backgroundImage: 'none', paddingRight: 0 }}
                        >
                                <option value="last30">{t.header.last30Days}</option>
                                <option value="thisMonth">{t.header.thisMonth}</option>
                                <option value="lastQuarter">{t.header.lastQuarter}</option>
                                <option value="thisYear">{t.header.thisYear}</option>
                                
                                {/* If a custom date is active, show the formatted string, else just "Custom Range..." */}
                                {filters?.dateRange?.startsWith('custom:') ? (
                                    <option value={filters.dateRange}>
                                        {new Date(filters.dateRange.split(':')[1]).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {new Date(filters.dateRange.split(':')[2]).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                    </option>
                                ) : (
                                    <option value="custom">{t.header.customRange || 'Özel Aralık...'}</option>
                                )}
                                
                                {/* Always allow them to open the modal again via this option even if a custom date is active */}
                                {filters?.dateRange?.startsWith('custom:') && (
                                    <option value="custom">Özel Aralık Seç...</option>
                                )}
                            </select>
                        </div>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-2 px-3 h-full bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>

                            <span className="text-xs font-medium text-slate-500 hidden xl:inline">Kategori:</span>

                            <select
                                value={filters?.category || selectedCategory}
                                onChange={handleCategoryChange}
                                disabled={disableGlobalFilters}
                                className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer outline-none min-w-[120px] group-hover:text-indigo-700 bg-none appearance-none"
                                style={{ backgroundImage: 'none', paddingRight: 0 }}
                            >
                                <option value="all">Tüm Kategoriler</option>
                                <option value="Cihazlar">Cihazlar</option>
                                <option value="Kozmetik Ürünler">Kozmetik Ürünler</option>
                                <option value="Setler">Setler</option>
                                <option value="Aksesuar">Aksesuar</option>
                                <option value="Hello Kitty">Hello Kitty</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-2 px-3 h-full bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                            <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />

                            <span className="text-xs font-medium text-slate-500 hidden xl:inline">Kanal:</span>

                            <select
                                value={filters?.channel || selectedChannel}
                                onChange={handleChannelChange}
                                disabled={disableGlobalFilters}
                                className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer outline-none min-w-[120px] group-hover:text-indigo-700 bg-none appearance-none"
                                style={{ backgroundImage: 'none', paddingRight: 0 }}
                            >
                                <option value="all">Tüm Kanallar</option>
                                <option value="Trendyol">Trendyol</option>
                                <option value="Web">Web Sitesi (İkas)</option>
                            </select>
                        </div>

                    </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setLanguage('tr')}
                        className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-md transition-all",
                            language === 'tr' ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        TR
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-md transition-all",
                            language === 'en' ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        EN
                    </button>
                </div>

                {/* AI Assistant Button */}
                <button
                    onClick={toggleChat}
                    className={cn(
                        "flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all group",
                        isChatOpen
                            ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                            : "border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    )}
                >
                    <Sparkles className={cn("h-4 w-4", isChatOpen ? "text-white" : "text-indigo-600")} />
                    <span className="hidden sm:inline">AI Asistan</span>
                </button>

                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50",
                            isNotificationsOpen && "bg-slate-50 text-slate-600"
                        )}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                        )}
                    </button>

                    {/* Notification Popover */}
                    {isNotificationsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-50">
                                <h3 className="font-bold text-slate-900">Bildirimler</h3>
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                                >
                                    Tümünü Okundu Say
                                </button>
                            </div>

                            {/* List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                                    >
                                        <div className={cn("p-2 rounded-lg shrink-0", notification.color)}>
                                            <notification.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-sm font-semibold text-slate-900 leading-tight">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {notification.desc}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400">
                                                {notification.time}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <a
                                href="#"
                                className="block text-center text-sm text-slate-500 py-3 hover:bg-slate-50 transition-colors font-medium border-t border-slate-50"
                            >
                                Tüm Geçmişi Gör
                            </a>
                        </div>
                    )}
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-3 relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Hakan Doğan</p>
                            <p className="text-xs text-slate-500">Admin</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold ring-2 ring-white shadow-sm group-hover:ring-indigo-100 transition-all">
                            <User className="h-4 w-4" />
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            {/* Identity Header */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50/50">
                                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">Hakan Doğan</p>
                                    <p className="text-xs text-slate-500 truncate">hakan@gilan360.com</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                                    Yönetici
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {/* Store Switcher */}
                                <div className="p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Aktif Mağaza</p>
                                    <button className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                                                G3
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Gilan 360 Dijital</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    </button>
                                </div>

                                {/* Menu Options */}
                                <div className="py-2">
                                    {[
                                        { icon: User, label: "Profil Ayarları", action: () => onNavigate('settings', 'profile') },
                                        { icon: Building, label: "Şirket Bilgileri", action: () => onNavigate('settings', 'company') },
                                        { icon: Users, label: "Ekip Yönetimi", action: () => onNavigate('settings', 'team') },
                                        { icon: CreditCard, label: "Abonelik ve Faturalar", action: () => onNavigate('settings', 'billing') },
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                item.action();
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <item.icon className="h-4 w-4 text-slate-400" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Preferences */}
                                <div className="py-2">
                                    <button
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? (
                                                <Moon className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <Sun className="h-4 w-4 text-slate-400" />
                                            )}
                                            <span>Görünüm Modu</span>
                                        </div>
                                        <div className={cn("w-8 h-4 rounded-full transition-colors relative", isDarkMode ? "bg-indigo-600" : "bg-slate-300")}>
                                            <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform", isDarkMode && "translate-x-4")} />
                                        </div>
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50 p-2">
                                    <button className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Date Range Modal */}
            {isDateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">{t.header.selectRange}</h3>
                            <button onClick={handleCustomCancel} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.header.startDate}</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.header.endDate}</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handleCustomCancel}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                {t.header.cancel}
                            </button>
                            <button
                                onClick={handleCustomApply}
                                disabled={!startDate || !endDate}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                            >
                                {t.header.apply}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
