# Requirements Document

## Introduction

Bu doküman, e-ticaret işletmeleri için kapsamlı bir ürün karlılık analizi dashboard'unun gereksinimlerini tanımlar. Sistem, ürün bazlı gelir-gider analizini, trend takibini, AI destekli önerileri ve simülasyon araçlarını içeren bir SaaS platformudur. Mevcut ProductProfitability sayfası üzerine inşa edilecek bu sistem, işletmelerin ürün portföylerini optimize etmelerine ve karlılığı maksimize etmelerine yardımcı olacaktır.

## Glossary

- **System**: Ürün Karlılık Analizi Dashboard Sistemi
- **User**: Dashboard'u kullanan e-ticaret işletme sahibi veya yöneticisi
- **Product**: Satışa sunulan fiziksel veya dijital ürün
- **Unit_Economics**: Ürün bazında birim başına gelir ve maliyet analizi
- **Net_Profit**: Toplam gelirden tüm maliyetler düşüldükten sonra kalan tutar
- **Margin**: Net karın gelire oranı (yüzde olarak)
- **COGS**: Cost of Goods Sold - Satılan Malın Maliyeti
- **MER**: Marketing Efficiency Ratio - Pazarlama Verimlilik Oranı
- **ROAS**: Return on Ad Spend - Reklam Harcaması Getirisi
- **Sankey_Diagram**: Gelir akışını görselleştiren diyagram türü
- **AI_Insight**: Yapay zeka tarafından üretilen analiz ve öneri
- **Price_Simulator**: Fiyat değişikliklerinin etkisini simüle eden araç
- **Trend_Analysis**: Zaman içindeki performans değişimlerinin analizi
- **Loss_Maker**: Zarar eden ürün
- **Winner**: Performansı artan ürün
- **Loser**: Performansı düşen ürün

## Requirements

### Requirement 1: Unit Economics Tablosu

**User Story:** E-ticaret yöneticisi olarak, tüm ürünlerimin birim bazında karlılık analizini görmek istiyorum, böylece hangi ürünlerin kar/zarar ettiğini anlayabilirim.

#### Acceptance Criteria

1. WHEN User tabloyu görüntülediğinde, THE System SHALL her ürün için SKU, isim, fiyat, satış adedi, gelir, iadeler, COGS, değişken maliyetler, reklam gideri, sabit giderler, net kar ve marj bilgilerini gösterecek
2. WHEN User bir ürün satırına tıkladığında, THE System SHALL o ürünün detaylı modal penceresini açacak
3. WHEN User tablo sütun başlığına tıkladığında, THE System SHALL tabloyu o sütuna göre sıralayacak
4. WHEN User sayfalama kontrollerini kullandığında, THE System SHALL sayfa başına gösterilecek satır sayısını değiştirecek
5. THE System SHALL zarar eden ürünleri görsel olarak vurgulayacak (kırmızı renk tonu)
6. WHEN User tabloyu görüntülediğinde, THE System SHALL toplam satırında tüm ürünlerin toplamını gösterecek

### Requirement 2: KPI Kartları

**User Story:** Dashboard kullanıcısı olarak, işletmemin genel karlılık metriklerini hızlıca görmek istiyorum, böylece kritik alanlara odaklanabilirim.

#### Acceptance Criteria

1. THE System SHALL ortalama net kar marjını yüzde olarak gösterecek
2. THE System SHALL zarar eden ürün sayısını gösterecek
3. THE System SHALL pazarlama verimlilik oranını (MER) hesaplayıp gösterecek
4. THE System SHALL aylık iade kayıp tutarını gösterecek
5. WHEN User bir KPI kartına tıkladığında, THE System SHALL o metriğin detaylı analiz modalını açacak
6. THE System SHALL her KPI için önceki döneme göre değişim yüzdesini gösterecek
7. THE System SHALL kritik eşik değerlerin altında/üstünde olan metrikleri görsel olarak vurgulayacak

### Requirement 3: Sankey Diyagramı (Gelir Akışı)

**User Story:** Finans yöneticisi olarak, toplam ciroda her gider kaleminin payını görsel olarak görmek istiyorum, böylece maliyet yapısını kolayca anlayabilirim.

