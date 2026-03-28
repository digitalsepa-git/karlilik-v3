# Implementation Plan: Product Profitability Analysis Dashboard

## Overview

Bu implementasyon planı, e-ticaret ürün karlılık analizi dashboard'unun adım adım geliştirilmesini içerir. Mevcut ProductProfitability.jsx sayfası üzerine inşa edilecek ve React + Vite + Tailwind CSS + Recharts teknolojileri kullanılacaktır. Her task, önceki task'lerin üzerine inşa edilecek şekilde tasarlanmıştır.

## Tasks

- [ ] 1. Proje yapısını düzenle ve temel utility fonksiyonlarını oluştur
  - Veri işleme fonksiyonlarını ayrı modüllere taşı (lib/calculations.js)
  - Utility fonksiyonları oluştur (formatCurrency, formatNumber, formatPercent)
  - Sabit değerleri constants.js dosyasına taşı
  - PropTypes veya JSDoc ile tip tanımlamaları ekle
  - _Requirements: 1.1, 2.1_

- [ ]* 1.1 Temel hesaplama fonksiyonları için property testleri yaz
  - **Property 1: Net Profit Calculation Accuracy**
  - **Property 2: Margin Calculation Accuracy**
  - **Property 4: Revenue Share Allocation**
  - **Property 5: Ad Budget Distribution**
  - fast-check kütüphanesini kur ve yapılandır
  - _Requirements: 1.1, 2.1_

- [ ] 2. Veri modelleri ve state management yapısını oluştur
  - [ ] 2.1 Context API yapısını kur (ProductContext, UIContext)
    - ProductContext: products, filters, updateFilters, resetFilters
    - UIContext: ui state, modal controls, pagination controls
    - _Requirements: 9.1-9.7, 1.4_
  
  - [ ] 2.2 Custom hooks oluştur
    - useProducts: Ürün verilerini yönet
    - useFilters: Filtreleme mantığını yönet
    - usePagination: Sayfalama mantığını yönet
    - useSort: Sıralama mantığını yönet
    - useNotifications: Bildirim sistemini yönet
    - _Requirements: 9.2-9.7, 1.3, 1.4, 13.2_
  
  - [ ]* 2.3 Veri işleme fonksiyonları için property testleri yaz
    - **Property 6: Loss Maker Identification**
    - **Property 7: Table Data Completeness**
    - **Property 23: Summary Row Accuracy**
    - _Requirements: 1.5, 1.6, 2.2_

- [ ] 3. Checkpoint - Temel yapı kontrolü
  - Tüm testlerin geçtiğini doğrula
  - Context provider'ların doğru çalıştığını test et
  - Kullanıcıya sorular varsa sor

- [ ] 4. KPI Cards bileşenini geliştir
  - [ ] 4.1 KPICard base component oluştur
    - Responsive card layout (Tailwind)
    - Icon, title, value, trend gösterimi
    - Click handler prop
    - Hover efektleri
    - _Requirements: 2.1-2.7_
  
  - [ ] 4.2 KPI metrik hesaplama fonksiyonlarını implement et
    - calculateAvgMargin: Ağırlıklı ortalama marj
    - countLossMakers: Zarar eden ürün sayısı
    - calculateMER: Marketing Efficiency Ratio
    - calculateReturnLoss: İade kayıp tutarı
    - _Requirements: 2.1-2.4_
  
  - [ ]* 4.3 KPI hesaplamaları için property testleri yaz
    - **Property 3: MER Calculation Accuracy**
    - **Property 24: KPI Metric Aggregation**
    - _Requirements: 2.3, 2.1_
  
  - [ ] 4.4 KPICards container component oluştur
    - 4 KPI kartını grid layout ile yerleştir
    - Responsive: 1 col (mobile), 2 col (tablet), 4 col (desktop)
    - Modal açma handler'larını bağla
    - _Requirements: 2.1-2.7_

