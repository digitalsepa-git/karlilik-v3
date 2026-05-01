// Mock adapter data logic for orders
// Normally, this would pull from the central Zustand store or a real data hook,
// but since the Builder is isolated and stateless, we simulate a normalized data pull here.

const mockOrders = Array.from({ length: 300 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 90));
  
  const channels = ['Trendyol', 'Hepsiburada', 'Web Sitesi (ikas)'];
  const categories = ['Cihazlar', 'Setler', 'Kozmetik Ürünler', 'Aksesuar'];
  
  const rev = 200 + Math.random() * 500;
  const cost = rev * 0.4 + Math.random() * 50;
  
  return {
    id: `ord_${i}`,
    date: d.toISOString(),
    channel: channels[Math.floor(Math.random() * channels.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    grossRevenue: rev,
    netProfit: rev - cost,
    quantity: 1,
    sku: `SKU-${Math.floor(Math.random() * 100)}`
  };
});

export function getOrdersData() {
  return mockOrders.map(o => ({
    id: o.id,
    date: o.date,
    channel: o.channel,
    category: o.category,
    sku: o.sku,
    grossRevenue: o.grossRevenue,
    netProfit: o.netProfit,
    quantity: o.quantity
  }));
}