#### Acceptance Criteria

1. THE System SHALL toplam cirodan başlayan bir Sankey diyagramı gösterecek
2. THE System SHALL iadeler, ürün maliyeti, pazarlama, lojistik, komisyon ve net kar akışlarını gösterecek
3. WHEN User bir akış çizgisine hover yaptığında, THE System SHALL o gider kaleminin tutarını ve yüzdesini gösterecek
4. WHEN User bir gider düğümüne tıkladığında, THE System SHALL o giderin alt kalemlerini gösteren modal açacak
5. THE System SHALL her gider kalemini farklı renk ile kodlayacak
6. THE System SHALL akış kalınlıklarını tutar oranına göre ölçeklendirecek

### Requirement 4: Trend Analizi (Kazananlar ve Kaybedenler)

**User Story:** Ürün yöneticisi olarak, hangi ürünlerin performansının arttığını/azaldığını görmek istiyorum, böylece stratejik kararlar alabilirim.

#### Acceptance Criteria

1. THE System SHALL önceki döneme göre net kar artışı olan ürünleri "Kazananlar" listesinde gösterecek
2. THE System SHALL önceki döneme göre net kar düşüşü olan ürünleri "Kaybedenler" listesinde gösterecek
3. WHEN User "Net Kar" ve "Satış Adedi" arasında geçiş yaptığında, THE System SHALL trend metriğini değiştirecek
4. THE System SHALL her ürün için önceki ay ve mevcut ay değerlerini gösterecek
5. THE System SHALL değişim miktarını ve yüzdesini gösterecek
6. THE System SHALL her ürün için mini sparkline grafiği gösterecek
7. WHEN User kaybedenler listesindeki bir ürüne tıkladığında, THE System SHALL o ürün için teşhis ve aksiyon önerisi gösterecek

### Requirement 5: AI Destekli Öngörüler ve Öneriler

**User Story:** İşletme sahibi olarak, sorunlu ürünler için AI destekli çözüm önerileri almak istiyorum, böylece hızlı aksiyon alabilirim.

#### Acceptance Criteria

1. WHEN System bir ürünün performans düşüşü tespit ettiğinde, THE System SHALL otomatik teşhis rozeti gösterecek (örn: "KAR DÜŞÜŞÜ", "CPA ALARMI")
2. THE System SHALL her teşhis için aksiyon butonu gösterecek (örn: "Durdur", "Fiyat Artır", "Kampanya")
3. WHEN User aksiyon butonuna tıkladığında, THE System SHALL AI konsültasyon arayüzünü açacak
4. THE System SHALL ürün verilerine dayalı bağlamsal prompt oluşturacak
5. THE System SHALL en az 6 farklı teşhis senaryosunu destekleyecek (kar düşüşü, yüksek CPA, düşük marj, satış durması, yüksek iade, talep düşüşü)
6. WHEN User AI önerisini görüntülediğinde, THE System SHALL ürün metriklerini ve önerilen aksiyonları gösterecek

### Requirement 6: Detaylı Ürün Modal Penceresi

**User Story:** Ürün yöneticisi olarak, bir ürünün tüm detaylarını tek bir yerde görmek istiyorum, böylece kapsamlı analiz yapabilirim.

#### Acceptance Criteria

1. WHEN User bir ürüne tıkladığında, THE System SHALL ürün detay modalını açacak
2. THE System SHALL ürünün temel bilgilerini gösterecek (isim, SKU, fiyat, stok)
3. THE System SHALL ürünün karlılık metriklerini gösterecek (net kar, marj, COGS)
4. THE System SHALL ürünün pazarlama metriklerini gösterecek (ROAS, dönüşüm oranı, reklam harcaması)
5. THE System SHALL ürünün kalite metriklerini gösterecek (puan, iade oranı)
6. THE System SHALL iade nedenlerinin dağılımını gösterecek
7. THE System SHALL stok durumu ve tahmini tükenme süresini gösterecek
8. THE System SHALL kanal bazlı performans kırılımını gösterecek

### Requirement 7: Fiyat Simülatörü

