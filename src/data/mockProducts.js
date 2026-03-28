export const RAW_PRODUCTS = [
    {
        id: 1,
        type: 'velocity',
        name: 'Wireless Ergonomic Mouse',
        sku: 'SKU-1001',
        brand: 'Logitech',
        competitorPrice: 690, // Normal case
        category: 'Cilt Bakım Cihazları',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop',
        cogs: 456, shipping: 40, adSpend: 32, fixedCost: 25, unitsSold: 420, stock: 245,
        channels: [{ id: 'c1', name: 'Trendyol', type: 'marketplace', price: 680, commission: 80, units: 250 }, { id: 'c2', name: 'Web', type: 'web', price: 650, commission: 10, units: 170 }]
    },
    {
        id: 2,
        type: 'normal',
        name: 'Mechanical Gaming Keyboard',
        sku: 'SKU-1002',
        brand: 'Razer',
        competitorPrice: 1100, // Buybox Lost (We are 1250)
        category: 'Cilt Bakım Cihazları',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop',
        cogs: 1020, shipping: 60, adSpend: 84, fixedCost: 40, unitsSold: 85, stock: 85,
        channels: [{ id: 'c3', name: 'Amazon', type: 'marketplace', price: 1250, commission: 180, units: 60 }, { id: 'c4', name: 'Web', type: 'web', price: 1150, commission: 20, units: 25 }]
    },
    {
        id: 3,
        type: 'critical',
        name: 'Budget USB Cable 1m',
        sku: 'SKU-1005',
        brand: 'Generic',
        competitorPrice: 40, // We are 45. Critical Margin 1.5%
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop',
        cogs: 38, shipping: 6, adSpend: 3, fixedCost: 2, unitsSold: 1200, stock: 800,
        channels: [{ id: 'c5', name: 'Trendyol', type: 'marketplace', price: 45, commission: 5, units: 800 }, { id: 'c6', name: 'Web', type: 'web', price: 40, commission: 1, units: 400 }]
    },
    {
        id: 4,
        type: 'normal',
        name: '4K Monitor 27 Inch',
        sku: 'SKU-1004',
        brand: 'Dell',
        competitorPrice: 8600, // Normal
        category: 'Cilt Bakım Cihazları',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop',
        cogs: 7680, shipping: 250, adSpend: 410, fixedCost: 200, unitsSold: 15, stock: 4,
        channels: [{ id: 'c7', name: 'Amazon', type: 'marketplace', price: 8500, commission: 1200, units: 10 }, { id: 'c8', name: 'Web', type: 'web', price: 8200, commission: 100, units: 5 }]
    },
    {
        id: 5,
        type: 'critical',
        name: 'Old Gen Phone Case',
        sku: 'SKU-OLD-1',
        brand: 'Spigen',
        competitorPrice: 50, // We are 80
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1586232702178-f044c5f4d4bb?w=100&h=100&fit=crop',
        cogs: 60, shipping: 15, adSpend: 8, fixedCost: 5, unitsSold: 20, stock: 1200,
        channels: [{ id: 'c9', name: 'Trendyol', type: 'marketplace', price: 80, commission: 10, units: 15 }, { id: 'c10', name: 'Web', type: 'web', price: 75, commission: 2, units: 5 }]
    },
    {
        id: 6,
        type: 'velocity',
        name: 'Bluetooth Speaker',
        sku: 'SKU-SPK-1',
        brand: 'JBL',
        competitorPrice: 480, // Normal
        category: 'Masaj Cihazları',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop',
        cogs: 216, shipping: 25, adSpend: 15, fixedCost: 10, unitsSold: 850, stock: 15,
        channels: [{ id: 'c11', name: 'Trendyol', type: 'marketplace', price: 450, commission: 60, units: 600 }, { id: 'c12', name: 'Web', type: 'web', price: 420, commission: 10, units: 250 }]
    },

    // --- LOSERS (6 Items) ---
    {
        id: 7,
        name: 'High-End Monitor 4K',
        sku: 'SKU-MON-4K',
        brand: 'Dell',
        category: 'Cilt Bakım Cihazları',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop',
        cogs: 4200, shipping: 150, adSpend: 400, fixedCost: 200, unitsSold: 45, stock: 8,
        channels: [{ id: 'c13', name: 'Amazon', type: 'marketplace', price: 5800, commission: 800, units: 30 }, { id: 'c14', name: 'Web', type: 'web', price: 5500, commission: 150, units: 15 }]
    },
    {
        id: 8,
        name: 'Bluetooth Speaker Gen2',
        sku: 'SKU-SPK-G2',
        brand: 'Anker',
        category: 'Masaj Cihazları',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop',
        cogs: 480, shipping: 35, adSpend: 100, fixedCost: 50, unitsSold: 85, stock: 42,
        channels: [{ id: 'c15', name: 'Trendyol', type: 'marketplace', price: 850, commission: 120, units: 60 }, { id: 'c16', name: 'Web', type: 'web', price: 800, commission: 20, units: 25 }]
    },
    {
        id: 9,
        name: 'Wired Office Mouse',
        sku: 'SKU-MOU-WIR',
        brand: 'Microsoft',
        category: 'Cilt Bakım Cihazları',
        image: 'https://images.unsplash.com/photo-1615663245857-acda6b245a86?w=100&h=100&fit=crop',
        cogs: 60, shipping: 25, adSpend: 80, fixedCost: 40, unitsSold: 20, stock: 110,
        channels: [{ id: 'c17', name: 'Hepsiburada', type: 'marketplace', price: 120, commission: 20, units: 15 }, { id: 'c18', name: 'Web', type: 'web', price: 110, commission: 5, units: 5 }]
    },
    {
        id: 10,
        name: 'Generic Phone Case',
        sku: 'SKU-PHN-CSE',
        brand: 'Spigen',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1586105251261-72a756497a10?w=100&h=100&fit=crop',
        cogs: 24, shipping: 20, adSpend: 150, fixedCost: 100, unitsSold: 40, stock: 320,
        channels: [{ id: 'c19', name: 'Trendyol', type: 'marketplace', price: 90, commission: 15, units: 30 }, { id: 'c20', name: 'Web', type: 'web', price: 80, commission: 5, units: 10 }]
    },
    {
        id: 11,
        name: 'USB-C Charging Cable',
        sku: 'SKU-CBL-USB',
        brand: 'Baseus',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1603539266185-1d026c4839cf?w=100&h=100&fit=crop',
        cogs: 36, shipping: 20, adSpend: 100, fixedCost: 80, unitsSold: 25, stock: 480,
        channels: [{ id: 'c21', name: 'Amazon', type: 'marketplace', price: 100, commission: 15, units: 15 }, { id: 'c22', name: 'Web', type: 'web', price: 90, commission: 5, units: 10 }]
    },
    {
        id: 12,
        name: 'Laptop Cooling Pad',
        sku: 'SKU-LAP-COOL',
        brand: 'Zalman',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1618424181497-157f2c908584?w=100&h=100&fit=crop',
        cogs: 216, shipping: 45, adSpend: 110, fixedCost: 60, unitsSold: 30, stock: 67,
        channels: [{ id: 'c23', name: 'Trendyol', type: 'marketplace', price: 350, commission: 60, units: 25 }, { id: 'c24', name: 'Web', type: 'web', price: 320, commission: 10, units: 5 }]
    },
    {
        id: 13,
        name: 'Tempered Glass Screen Protector',
        sku: 'SKU-SCR-PROT',
        brand: 'Spigen',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1544228743-0af9ae3f89e5?w=100&h=100&fit=crop',
        cogs: 18, shipping: 10, adSpend: 25, fixedCost: 10, unitsSold: 350, stock: 950,
        channels: [{ id: 'c25', name: 'Trendyol', type: 'marketplace', price: 120, commission: 25, units: 250 }, { id: 'c26', name: 'Web', type: 'web', price: 100, commission: 5, units: 100 }]
    },
    {
        id: 14,
        name: 'Fast Wireless Charger 15W',
        sku: 'SKU-WIR-CHG',
        brand: 'Anker',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1622442478544-d3a94828ce64?w=100&h=100&fit=crop',
        cogs: 144, shipping: 25, adSpend: 50, fixedCost: 30, unitsSold: 120, stock: 88,
        channels: [{ id: 'c27', name: 'Amazon', type: 'marketplace', price: 280, commission: 45, units: 80 }, { id: 'c28', name: 'Web', type: 'web', price: 260, commission: 15, units: 40 }]
    },
    {
        id: 15,
        name: 'Magnetic Car Phone Mount',
        sku: 'SKU-CAR-MNT',
        brand: 'Baseus',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1601552945147-36e2f5b40d58?w=100&h=100&fit=crop',
        cogs: 54, shipping: 15, adSpend: 35, fixedCost: 15, unitsSold: 210, stock: 175,
        channels: [{ id: 'c29', name: 'Trendyol', type: 'marketplace', price: 150, commission: 30, units: 150 }, { id: 'c30', name: 'Web', type: 'web', price: 130, commission: 10, units: 60 }]
    },
    {
        id: 16,
        name: 'Silicone Smartwatch Band',
        sku: 'SKU-SMT-BND',
        brand: 'Generic',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1585860368177-3e5f29ce2714?w=100&h=100&fit=crop',
        cogs: 10, shipping: 5, adSpend: 15, fixedCost: 5, unitsSold: 450, stock: 1200,
        channels: [{ id: 'c31', name: 'Hepsiburada', type: 'marketplace', price: 75, commission: 15, units: 300 }, { id: 'c32', name: 'Web', type: 'web', price: 60, commission: 2, units: 150 }]
    },
    {
        id: 17,
        name: 'Aluminum Tablet Stand',
        sku: 'SKU-TAB-STD',
        brand: 'UGREEN',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1628003612261-26c71cfaedce?w=100&h=100&fit=crop',
        cogs: 102, shipping: 30, adSpend: 40, fixedCost: 20, unitsSold: 90, stock: 55,
        channels: [{ id: 'c33', name: 'Trendyol', type: 'marketplace', price: 240, commission: 40, units: 60 }, { id: 'c34', name: 'Web', type: 'web', price: 220, commission: 12, units: 30 }]
    },
    {
        id: 18,
        name: 'Webcam Privacy Cover (3-Pack)',
        sku: 'SKU-WEB-CVR',
        brand: 'Generic',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1517430816045-df4b7e281ded?w=100&h=100&fit=crop',
        cogs: 5, shipping: 4, adSpend: 10, fixedCost: 2, unitsSold: 600, stock: 2400,
        channels: [{ id: 'c35', name: 'Amazon', type: 'marketplace', price: 40, commission: 8, units: 450 }, { id: 'c36', name: 'Web', type: 'web', price: 35, commission: 1, units: 150 }]
    },
    {
        id: 19,
        name: 'Lens Protector for iPhone 15',
        sku: 'SKU-LNS-PROT',
        brand: 'Spigen',
        category: 'Cilt Bakım Ürünleri',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=100&h=100&fit=crop',
        cogs: 26, shipping: 8, adSpend: 20, fixedCost: 10, unitsSold: 280, stock: 390,
        channels: [{ id: 'c37', name: 'Trendyol', type: 'marketplace', price: 110, commission: 22, units: 200 }, { id: 'c38', name: 'Web', type: 'web', price: 95, commission: 5, units: 80 }]
    }
];