- [ ] 5. Unit Economics Table bileşenini geliştir
  - [ ] 5.1 TableHeader component oluştur
    - Sıralanabilir sütun başlıkları
    - Sort direction göstergesi (up/down arrow)
    - Sticky header on scroll
    - _Requirements: 1.3_
  
  - [ ] 5.2 ProductRow component oluştur
    - Tüm ürün metriklerini göster
    - Zarar eden ürünler için kırmızı vurgulama
    - Expand/collapse özelliği
    - Click handler for detail modal
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 5.3 Pagination component oluştur
    - Sayfa numarası göstergesi
    - İleri/geri butonları
    - Sayfa başına satır seçici (10, 25, 50, 100)
    - _Requirements: 1.4_
  
  - [ ] 5.4 UnitEconomicsTable container oluştur
    - TableHeader, ProductRow, Pagination'ı birleştir
    - Summary row ekle
    - Loading ve empty state'leri ekle
    - _Requirements: 1.1-1.6_
  
  - [ ]* 5.5 Table fonksiyonları için property testleri yaz
    - **Property 21: Sort Order Correctness**
    - **Property 22: Pagination Slice Correctness**
    - _Requirements: 1.3, 1.4_

- [ ] 6. Checkpoint - Tablo ve KPI kontrolü
  - Tablo sıralamasının çalıştığını doğrula
  - Sayfalama mantığını test et
  - KPI kartlarının doğru değerleri gösterdiğini kontrol et
  - Kullanıcıya sorular varsa sor

- [ ] 7. Sankey Diagram bileşenini geliştir
  - [ ] 7.1 Sankey veri yapısını oluştur
    - nodes array: source ve target node'lar
    - links array: akış bağlantıları
    - Renk ve ikon atamaları
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [ ] 7.2 Custom Sankey node renderer oluştur
    - Source node: Toplam ciro kartı
    - Target nodes: Gider kalemleri kartları
    - Icon ve renk entegrasyonu
    - Hover efektleri
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [ ] 7.3 Custom Sankey link renderer oluştur
    - Gradient renkler
    - Orantılı kalınlık
    - Hover animasyonları
    - _Requirements: 3.3, 3.6_
  
  - [ ] 7.4 SankeyDiagram container component oluştur
    - Recharts Sankey entegrasyonu
    - Node click handler (expense modal açma)
    - Responsive scaling
    - Summary header ekle
    - _Requirements: 3.1-3.6_
  
  - [ ]* 7.5 Sankey veri yapısı için property testleri yaz
    - **Property 8: Sankey Flow Conservation**
    - _Requirements: 3.1, 3.2, 3.6_

- [ ] 8. Trend Analysis bileşenini geliştir
  - [ ] 8.1 Trend hesaplama fonksiyonlarını implement et
    - calculateTrend: Önceki döneme göre değişim
    - generateSparklineData: Mini grafik verisi
    - categorizeTrends: Kazanan/kaybeden ayrımı
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  
  - [ ] 8.2 TrendProductCard component oluştur
    - Ürün bilgileri
    - Trend değeri ve yüzdesi
    - Sparkline grafiği (Recharts LineChart)
    - Diagnosis badge (kaybedenler için)
    - _Requirements: 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 8.3 WinnersList ve LosersList component'lerini oluştur
    - Scrollable liste
    - Sticky header
    - Renk kodlaması (emerald/rose)
    - _Requirements: 4.1, 4.2_
  
  - [ ] 8.4 TrendAnalysis container oluştur
    - Split view layout (50/50)
    - Metric toggle (profit/volume)
    - Winners ve losers listelerini birleştir
    - _Requirements: 4.1-4.7_
  
  - [ ]* 8.5 Trend analizi için property testleri yaz
    - **Property 9: Trend Categorization Correctness**
    - **Property 10: Trend Percentage Calculation**
    - **Property 11: Sparkline Data Consistency**
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [ ] 9. AI Diagnosis Engine'i implement et
  - [ ] 9.1 Diagnosis senaryolarını tanımla
    - profit_drop, high_cpa, low_margin, volume_drop
    - high_returns, demand_drop, stock_bloat
    - Her senaryo için badge, action, tooltip
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 9.2 diagnoseProduct fonksiyonunu oluştur
    - Trend analizi
    - Senaryo eşleştirme
    - Diagnosis objesi üretimi
    - _Requirements: 5.1, 4.7_
  
  - [ ] 9.3 AI prompt generator oluştur
    - Ürün verilerine dayalı bağlamsal prompt
    - Diagnosis tipine göre özelleştirilmiş mesajlar
    - _Requirements: 5.4_
  
  - [ ] 9.4 AI consultation handler'ı entegre et
    - Action button click handler
    - Prompt oluşturma ve iletme
    - onConsultAI callback entegrasyonu
    - _Requirements: 5.3, 5.6_
  
  - [ ]* 9.5 Diagnosis engine için property testleri yaz
    - **Property 12: Diagnosis Assignment for Losers**
    - **Property 13: AI Prompt Contextualization**
    - _Requirements: 4.7, 5.1, 5.4_