**User Story:** Fiyatlandırma yöneticisi olarak, fiyat değişikliklerinin karlılığa etkisini simüle etmek istiyorum, böylece optimal fiyat belirleyebilirim.

#### Acceptance Criteria

1. WHEN User ürün detay modalında simülatör sekmesini açtığında, THE System SHALL mevcut fiyat ve marj bilgilerini gösterecek
2. WHEN User fiyat değerini değiştirdiğinde, THE System SHALL yeni net karı ve marjı gerçek zamanlı hesaplayacak
3. THE System SHALL fiyat artış/azalış butonları sağlayacak (örn: +10₺, -10₺)
4. THE System SHALL marj değişimini gösterecek (örn: +2.5%)
5. THE System SHALL talep esnekliğini dikkate alarak satış adedi tahmini yapacak
6. THE System SHALL toplam kar etkisini gösterecek
7. WHEN User simülasyonu sıfırladığında, THE System SHALL orijinal değerlere dönecek

### Requirement 8: Gider Detay Modalleri

**User Story:** Finans yöneticisi olarak, her gider kaleminin alt detaylarını görmek istiyorum, böylece maliyet optimizasyonu yapabilirim.

#### Acceptance Criteria

1. WHEN User Sankey diyagramında bir gider düğümüne tıkladığında, THE System SHALL gider detay modalını açacak
2. THE System SHALL gider kaleminin alt bileşenlerini listeleyecek
3. THE System SHALL her alt bileşen için tutar ve yüzde payını gösterecek
4. THE System SHALL toplam gider tutarını ve gelir içindeki payını gösterecek
5. THE System SHALL en az 5 ana gider kategorisi için detay sağlayacak (İadeler, Ürün Maliyeti, Pazarlama, Lojistik, Komisyon)
6. WHEN User modal dışına tıkladığında, THE System SHALL modalı kapatacak

### Requirement 9: Veri Filtreleme ve Arama

**User Story:** Dashboard kullanıcısı olarak, ürünleri filtreleyip arayabilmek istiyorum, böylece ilgilendiğim ürünlere hızlıca ulaşabilirim.

#### Acceptance Criteria

1. THE System SHALL ürün ismi ve SKU'ya göre arama kutusu sağlayacak
2. WHEN User arama kutusuna metin girdiğinde, THE System SHALL tabloyu gerçek zamanlı filtreleyecek
3. THE System SHALL karlılık durumuna göre filtre sağlayacak (Tümü, Karlı, Zararlı)
4. THE System SHALL kanal bazlı filtre sağlayacak
5. THE System SHALL fiyat aralığı filtresi sağlayacak
6. WHEN User filtreleri temizlediğinde, THE System SHALL tüm ürünleri gösterecek
7. THE System SHALL aktif filtre sayısını gösterecek

### Requirement 10: Veri Dışa Aktarma

**User Story:** Raporlama yöneticisi olarak, analiz verilerini dışa aktarmak istiyorum, böylece harici raporlama yapabilirim.

#### Acceptance Criteria

1. THE System SHALL "Raporu İndir" butonu sağlayacak
2. WHEN User indirme butonuna tıkladığında, THE System SHALL format seçenekleri gösterecek (Excel, CSV, PDF)
3. THE System SHALL mevcut filtrelere göre veri dışa aktaracak
4. THE System SHALL dışa aktarılan dosyaya tarih damgası ekleyecek
5. THE System SHALL tüm görünür sütunları dışa aktaracak
6. THE System SHALL özet metrikleri de dahil edecek
7. WHEN dışa aktarma tamamlandığında, THE System SHALL başarı mesajı gösterecek

### Requirement 11: Responsive Tasarım

**User Story:** Mobil kullanıcı olarak, dashboard'u farklı cihazlarda kullanabilmek istiyorum, böylece her yerden erişebilirim.

#### Acceptance Criteria

1. WHEN User dashboard'u mobil cihazda açtığında, THE System SHALL responsive layout gösterecek
2. THE System SHALL 768px altında tek sütun düzeni kullanacak
3. THE System SHALL dokunmatik etkileşimleri destekleyecek
4. THE System SHALL mobilde tablo yerine kart görünümü sunacak
5. THE System SHALL grafikleri mobil ekrana uygun ölçeklendirecek
6. THE System SHALL hamburger menü kullanacak
7. WHEN User tablet cihazda açtığında, THE System SHALL iki sütun düzeni kullanacak

