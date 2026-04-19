# Product Management: Advanced Filtering & Bulk Cost Overrides

## Genel Bakış (Overview)
`ProductManagement.jsx` bileşeni basit bir liste görünümünden çıkarılarak "Akıllı Birim Ekonomisi Motoruna" (Smart Unit Economics Engine) dönüştürülmüştür.

Kullanıcılar artık ürünleri belirli metinlere, kategorilere veya markalara göre gelişmiş kurallarla filtreleyebilir, listelenen ürünlerin bir kısmını veya tamamını seçerek **"Toplu Maliyet (Bulk Cost)"** işlemi uygulayabilir. 

---

## 1. Toplu Filtreleme Altyapısı (Advanced Filtering)

### Mimari Detayları
Sistem, klasik string araması (`searchTerm`) üzerine inşa edilmiş bir dizi aktif kural havuzu mantığıyla çalışır. Eşsiz kategoriler ve markalar doğrudan global `products` objesi üzerinden `Set()` metodu kullanılarak anlık dinamik şekilde elde edilir. 

**Kullanılan State Değişkenleri:**
- `isFilterMenuOpen` (boolean): Filtre dropdown/popover arayüzünü kontrol eder.
- `tempFilters` (Array): Kullanıcının modaldaki "Uygula" butonuna basana kadar değiştirdiği filtre form kurallarıdır.
- `activeFilters` (Array): Gerçek anlamda `filteredProducts` değişkenini etkileyen referans liste.

**UI Özellikleri:**
- Kullanıcılar arama çubuğunun yanındaki "Filtre" butonuna tıklar.
- Filtre alanı (`category` / `brand`), Kural (`contains`, `equals`, vb.) ve Değer dinamik seçicileri form yapısıyla gelir.
- "Uygula" tıklandıktan sonra tablo otomatik değişir ve `activeFilters` havuzu genişler.

---

## 2. Toplu İşlem & Seçim Kutuları (Bulk Operations)

### Checkbox & Seçim İşlemleri
Tablonun sağındaki her bir Checkbox (satır düzeyindeki), ürün ID'sini bir listeye atar:
- `selectedIds`: Tablodan bizzat "check" atılarak seçilen ürün ID'lerinin havuzu.

### Bulk Edit Modal (Toplu Düzenleyici Formu)
Seçim yapıldıktan sonra ortaya çıkan **"X Ürünü Düzenle"** butonu, tetiklendiğinde `isBulkModalOpen` modalını ayağa kaldırır. Modal iki tipten veri kabul edebilir:
1. `bulkScope = 'selected'`: Sadece checkbox atılmış ürünler işlemi alır.
2. `bulkScope = 'all'`: Halihazırda filtreye takılmış **tüm `filteredProducts` listesi** işlemi alır.

---

## 3. Dinamik Kâr Hesabı & Persistence (Veri Kalıcılığı)

### `costOverrides` Veri Tabanı Mimarisi
Uygulama genelinde (sayfa açıkken in-memory çalışan) `costOverrides` objesi oluşturulmuştur.
Kullanıcı "Maliyet Düzenle" yapıp modal üzerinden işlemleri "Kaydet" butonuna gönderdiğinde:
```javascript
const applyBulkCostOverrides = () => {
    // 1. Hedef ID'ler Bulunur
    const targetIds = bulkScope === 'selected' ? selectedIds : filteredProducts.map(p => p.id);
    const newTotalCost = bulkCostBreakdown.reduce((sum, item) => sum + item.value, 0);
    
    // 2. State Üzerine Yazdırılır
    targetIds.forEach(id => {
        newOverrides[id] = { costBreakdown, costPrice: newTotalCost };
    });
    setCostOverrides(newOverrides);
}
```

### Motor Entegrasyonu (Recalculation Integration)
Bir ürün listelenirken veya tıklanıp detayı açılırken, uygulama varsayılan `product.price * 0.25` formülünü uygulamadan hemen önce `costOverrides[product.id]` objesini kontrol eder.
Eğer içerisinde veri varsa, **Kullanıcının Bulk Edit üzerinden gönderdiği kırılımlar (ambalaj, ciro, üretim vd.)** doğrudan baz alınır ve KDV ile komisyon net kâr matematiklerine dahil edilir.

---

## Sonraki Adımlar (Roadmap)
- Bu oturumda `costOverrides` sadece bellek (RAM) üzerinde çalışmaktadır. Gerçek sunucuya alınacağı zaman (ileriki oturumlarda), bir backend endpoint'i aracılığı ile `product_costs.json` içerisine yazılıp, uygulamanın ilk açılış aşamasından (`useIkasProducts` hook'u gibi) içeri dahil edilmesi gereklidir.