- [ ] 10. Checkpoint - Görselleştirme ve AI kontrolü
  - Sankey diyagramının doğru render edildiğini kontrol et
  - Trend analizinin kazanan/kaybeden ayrımını test et
  - AI diagnosis'in doğru atandığını doğrula
  - Kullanıcıya sorular varsa sor

- [ ] 11. Product Detail Modal'ı geliştir
  - [ ] 11.1 Modal base component oluştur
    - Overlay ve backdrop
    - Close on outside click
    - ESC key handler
    - Animasyonlar (fade-in, zoom-in)
    - _Requirements: 6.1_
  
  - [ ] 11.2 ProductDetailModal tab yapısını oluştur
    - Tab navigation component
    - 5 tab: Overview, Marketing, Quality, Channels, Simulator
    - Active tab state management
    - _Requirements: 6.1-6.8_
  
  - [ ] 11.3 Overview tab içeriğini oluştur
    - Temel bilgiler (name, SKU, price, stock)
    - Karlılık metrikleri (net profit, margin, COGS)
    - Stok durumu göstergesi
    - _Requirements: 6.2, 6.3, 6.7_
  
  - [ ] 11.4 Marketing tab içeriğini oluştur
    - ROAS, conversion rate, ad spend
    - Kanal bazlı performans tablosu
    - _Requirements: 6.4, 6.8_
  
  - [ ] 11.5 Quality tab içeriğini oluştur
    - Ürün puanı, iade oranı
    - İade nedenleri pie chart (Recharts)
    - _Requirements: 6.5, 6.6_
  
  - [ ] 11.6 Channels tab içeriğini oluştur
    - Kanal karşılaştırma tablosu
    - Her kanal için: price, commission, units, profit, margin
    - _Requirements: 6.8_
  
  - [ ]* 11.7 Modal state management için property testleri yaz
    - **Property 25: Modal State Consistency**
    - _Requirements: 1.2, 6.1_

- [ ] 12. Price Simulator'ı geliştir
  - [ ] 12.1 Simulation state management oluştur
    - useState for simulation values
    - Price, margin, profit, diffMargin, newProfit
    - _Requirements: 7.1_
  
  - [ ] 12.2 Simulation calculation fonksiyonunu implement et
    - calculateSimulation: Yeni fiyata göre kar/marj hesapla
    - Volume elasticity uygula (1% fiyat artışı = 0.5% hacim düşüşü)
    - _Requirements: 7.2, 7.5, 7.6_
  
  - [ ] 12.3 PriceSimulator UI component'ini oluştur
    - Price input field
    - Adjustment buttons (+10, +50, +100, -10, -50, -100)
    - Real-time calculation display
    - Margin diff indicator
    - Reset button
    - _Requirements: 7.1-7.7_
  
  - [ ]* 12.4 Simulator için property testleri yaz
    - **Property 14: Price Simulation Calculation**
    - **Property 15: Simulation Reset Idempotence**
    - **Property 16: Volume Elasticity Application**
    - _Requirements: 7.2, 7.4, 7.5, 7.6, 7.7_

