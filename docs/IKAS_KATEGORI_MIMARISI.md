# Ikas Kategori Ağacı (Category Tree) Mimarisi 

Bu belge, uygulamanın **Ikas API** üzerinden ürün kategorilerini nasıl bağladığını ve neden kelime bazlı string eşleştirmeden vazgeçildiğini gelecekteki geliştirme oturumları (sessions) için kayıt altına alır. **Tüm yeni geliştirmeler bu mimari kurala uymak zorundadır.**

## 1. Mimarin Temel Kuralı
Ürünlerin kategorileri (`useOrders.js` veya `useIkasProducts.js` içerisindeki string analiz metodlarıyla) isimlerindeki "krem, maske, cihaz" gibi kelimelere bakılarak **BELİRLENMEMELİDİR**. Orijinal web sitesinde yer alan kategori ağacı korunmalıdır.

Bunun yerine, Ikas GraphQL API'sinden hem ürünler hem de kategoriler çekilmeli ve ürünlerin bağlı olduğu en alt kategori üzerinden ebeveyn (parent) silsilesi takip edilerek **Kök Kategoriye (Root Category)** ulaşılmalıdır.

## 2. Kök Kategoriye Ulaşma Algoritması (`getRootCategoryName`)

Sistemde ürün kategorisini bulan döngüsel (while) algoritma `src/hooks/useIkasProducts.js` içerisinde bulunmaktadır:

```javascript
// Tüm Ikas kategorilerini id bazlı bir Map üzerinde topluyoruz
const catMap = new Map();
if (data.listCategory) {
    data.listCategory.forEach(c => catMap.set(c.id, c));
}

// Bir ürünün categoryIds dizisinden yola çıkarak en üst atayı buluyoruz
const getRootCategoryName = (categoryIds) => {
    // Ürünün kategorisi yoksa Diğer'e atıyoruz
    if (!categoryIds || categoryIds.length === 0) return 'Diğer';
    
    // Ürünün bağlı olduğu ilk spesifik kategori
    let currentCat = catMap.get(categoryIds[0]);
    if (!currentCat) return 'Diğer';
    
    // Ağaçta yukarıya doğru tırmanış (Parent Category)
    while(currentCat.parentId) {
        const parent = catMap.get(currentCat.parentId);
        if (!parent) break;
        currentCat = parent;
    }
    
    // En tepedeki Ana Kategorinin ismini döndürüyoruz
    return currentCat.name; 
};
```

## 3. Finansal Raporlar (Dashboard) Dağılımı

Bu algoritma sayesinde Dashboard (Kârlılık Haritası vb.) otomatik olarak mağazanızın orijinal kök kategorilerine göre dağılım yapar. (Örn: `Cihazlar`, `Kozmetik Ürünler`, `Setler`, `Aksesuar`).

Böylece "Gündüz Kremi" ismine ya da ürün detayında geçen herhangi bir veriye bakılmaksızın;
1. Ürün "Gündüz" adlı alt kategoriye bağlıdır.
2. "Gündüz" kategorisinin parentId'si "Krem" kategorisidir.
3. "Krem" kategorisinin parentId'si "Kozmetik Ürünler" kategorisidir.
4. "Kozmetik Ürünler"in parentId'si olmadığı için Root (Kök) kabul edilir ve finansallar "Kozmetik Ürünler" kutusuna yazılır.

## 4. Trendyol ve Diğer Pazar Yerleri İstisnası
Ikas harici pazar yerlerindeki siparişler (`useOrders.js` içerisindeki Trendyol entegratörü), kategori ağacından direkt beslenemez (çünkü Ikas UUID yapısı kullanılmıyor). 
Bu nedenle, Trendyol siparişinin `category` değeri `useMemo` kancası vasıtasıyla `productName` veya `sku` üzerinden genel `products` havuzuyla eşleştirilmekte (cross-match) ve Ikas'taki Root kategorisi pazar yerine de miras bırakılmaktadır. 

**Özetle:** Bir ürünün doğru kategoride çıkması için uygulamanın koduna müdahale edilmesine gerek yoktur; e-ticaret altyapısında (Ikas'ta) doğru kategoriye yerleştirilmesi yeterlidir. Eğer Ikas'a yeni ürünler eklendiyse sayfadaki "Ürün Kaynağını Güncelle" butonuna basılması yeni ağacı render etmek için kafidir.