### Requirement 12: Performans ve Optimizasyon

**User Story:** Sistem yöneticisi olarak, dashboard'un hızlı yüklenmesini ve sorunsuz çalışmasını istiyorum, böylece kullanıcı deneyimi iyi olur.

#### Acceptance Criteria

1. WHEN User dashboard'u ilk açtığında, THE System SHALL 2 saniye içinde ilk içeriği gösterecek
2. THE System SHALL büyük veri setlerini sayfalama ile yönetecek
3. THE System SHALL grafik renderlamalarını optimize edecek
4. THE System SHALL gereksiz yeniden renderlamaları önleyecek (React.memo, useMemo)
5. THE System SHALL lazy loading kullanacak
6. WHEN User filtreleme yaptığında, THE System SHALL 300ms içinde sonuç gösterecek
7. THE System SHALL 1000+ ürünü sorunsuz işleyecek

### Requirement 13: Hata Yönetimi ve Kullanıcı Geri Bildirimi

**User Story:** Dashboard kullanıcısı olarak, hata durumlarında bilgilendirilmek istiyorum, böylece ne olduğunu anlayabilirim.

#### Acceptance Criteria

1. WHEN System veri yüklerken hata oluştuğunda, THE System SHALL kullanıcı dostu hata mesajı gösterecek
2. THE System SHALL yükleme durumlarında loading göstergesi gösterecek
3. WHEN User bir işlem başarıyla tamamlandığında, THE System SHALL başarı bildirimi gösterecek
4. THE System SHALL kritik hatalarda yeniden deneme seçeneği sunacak
5. THE System SHALL ağ bağlantısı kesildiğinde offline mesajı gösterecek
6. THE System SHALL form validasyon hatalarını inline gösterecek
7. WHEN System beklenmeyen hata aldığında, THE System SHALL genel hata sayfası gösterecek

### Requirement 14: Veri Güvenliği ve Gizlilik

**User Story:** İşletme sahibi olarak, finansal verilerimin güvenli olmasını istiyorum, böylece gizlilik endişesi duymam.

#### Acceptance Criteria

1. THE System SHALL tüm API çağrılarını HTTPS üzerinden yapacak
2. THE System SHALL hassas verileri client-side'da şifreleyecek
3. THE System SHALL kullanıcı oturum süresini yönetecek
4. WHEN User oturumu sonlandığında, THE System SHALL tüm local storage'ı temizleyecek
5. THE System SHALL yetkisiz erişim denemelerini logLayacak
6. THE System SHALL GDPR uyumlu veri işleme yapacak
7. THE System SHALL kullanıcı verilerini anonim hale getirebilecek

### Requirement 15: Çoklu Dil Desteği

**User Story:** Uluslararası kullanıcı olarak, dashboard'u kendi dilimde kullanmak istiyorum, böylece daha rahat anlayabilirim.

#### Acceptance Criteria

1. THE System SHALL Türkçe ve İngilizce dil desteği sağlayacak
2. WHEN User dil değiştirdiğinde, THE System SHALL tüm arayüzü seçilen dile çevirecek
3. THE System SHALL para birimi formatını dile göre ayarlayacak
4. THE System SHALL tarih formatını dile göre ayarlayacak
5. THE System SHALL sayı formatını dile göre ayarlayacak (binlik ayırıcı)
6. THE System SHALL dil tercihini local storage'da saklayacak
7. WHEN User yeni oturum açtığında, THE System SHALL önceki dil tercihini hatırlayacak

### Requirement 16: Karşılaştırma ve Benchmark

**User Story:** Strateji yöneticisi olarak, ürünlerimi birbirleriyle ve sektör ortalamasıyla karşılaştırmak istiyorum, böylece konumumuzu görebilirim.

#### Acceptance Criteria