- [ ] 13. Expense Detail Modal'larını geliştir
  - [ ] 13.1 ExpenseDetailModal component oluştur
    - Modal base kullan
    - Expense data prop
    - Sub-items listesi
    - Toplam ve yüzde gösterimi
    - _Requirements: 8.1-8.6_
  
  - [ ] 13.2 Expense data yapısını hazırla
    - Her gider kalemi için sub-items
    - İadeler, Ürün Maliyeti, Pazarlama, Lojistik, Komisyon
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 13.3 Expense modal için property testleri yaz
    - **Property 26: Expense Detail Modal Data Binding**
    - _Requirements: 3.4, 8.1, 8.2, 8.4_

- [ ] 14. KPI Detail Modal'larını geliştir
  - [ ] 14.1 MarginAnalysisModal oluştur
    - 6 aylık trend grafiği
    - Gelir dağılımı bar chart
    - Marjı aşağı çeken ürünler tablosu
    - _Requirements: 2.5_
  
  - [ ] 14.2 LossMakersModal oluştur
    - Zarar eden ürünler listesi
    - Birim zarar ve toplam zarar gösterimi
    - _Requirements: 2.5_
  
  - [ ] 14.3 MERModal oluştur
    - MER trend grafiği
    - Kanal bazlı MER kırılımı
    - _Requirements: 2.5_
  
  - [ ] 14.4 ReturnLossModal oluştur
    - İade kayıp trend grafiği
    - Ürün bazlı iade analizi
    - _Requirements: 2.5_

- [ ] 15. Checkpoint - Modal'lar ve simülatör kontrolü
  - Tüm modal'ların açılıp kapandığını test et
  - Fiyat simülatörünün doğru hesaplama yaptığını doğrula
  - Tab navigation'ın çalıştığını kontrol et
  - Kullanıcıya sorular varsa sor

- [ ] 16. Filtreleme ve arama özelliklerini implement et
  - [ ] 16.1 SearchBar component oluştur
    - Text input with search icon
    - Real-time filtering
    - Clear button
    - _Requirements: 9.1, 9.2_
  
  - [ ] 16.2 FilterPanel component oluştur
    - Profitability filter (All, Profitable, Loss)
    - Channel filter (multi-select)
    - Price range slider
    - Active filter count badge
    - Reset filters button
    - _Requirements: 9.3, 9.4, 9.5, 9.7_
  
  - [ ] 16.3 Filter logic fonksiyonlarını implement et
    - filterBySearch: İsim ve SKU'ya göre filtrele
    - filterByProfitability: Kar/zarar durumuna göre
    - filterByChannel: Kanal bazlı
    - filterByPriceRange: Fiyat aralığına göre
    - composeFilters: Tüm filtreleri birleştir
    - _Requirements: 9.2-9.5_
  
  - [ ]* 16.4 Filtreleme için property testleri yaz
    - **Property 17: Search Filter Correctness**
    - **Property 18: Profitability Filter Correctness**
    - **Property 19: Filter Composition**
    - **Property 20: Filter Reset Completeness**
    - _Requirements: 9.2, 9.3, 9.6_

- [ ] 17. Veri dışa aktarma özelliğini implement et
  - [ ] 17.1 Export utility fonksiyonlarını oluştur
    - exportToExcel: XLSX format
    - exportToCSV: CSV format
    - exportToPDF: PDF format (optional)
    - _Requirements: 10.2, 10.3_
  
  - [ ] 17.2 ExportButton component oluştur
    - Dropdown menu ile format seçimi
    - Export progress indicator
    - Success notification
    - _Requirements: 10.1, 10.7_
  
  - [ ] 17.3 Export data preparation fonksiyonu
    - Mevcut filtrelere göre veri hazırla
    - Özet metrikleri dahil et
    - Tarih damgası ekle
    - _Requirements: 10.3, 10.4, 10.5, 10.6_

- [ ] 18. Responsive tasarım optimizasyonları
  - [ ] 18.1 Mobile layout düzenlemeleri
    - Tablo yerine kart görünümü (< 768px)
    - Hamburger menü
    - Touch-friendly butonlar
    - _Requirements: 11.2, 11.3, 11.4, 11.6_
  
  - [ ] 18.2 Tablet layout düzenlemeleri
    - 2 sütun grid layout
    - Optimized chart sizes
    - _Requirements: 11.7_
  
  - [ ] 18.3 Grafik responsive scaling
    - ResponsiveContainer kullanımı
    - Viewport-based sizing
    - _Requirements: 11.5_

