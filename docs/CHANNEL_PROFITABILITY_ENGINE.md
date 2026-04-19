# Kanal Karlılığı ve Birim Ekonomi (ABC Model) Motoru

Bu döküman, Karlılık Analizi (DigitalSepa) projesindeki ürün maliyet dağılımı ve pazar yeri (Kanal) ayrıştırma matematiklerini, uygulanan iş kurallarını ve UI entegrasyonu detaylarını barındırır. Daha sonraki versiyonlarda veya oturumlarda projenin kaldığı yerden (veri ve matematik formülleri bozulmadan) sürdürülebilmesi için tasarlanmıştır.

## Matematik ve Veri Formülasyonları

### 1. Ürün Dinamik Maliyet (COGS) Belirlemesi
- Uygulanan Kural: Bütün ürünlerin maliyeti (COGS) kendi güncel Satış Fiyatının (Price) **%25'i** olarak kabul edilmektedir.
- Sebep: Veritabanında (Ikas) tüm varyantlara ait kesinleştirilmiş statik maliyet bulunmadığından oran bazlı dinamik maliyet modeli onaylı olarak devreye alınmıştır.

### 2. Phantom Ciro ve Bağımsız Operasyonel Gider Dağıtımı
Satışı gerçekleşmemiş ürünlerin de şirket bütçesinden (reklam & yazılım/sabit Gider) nasıl pay alacağını hesaplamak üzere **Faaliyet Tabanlı Maliyetlendirme (Activity-Based Costing - ABC)** yaklaşımı kuruldu:
- Satış adedi **0** olan ürünler için bir **Phantom Sales (Hayalet Satış)** adedi olarak `1` atandı.
- Her ürünün Toplam COGS ağırlığı üzerinden, şirketin global sabit gider bütçesinde sahip olduğu **Ağırlık Yüzdesi (Weight %)** belirlendi.
- Böylece en pahalı (COGS değeri yüksek) ürün şirket giderini en çok yüklenen, ucuz ürün ise daha az yüklenen şekilde kompanse edildi ve hiçbir ürünün kâr marjı ekstrem negatife/pozitife çekilmedi.
- Hedeflenen Karlılık fiyatı (`Buffer Price`) doğrudan `[Satış Fiyatı - (COGS + Komisyon + Kargo + Şirket Gider Payı + Reklam Payı) + Phantom Ek Pay]` formülü ile tabloya yansıtıldı.

### 3. Kanal Bazlı (Trendyol & Web) Ciro ve Kar Dağıtımı (Yeni Özellik)
API'den gelen karmaşık organik 100 sipariş verisi içerisinde yer alan farklı kaynaklar için iki ana kanal oluşturuldu:
1. **Trendyol (Marketplace)** (`isTy`)
2. **Web (Ikas)** (`isIkas`)

Veri işlenirken bu kanallara ait ciro ve satış adetleri net olarak ayrıştırılır.

**Kanal Bazlı Çapraz ABC Algoritması:**
Global Şirket Gideri (*Fixed Ops*) ve Pazarlama Bütçesi (*Marketing*), yine ürün bazında yaptığımız gibi **Kanalların Genel Satışlardaki Toplam Ürün Maliyeti (COGS)** hacmine göre oranlanarak (Ratio = Kanal COGS / Toplam COGS) kanala özel düşülmüştür. (Yani, Web'den %40 satış yapılıp, Trendyol'dan %60 yapılmışsa; şirket masraflarının %60'ını Trendyol öder).
- Bu sayede Birim Ekonomi tablosunun en altındaki `GRAND TOTAL NET PROFIT` rakamı ile, tepedeki **Kanal Bazlı Karlılık** kartlarındaki Karların toplamı %100 birbirine eşit çıkar.

## Arayüz (UI) Geliştirmeleri

1. **Dashboard Kartları (Channel metrics):** `ProductProfitability.jsx` içerisine eklenen üst yatay blok. `Ciro, Kâr, Marj, Komisyon, Satış` metriklerini taşır. Turuncu (Trendyol) ve İndigo (Web) renk paleti mevcuttur.
2. **Halka (Doughnut) Grafikler (Recharts):** Sağ tarafı bölen 12 kolonluk grid yapısı (Sol: Kartlar, Sağ: Grafikler). Ciro Dağılımı ve Net Kâr dağılımı oranları %100 canlı API verisi ile merkezde "Toplam Ciro" rakamıyla render edilmiştir. Duplicate `PieChart` hatası ikon import'ları düzeltilerek stabil hale getirilmiştir. 

## Git Push Hazırlığı

Kodun bir sonraki yayını (GitHub'a) aktarımı için her detay bu dokümana, terminal loglarına, `src/pages/ProductProfitability.jsx` modülünün içerisindeki saf component blocklarına başarıyla gömülmüştür.

Sistem, bir sonraki `npm run dev` veya github checkout işleminde tamamen kaldığı yerden çalışır formdadır. Hiçbir tarayıcı önbelleğine, console log'a ihtiyacı yoktur. Her şey projenin dosya yapısının omurgasına kodlanmıştır.
