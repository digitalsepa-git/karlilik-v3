// --- 1. ADVANCED MOCK DATA (With Real Images) ---
const categories = ["Elektronik", "Aksesuar", "Ofis", "Giyim", "Ev & Yaşam"];
const brands = ["Logitech", "Samsung", "Apple", "Razer", "Generic"];
const productImages = [
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586232702178-f044c5f4d4bb?w=600&h=600&fit=crop"
];

export const INVENTORY_DATA = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const name = [
        "Wireless Ergonomic Mouse", "Mechanical Gaming Keyboard", "Noise Cancelling Headphones", "Smart Home Security Cam", "Bluetooth Speaker Portable",
        "High-End Monitor 4K", "Smart Watch Series 5", "Wired Office Mouse", "Generic Phone Case", "Micro USB Cable 1m",
        "Screen Protector Pack", "Cheap Plastic Stand", "USB-C Fast Charger 20W", "Laptop Cooling Pad", "RGB Gaming Mousepad",
        "Webcam HD 1080p", "Silicone Watch Strap", "Tablet Holder Adjustable", "Wireless Earbuds Basic", "Gaming Headset Pro",
        "Multi-port USB Hub", "External Hard Drive Case", "Ring Light for Streaming", "Microphone Boom Arm", "Cable Management Clips"
    ][i] || `Product ${id}`;

    const basePrice = Math.floor(Math.random() * 800) + 150;
    const baseSku = 1000 + id;
    const mainCategory = categories[Math.floor(Math.random() * categories.length)];
    const mainBrand = brands[Math.floor(Math.random() * brands.length)];

    // Current Financials
    const cost = Math.floor(basePrice * 0.60);
    const netProfit = basePrice - cost;
    const margin = Math.round((netProfit / basePrice) * 100);

    // Dates
    const today = new Date();
    const dateAdded = new Date(today.getTime() - Math.random() * 60000000000).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    const lastSale = new Date(today.getTime() - Math.random() * 2500000000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    // History Generation (Last 30 Days - Detailed)
    const history = Array.from({ length: 30 }, (_, j) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - j)); // Go back 30 days

        // Random fluctuation
        const dailyPrice = basePrice + Math.floor(Math.random() * 40 - 20);
        const dailyCost = cost;
        const dailyProfit = dailyPrice - dailyCost;
        const dailyMargin = Math.round((dailyProfit / dailyPrice) * 100);
        const dailySales = Math.floor(Math.random() * 20) + 1; // 1-20 sales per day

        return {
            date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            price: dailyPrice,
            profit: dailyProfit,
            margin: dailyMargin,
            sales: dailySales
        };
    });

    // Channels
    const channels = [
        { name: "Trendyol", price: Math.floor(basePrice * 1.15), stock: Math.floor(Math.random() * 50), sku: `TY-${baseSku}`, category: `${mainCategory} > Aksesuar`, brand: mainBrand, color: "orange" },
        { name: "Hepsiburada", price: Math.floor(basePrice * 1.12), stock: Math.floor(Math.random() * 40), sku: `HB-${baseSku}-V2`, category: mainCategory, brand: `${mainBrand} TR`, color: "orange" },
        { name: "Amazon", price: Math.floor(basePrice * 1.08), stock: Math.floor(Math.random() * 100), sku: `AMZ-${baseSku}`, category: `Electronics > ${mainCategory}`, brand: mainBrand, color: "yellow" }
    ];

    // SALES VELOCITY LOGIC (Per User Request)
    // Generate Last 7 Days Sales (Random 0-20 per day + min 2)
    const last7DaysSales = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 2);
    // Approx logic: Sum of 7 days * 4 weeks
    const total30Days = last7DaysSales.reduce((a, b) => a + b, 0) * 4;
    const dailyAvg = (total30Days / 30).toFixed(1);

    return {
        id, name,
        category: mainCategory,
        brand: mainBrand,
        sku: `SKU-${baseSku}`,
        price: basePrice,
        stock: Math.floor(Math.random() * 500),
        img: productImages[i % productImages.length],
        channels: channels,
        cost, netProfit, margin, dateAdded, lastSale, history,
        // Added Sales Metrics
        last7DaysSales, total30Days, dailyAvg
    };
});