- [ ] 19. Performans optimizasyonları
  - [ ] 19.1 React.memo ve useMemo optimizasyonları
    - Expensive component'leri memo'la
    - Hesaplama fonksiyonlarını useMemo ile cache'le
    - useCallback ile handler'ları optimize et
    - _Requirements: 12.4_
  
  - [ ] 19.2 Lazy loading ve code splitting
    - Modal'ları lazy load et
    - Route-based code splitting
    - _Requirements: 12.5_
  
  - [ ] 19.3 Virtualization (optional)
    - Büyük listeler için react-window kullan
    - 1000+ ürün desteği
    - _Requirements: 12.7_

- [ ] 20. Hata yönetimi ve kullanıcı geri bildirimi
  - [ ] 20.1 Error boundary component oluştur
    - Catch React errors
    - Fallback UI
    - Error logging
    - _Requirements: 13.7_
  
  - [ ] 20.2 Notification system oluştur
    - Toast notifications
    - Success, error, warning, info types
    - Auto-dismiss
    - _Requirements: 13.1, 13.3_
  
  - [ ] 20.3 Loading states ekle
    - Skeleton loaders
    - Spinner components
    - Progress indicators
    - _Requirements: 13.2_
  
  - [ ]* 20.4 Error handling için property testleri yaz
    - **Property 36: Error Message Display**
    - **Property 37: Loading State Indication**
    - _Requirements: 13.1, 13.2, 13.7_

- [ ] 21. Çoklu dil desteği (i18n)
  - [ ] 21.1 i18n yapısını kur
    - react-i18next veya benzer kütüphane
    - Türkçe ve İngilizce dil dosyaları
    - _Requirements: 15.1_
  
  - [ ] 21.2 Tüm metinleri i18n key'leri ile değiştir
    - UI labels
    - Error messages
    - Tooltips
    - _Requirements: 15.2_
  
  - [ ] 21.3 Format fonksiyonlarını locale-aware yap
    - Currency formatting
    - Date formatting
    - Number formatting
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [ ] 21.4 Language switcher component ekle
    - Dil seçim dropdown
    - Local storage persistence
    - _Requirements: 15.6, 15.7_
  
  - [ ]* 21.5 Localization için property testleri yaz
    - **Property 34: Currency Format Consistency**
    - **Property 35: Date Format Consistency**
    - _Requirements: 15.3, 15.4_

- [ ] 22. Checkpoint - Filtreleme ve optimizasyon kontrolü
  - Tüm filtrelerin doğru çalıştığını test et
  - Export fonksiyonunun çalıştığını doğrula
  - Responsive tasarımı farklı ekran boyutlarında test et
  - Performans metriklerini kontrol et
  - Kullanıcıya sorular varsa sor

- [ ] 23. Gelişmiş özellikler - Karşılaştırma
  - [ ] 23.1 Product comparison state management
    - Selected products array (max 5)
    - Comparison mode toggle
    - _Requirements: 16.1_
  
  - [ ] 23.2 ProductSelector component oluştur
    - Multi-select interface
    - Selected count indicator
    - _Requirements: 16.2_
  
  - [ ] 23.3 ComparisonView component oluştur
    - Side-by-side metric display
    - Benchmark line
    - Best/worst highlighting
    - _Requirements: 16.2, 16.3, 16.4, 16.5_
  
  - [ ] 23.4 Comparison export ve save
    - Export comparison results
    - Save comparison sets
    - _Requirements: 16.6, 16.7_
  
  - [ ]* 23.5 Comparison için property testleri yaz
    - **Property 27: Comparison Set Size Limit**
    - **Property 28: Benchmark Calculation**
    - _Requirements: 16.1, 16.4_

