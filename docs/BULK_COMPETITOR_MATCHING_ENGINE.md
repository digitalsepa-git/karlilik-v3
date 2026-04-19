# Toplu Rakip Eşleştirme Motoru ve Makine Öğrenimi (ML)

Bu döküman, Karlılık Analizi projesindeki "Rekabet Analizi" sekmesinin altında çalışan **Çoklu Ürün Web Scraping ve İsim Benzerliği Algoritması'nın** (`analytics.js -> /scan`) çalışma mantığını belgelemektedir. Böylece sonraki oturumlarda farklı pazar yerleri sisteme dahil edilirken bu belge mimari rehber olacaktır. 

## 1. Playwright Web Scraping Motoru ve Mimari
Rakip bir marka mağazası veya arama URL'si (`/api/scan` üzerinden) backend sunucusuna iletildiğinde, sunucu arka planda Chromium tabanlı gerçek boyutlu bir tarayıcı başlatır.

### Bot Koruma Sistemlerini (Cloudflare vb.) Aşma (Bypass) Metodları
Özellikle Beymen gibi çok agresif waf (web application firewall) kurallarına sahip e-ticaret altyapılarında "otomasyon botu" damgası yememek için şu parmak izi gizleme yöntemleri kalıcı olarak kodlanmıştır:
- **`headless: false`** moduna geçilerek GUI (Kullanıcı Arayüzü) barındıran gerçek bir tarayıcı simüle edilir.
- `--disable-blink-features=AutomationControlled` bayrağı ile tarayıcının kimliği sıyırılır.
- `context.addInitScript()` ile sayfa DOM'u yüklenmeden önce sanal donanımlar (Sahte Plugin'ler, sistem dilleri, Webdriver flag iptali `window.chrome`) Javascript nesnelerine manipüle edilerek yerleştirilir. Özel korumaların şüphelenmesi engellenir.

## 2. Çoklu Dağıtım Modelleri (Catalog Routing)

Sistem `url` kelimelerini analiz ederek tarayıcısını o siteye özel CSS yakalayıcılara (QuerySelectors) odaklar. Sadece bir sayfada **birden fazla yüzlerce kart** okuyabileceği 3 ana mode ayarlanmıştır:

1. **Trendyol Modu (`isTrendyolStore`):** `.p-card-wrppr` bloklarını tarar, resim, marka (`.brand-name`) ve indirimli fiyatları toplar. 1500px scroll yaparak sayfadaki lazy load görselleri aktif eder.
2. **Beymen Modu (`isBeymenStore`):** `.o-productList__item` yapılarını tarar. 
3. **Evrensel Kategori Modu (`generic`):** Yukarıdakiler dışındaki Sephora/Watsons vb. çoklu ürün vitrinlerinde genel geçer html sınıflarını `.product-card, .card` yakalar.

*Not: Eğer link bu tanımlı genel-katalog kalıplarından birine uymuyorsa, sistem zekice davranıp URL'yi Tekil Ürün Sayfası sanıp sayfadaki bir adet `<h1>` ve meta etiket fiyatına odaklanır.*

## 3. Akıllı Eşleştirme Sistemi (String Similarity ML Algoritması)
Tarayıcıdan dönen 100+ adet rakip ürün fiyatı listesi, doğrudan frontend'e iletilmek yerine backend'deki `string-similarity` motoruyla (Sørensen–Dice coefficient matematiği kullanılarak) şirketinizin `ikas` veya veri tabanındaki orijinal katalog *(Örn: Foreo Luna 3)* ürün adlarıyla çarpıştırılır. 

### Kurallar:
- Fiyatlar metin formatından kurtarılır, kuruş ve virgül kalıpları (ParseFloat) saf Double değişkenine çevrilir. (Örn: "1.499,99 TL" > `1499.99`).
- Her koparılan rakip isim kombinasyonu, envanterinizdeki her bir Cihaz Cilt/Yüz ismi ile harf-harf oranlanır. 
- Eğer eşleşme benzeme oranı (Score) **`> %50 (0.50)`** ise, makine bunun "Kesin Eşleşme" olduğuna karar verir ve sizin listenize yan yana gösterilmek üzere koyar.
- Çok az benzeyenler (`<%50`), ekrandaki veri kalabalığını engellemek adına doğrudan çöpe atılır ve analiz listesine girmez.

Bu üç anahtar motor (`analytics.js`), rekabet verilerinizi tam kontrollü ve akıllı şekilde size sağlar.
