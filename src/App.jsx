import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { translations } from './lib/translations';
import { Send, X, Package } from 'lucide-react';
import { cn } from './lib/utils';
import {
  Dashboard,
  ProductProfitability,
  ProductManagement,
  InventoryHealth,
  CompetitionAnalysis,
  PriceSimulator,
  ProductSimulator,
  CompanySimulator,
  FinancialReports,
  Expenses,
  Settings,
  Integrations,
  HelpCenter,
  LandingPage
} from './pages';
import { WhatIfSimulationTab } from './pages/strategic_tabs/WhatIfSimulationTab';

function App() {
  // Re-enable state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth State
  const [settingsTab, setSettingsTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('tr');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [activeContext, setActiveContext] = useState(null); // { productId, productName, productImage, issue, badgeColor }
  const [chatMode, setChatMode] = useState('default'); // 'default' | 'product_focus'

  // Global dashboard filters — lifted here so Header can set them and Dashboard can read them
  const [dashboardFilters, setDashboardFilters] = useState({
    dateRange: 'last30', // 'last30' | 'thisMonth' | 'lastQuarter' | 'thisYear'
    category: 'all',    // 'all' | 'Electronics' | 'Accessories' | 'Audio'
    channel: 'all',     // 'all' | 'Trendyol' | 'Hepsiburada' | 'Amazon' | 'Web'
  });
  const [imageError, setImageError] = useState(false);

  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Focus management
  useEffect(() => {
    if ((isChatOpen || chatMode === 'product_focus') && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }, 100);
    }
  }, [isChatOpen, chatMode, activeContext]); // Re-focus when context changes or chat opens

  // Reset image error when context changes
  useEffect(() => {
    if (activeContext) setImageError(false);
  }, [activeContext]);

  const messagesEndRef = useRef(null);

  const t = translations[language];

  const [navParams, setNavParams] = useState(null);

  const handleNavigation = (page, subTab = null, params = null) => {
    setActiveTab(page);
    if (page === 'settings' && subTab) {
      setSettingsTab(subTab);
    }
    setNavParams(params || null);
  };

  const handleSend = (text = inputValue, context = activeContext) => {
    if (!text || (!text.trim() && !context)) return;

    const newMessage = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI Response
    setTimeout(() => {
      let aiResponseText = "This is a simulated AI response. I'm analyzing your data...";

      if (context) {
        aiResponseText = `Merhaba, **${context.productName}** verilerini inceliyorum. ${context.issue === 'high_cpa' ? "CPA oranının %45'e çıktığını görüyorum. Bu üründe reklamları tamamen durdurmadan önce negatif kelime optimizasyonu yapabiliriz." :
          context.issue === 'volume_drop' ? "Satış hızındaki -%40 düşüş stok riskini artırıyor. Agresif bir '3 Al 2 Öde' kampanyası ile nakit akışı sağlayabiliriz." :
            context.issue === 'low_margin' ? "Mevcut %3 marj sürdürülebilir değil. Fiyatı %10 artırırsak dönüşüm %5 düşebilir ancak net kar %25 artacaktır." :
              context.issue === 'high_returns' ? "İade oranındaki artış (7 > 12) kalite kaynaklı görünüyor. Tedarikçi ile 'Kumaş Kalitesi' üzerine görüşmeliyiz." :
                "Genel performans analizi hazırlanıyor..."
          }`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai'
      }]);
    }, 1200);

    // Simulate Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    // Cleanup after animation
    setTimeout(() => {
      setMessages([]);
      setChatMode('default');
      setInputValue('');
      setActiveContext(null);
    }, 300);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard t={t.dashboard} competition={t.competition} onNavigate={handleNavigation} filters={dashboardFilters} />;
      case 'products': return <ProductProfitability t={t} filters={dashboardFilters} onConsultAI={(payload) => {
        // 1. Reset & Set Mode
        setMessages([]);
        setChatMode('product_focus');
        setActiveContext({
          productId: payload.product.id,
          productName: payload.product.name,
          productImage: payload.product.image,
          issue: payload.diagnosis.type,
          badgeColor: payload.diagnosis.actionColor,
          badgeText: payload.diagnosis.badge
        });

        // 2. Add Initial AI Analysis Message (Local)
        setMessages([{
          id: Date.now(),
          text: `"${payload.product.name}" ürünü için analiz verilerimi yükledim. Sizin için hazırladığım soruyu aşağıda inceleyip bana gönderebilirsiniz.`,
          sender: 'ai'
        }]);

        // 3. Inject Prompt into Input (No Auto-Send)
        setInputValue(payload.prompt);
        setIsChatOpen(true);
        handleSend("", payload);
      }} />;
      case 'product-management': return <ProductManagement t={t} />;
      case 'inventory': return <InventoryHealth t={t} />;
      case 'competition': return <CompetitionAnalysis t={t} />;
      case 'whatif': return <WhatIfSimulationTab />;
      case 'simulator': return <PriceSimulator
        t={t}
        onNavigate={(page) => handleNavigation(page)}
        openChatWithContext={(context) => {
          setIsChatOpen(true);
          if (context) {
            setActiveContext(context);
            if (context.prompt) setInputValue(context.prompt);
          }
        }}
      />;
      case 'product-simulator': return <ProductSimulator
        t={t}
        initialData={navParams}
        onGoBack={() => handleNavigation('simulator')}
        openChatWithContext={(context) => {
          setIsChatOpen(true);
          if (context) {
            setActiveContext(context);
            if (context.prompt) setInputValue(context.prompt);
          }
        }}
      />;
      case 'company-simulator': return <CompanySimulator
        t={t}
        initialData={navParams}
        onGoBack={() => handleNavigation(navParams ? 'simulator' : 'dashboard')}
        openChatWithContext={(context) => {
          setIsChatOpen(true);
          if (context) {
            setActiveContext(context);
            if (context.prompt) setInputValue(context.prompt);
          }
        }}
      />;
      case 'reports': return <FinancialReports t={t} />;
      case 'expenses': return <Expenses t={t} />;
      case 'settings': return <Settings t={t} initialTab={settingsTab} />;
      case 'integrations': return <Integrations t={t} />;
      case 'help': return <HelpCenter />;
      default: return <Dashboard t={t.dashboard} />;
    }
  };

  // If not authenticated, show Landing Page
  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigation(tab)}
        isOpen={sidebarOpen}
        t={t.sidebar}
      />

      <div
        className={cn(
          "md:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
          isChatOpen ? "lg:mr-96" : "mr-0"
        )}
      >
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          language={language}
          setLanguage={setLanguage}
          t={t}
          isChatOpen={isChatOpen}
          toggleChat={() => isChatOpen ? handleCloseChat() : setIsChatOpen(true)}
          onNavigate={handleNavigation}
          filters={dashboardFilters}
          onFilterChange={(key, val) => setDashboardFilters(prev => ({ ...prev, [key]: val }))}
          disableGlobalFilters={activeTab === 'whatif'}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-300">
              {renderContent()}
            </div>
          </main>

          {/* AI Chat Layout Container — visible on all sizes, full-screen on mobile / sidebar on lg+ */}
          {isChatOpen && (
            <div className="fixed inset-y-0 right-0 h-screen z-50 flex flex-col bg-white shadow-xl border-l border-slate-200 animate-in slide-in-from-right duration-300
              w-full sm:w-96 lg:w-96 lg:flex">
              <div className="p-4 border-b border-slate-100 bg-white z-10 shrink-0 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-900">AI Assistant</h2>
                  <p className="text-xs text-slate-500">FinOps Co-Pilot</p>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Product Focus Context Header */}
              {chatMode === 'product_focus' && activeContext && (
                <div className="flex items-center gap-3 border-b border-gray-100 p-4 bg-white animate-in fade-in slide-in-from-top-2">
                  {imageError || !activeContext.productImage ? (
                    <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={activeContext.productImage}
                      alt="Context"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
                      onError={() => setImageError(true)}
                    />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-indigo-600 font-medium">ANALIZ MODU</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap ml-2",
                        activeContext.badgeColor === 'red' ? "bg-red-100 text-red-700" :
                          activeContext.badgeColor === 'amber' ? "bg-amber-100 text-amber-700" :
                            activeContext.badgeColor === 'blue' ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                      )}>
                        {activeContext.badgeText}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate" title={activeContext.productName}>
                      {activeContext.productName}
                    </p>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 scroll-smooth">
                {messages.length === 0 && chatMode === 'default' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 min-h-[400px]">
                    <div className="h-12 w-12 bg-indigo-100/50 rounded-xl flex items-center justify-center mb-4">
                      {/* Using Sparkles directly here, assuming it maps to Lucide Icon. Since Sparkles isn't imported as component in the view (it is imported at top but checking usage). Ah, Sparkles IS imported. I will use the component if possible, but the previous edit used SVG. I will use the component assuming imports are correct. Actually, Sparkles IS imported in line 5. */}
                      <Send className="h-6 w-6 text-indigo-600 rotate-180" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Merhaba, Yönetici! 👋</h3>
                    <p className="text-sm text-slate-500 max-w-[260px] mb-8">
                      Verilerini analiz ettim. Karlılığını artırmak için sana nasıl yardımcı olabilirim?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {[
                        "📉 Dün en çok kar getiren 3 ürün neydi?",
                        "📦 Hangi ürünlerde stok kritik seviyede?",
                        "⚔️ Rakiplerin fiyat düşürdüğü ürünleri göster.",
                        "💡 Ölü stokları nakite çevirmek için öneri ver."
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-left text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all hover:shadow-sm"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                            msg.sender === 'user'
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Fixed Input Footer */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Bir soru sor..."
                    className="flex-1 resize-none border border-slate-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 max-h-32 overflow-y-auto"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fix #9: Floating AI Chat Button — visible only on mobile/tablet (hidden on lg+) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full px-4 py-3 shadow-lg shadow-indigo-500/40 transition-all"
          aria-label="AI Asistanı Aç"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span className="text-sm font-bold">AI Asistan</span>
        </button>
      )}

      {/* Contextual Glossary Tooltip */}
      <div id="glossary-tooltip" className="fixed z-[999] hidden max-w-xs bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none transition-opacity opacity-0 transform scale-95">
        <div id="tooltip-term" className="font-bold text-indigo-300 mb-1 text-[10px] uppercase tracking-wider"></div>
        <div id="tooltip-desc" className="leading-relaxed text-gray-300"></div>
        <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
}

export default App;