- [ ] 24. Gelişmiş özellikler - Zaman aralığı
  - [ ] 24.1 DateRangePicker component oluştur
    - Preset ranges (7d, 30d, 3m, 6m, 1y)
    - Custom range calendar
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [ ] 24.2 Date filtering logic implement et
    - filterByDateRange fonksiyonu
    - Previous period calculation
    - _Requirements: 17.4, 17.5_
  
  - [ ] 24.3 Historical trend charts ekle
    - Time series data visualization
    - Period comparison
    - _Requirements: 17.6_
  
  - [ ]* 24.4 Date range için property testleri yaz
    - **Property 29: Date Range Filter Application**
    - **Property 30: Period Comparison Consistency**
    - _Requirements: 17.4, 17.5_

- [ ] 25. Gelişmiş özellikler - Otomatik uyarılar
  - [ ] 25.1 Alert configuration interface
    - Threshold settings per metric
    - Alert preferences
    - _Requirements: 18.1, 18.5_
  
  - [ ] 25.2 Alert engine implement et
    - Threshold monitoring
    - Alert triggering logic
    - _Requirements: 18.2, 18.3_
  
  - [ ] 25.3 Notification delivery
    - In-app notifications
    - Email notifications (backend integration)
    - Notification history
    - _Requirements: 18.4, 18.6, 18.7_
  
  - [ ]* 25.4 Alert system için property testleri yaz
    - **Property 31: Threshold Alert Triggering**
    - _Requirements: 18.2, 18.3_

- [ ] 26. Gelişmiş özellikler - Toplu işlemler
  - [ ] 26.1 Bulk selection UI
    - Checkbox per row
    - Select all checkbox
    - Selected count indicator
    - _Requirements: 19.1, 19.2_
  
  - [ ] 26.2 Bulk actions menu
    - Bulk price update
    - Bulk category assignment
    - Bulk export
    - _Requirements: 19.3, 19.4, 19.5, 19.6_
  
  - [ ] 26.3 Bulk operation handlers
    - Apply operations to selected products
    - Success/failure feedback
    - _Requirements: 19.7_
  
  - [ ]* 26.4 Bulk operations için property testleri yaz
    - **Property 32: Bulk Selection Consistency**
    - **Property 33: Select All Completeness**
    - _Requirements: 19.4, 19.2_

- [ ] 27. Gelişmiş özellikler - Dashboard özelleştirme
  - [ ] 27.1 Drag-and-drop layout system
    - react-grid-layout veya benzer kütüphane
    - Widget repositioning
    - _Requirements: 20.1_
  
  - [ ] 27.2 Widget visibility controls
    - Show/hide widgets
    - Widget configuration
    - _Requirements: 20.2_
  
  - [ ] 27.3 Layout presets ve persistence
    - 3 farklı layout şablonu
    - Save custom layouts
    - Local storage persistence
    - Reset to default
    - _Requirements: 20.3, 20.4, 20.5, 20.6_
  
  - [ ] 27.4 Column width adjustment
    - Resizable columns
    - Persist column widths
    - _Requirements: 20.7_

- [ ] 28. Final checkpoint ve integration
  - Tüm özelliklerin birlikte çalıştığını test et
  - End-to-end user flow'ları test et
  - Tüm property testlerinin geçtiğini doğrula
  - Performance audit yap (Lighthouse)
  - Accessibility audit yap
  - Cross-browser testing
  - Kullanıcıya final demo yap

- [ ] 29. Dokümantasyon ve cleanup
  - README güncelle
  - Component dokümantasyonu ekle
  - API dokümantasyonu ekle
  - Kullanım örnekleri ekle
  - Unused code'ları temizle
  - Console.log'ları temizle
  - Code formatting (Prettier)
  - Linting (ESLint)

## Notes

- `*` ile işaretli task'lar optional property-based test task'larıdır ve daha hızlı MVP için atlanabilir
- Her task, önceki task'lerin tamamlanmasını gerektirir
- Checkpoint task'ları, ilerlemeyi doğrulamak ve kullanıcı geri bildirimi almak için kritiktir
- Property testleri, fast-check kütüphanesi ile minimum 100 iterasyon ile çalıştırılmalıdır
- Her property test, design dokümanındaki ilgili property'yi referans almalıdır
- Responsive tasarım, tüm component'lerde baştan itibaren göz önünde bulundurulmalıdır
- Performans optimizasyonları, büyük veri setleri (1000+ ürün) için kritiktir