1. THE System SHALL en fazla 5 ürünü yan yana karşılaştırma özelliği sağlayacak
2. WHEN User karşılaştırma modunu açtığında, THE System SHALL ürün seçim arayüzü gösterecek
3. THE System SHALL seçilen ürünlerin tüm metriklerini paralel gösterecek
4. THE System SHALL sektör ortalaması benchmark çizgisi gösterecek
5. THE System SHALL her metrik için en iyi/en kötü performansı vurgulayacak
6. THE System SHALL karşılaştırma sonuçlarını dışa aktarabilecek
7. WHEN User karşılaştırmayı kaydettiğinde, THE System SHALL karşılaştırma setini saklayacak

### Requirement 17: Zaman Aralığı Seçimi ve Tarihsel Analiz

**User Story:** Analiz uzmanı olarak, farklı zaman aralıklarında performansı görmek istiyorum, böylece trend analizi yapabilirim.

#### Acceptance Criteria

1. THE System SHALL tarih aralığı seçici sağlayacak
2. THE System SHALL önceden tanımlı aralıklar sunacak (Son 7 gün, Son 30 gün, Son 3 ay, Son 6 ay, Son yıl)
3. WHEN User özel tarih aralığı seçtiğinde, THE System SHALL takvim arayüzü gösterecek
4. THE System SHALL seçilen aralığa göre tüm metrikleri yeniden hesaplayacak
5. THE System SHALL önceki dönem karşılaştırması yapacak
6. THE System SHALL tarihsel trend grafiklerini gösterecek
7. WHEN User tarih aralığını değiştirdiğinde, THE System SHALL tüm dashboard'u güncelleyecek

### Requirement 18: Otomatik Uyarılar ve Bildirimler

**User Story:** İşletme yöneticisi olarak, kritik durumlarda otomatik uyarı almak istiyorum, böylece hızlı müdahale edebilirim.

#### Acceptance Criteria

1. THE System SHALL kullanıcı tanımlı eşik değerleri destekleyecek
2. WHEN bir ürünün marjı eşik değerin altına düştüğünde, THE System SHALL uyarı gösterecek
3. WHEN bir ürünün iade oranı kritik seviyeye ulaştığında, THE System SHALL bildirim gönderecek
4. THE System SHALL günlük özet raporu e-posta ile gönderecek
5. THE System SHALL uyarı tercihlerini kullanıcı bazında saklayacak
6. WHEN User bildirimi tıkladığında, THE System SHALL ilgili ürün detayına yönlendirecek
7. THE System SHALL bildirim geçmişini saklayacak

### Requirement 19: Toplu İşlemler

**User Story:** Operasyon yöneticisi olarak, birden fazla ürün üzerinde toplu işlem yapmak istiyorum, böylece zaman kazanabilirim.

#### Acceptance Criteria

1. THE System SHALL çoklu ürün seçimi için checkbox sağlayacak
2. THE System SHALL "Tümünü Seç" seçeneği sunacak
3. WHEN User ürünler seçtiğinde, THE System SHALL toplu işlem menüsü gösterecek
4. THE System SHALL toplu fiyat güncelleme yapabilecek
5. THE System SHALL toplu kategori atama yapabilecek
6. THE System SHALL toplu dışa aktarma yapabilecek
7. WHEN toplu işlem tamamlandığında, THE System SHALL etkilenen ürün sayısını gösterecek

### Requirement 20: Dashboard Özelleştirme

**User Story:** Dashboard kullanıcısı olarak, görünümü kendi ihtiyaçlarıma göre özelleştirmek istiyorum, böylece daha verimli çalışabilirim.

#### Acceptance Criteria

1. THE System SHALL widget'ları sürükle-bırak ile yeniden düzenleme imkanı sunacak
2. THE System SHALL widget'ları gizleme/gösterme seçeneği sağlayacak
3. THE System SHALL özel dashboard düzenleri kaydetme imkanı sunacak
4. THE System SHALL varsayılan görünüme dönme seçeneği sağlayacak
5. WHEN User düzen değiştirdiğinde, THE System SHALL tercihleri local storage'da saklayacak
6. THE System SHALL en az 3 farklı düzen şablonu sunacak
7. THE System SHALL sütun genişliklerini ayarlama imkanı sunacak
