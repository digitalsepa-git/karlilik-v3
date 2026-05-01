import { useState, useEffect, useCallback } from 'react';

const LOG_STORAGE_KEY = 'gilan_activity_log';
const CURRENT_VERSION = 5; // Bump to generate more fake data after fixing lost edito force clear corrupted HMR state

export function useActivityLog(orders = []) {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [inboxActions, setInboxActions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CURRENT_VERSION) {
          setTimelineEvents(parsed.timelineEvents || []);
          setInboxActions(parsed.inboxActions || []);
        }
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify({
        version: CURRENT_VERSION,
        timelineEvents,
        inboxActions
      }));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }, [timelineEvents, inboxActions, isInitialized]);

  // Generate Insights from Orders (if empty or periodically)
  useEffect(() => {
    if (!isInitialized || !orders || orders.length === 0) return;

    // Force clear HMR cached old mock data
    if (inboxActions.length > 0 && inboxActions[0].title && inboxActions[0].title.includes('Gerçek zamanlı ciro akışı başlatıldı')) {
      setInboxActions([]);
      return; // Will re-trigger on next render since inboxActions changed
    }

    // Only auto-generate if we don't have enough actions
    if (inboxActions.length === 0) {
      const newActions = [];
      const newTimeline = [];
      const now = new Date();

      // Deep Analytics Engine Setup
      const productStats = {};
      const customerStats = {};

      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - 7);
      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(currentWeekStart.getDate() - 7);

      let currWeekRev = 0;
      let prevWeekRev = 0;

      orders.forEach(o => {
        const d = new Date(o.dateRaw);
        const rev = o.revenue || 0;
        const profit = o.profit || 0;
        const sku = o.sku || 'Bilinmeyen';
        const isReturned = o.statusObj && (o.statusObj.label === 'İptal' || o.statusObj.label === 'İade' || o.statusObj.label === 'Refunded');
        const custId = o.customerId;

        // WoW Revenue
        if (d >= currentWeekStart && d <= now) currWeekRev += rev;
        else if (d >= prevWeekStart && d < currentWeekStart) prevWeekRev += rev;

        // Product stats
        if (!productStats[sku]) {
          productStats[sku] = { name: o.productName, rev: 0, profit: 0, sold: 0, returns: 0 };
        }
        productStats[sku].rev += rev;
        productStats[sku].profit += profit;
        productStats[sku].sold++;
        if (isReturned) productStats[sku].returns++;

        // Customer stats
        if (custId) {
          if (!customerStats[custId]) customerStats[custId] = { count: 0, lastOrder: d };
          customerStats[custId].count++;
          if (d > customerStats[custId].lastOrder) customerStats[custId].lastOrder = d;
        }
      });

      // 1. WoW Revenue Drop Anomaly
      if (prevWeekRev > 0) {
        const dropPct = ((prevWeekRev - currWeekRev) / prevWeekRev) * 100;
        if (dropPct > 20) {
          newActions.push({
            id: 'act-rev-drop', prio: 'critical', type: 'Ciro',
            title: `Son 7 günde cironuz önceki haftaya göre %${Math.round(dropPct)} düştü. Reklam ROAS ve trafik düşüşünü inceleyin.`,
            btn: 'Trend Raporu'
          });
        }
      }

      // 2. Product Margin Anomaly
      const lowMarginProducts = [];
      let topSeller = { name: '', rev: 0 };
      
      Object.entries(productStats).forEach(([sku, stat]) => {
        if (stat.rev > topSeller.rev) {
            topSeller = { name: stat.name, rev: stat.rev };
        }
        
        const marginPct = stat.rev > 0 ? (stat.profit / stat.rev) * 100 : 0;
        if (stat.sold >= 2 && marginPct < 15) {
            lowMarginProducts.push({ name: stat.name, margin: marginPct });
        }
      });
      
      if (lowMarginProducts.length > 0) {
        const worst = lowMarginProducts.sort((a,b) => a.margin - b.margin)[0];
        newActions.push({
          id: 'act-neg-margin', prio: 'important', type: 'Kârlılık',
          title: `"${worst.name}" ürününde kâr marjı %${Math.max(0, Math.round(worst.margin))} seviyesine kadar düştü. Maliyet ve indirim oranlarını acil revize edin.`,
          btn: 'Maliyetleri Gör'
        });
      }

      // 3. High Return SKUs Anomaly
      const highReturnProducts = [];
      Object.entries(productStats).forEach(([sku, stat]) => {
        if (stat.sold >= 3) {
          const returnRate = (stat.returns / stat.sold) * 100;
          if (returnRate > 10) {
            highReturnProducts.push({ name: stat.name, rate: returnRate });
          }
        }
      });
      if (highReturnProducts.length > 0) {
        const highest = highReturnProducts.sort((a, b) => b.rate - a.rate)[0];
        newActions.push({
          id: 'act-returns', prio: 'critical', type: 'Operasyon',
          title: `"${highest.name}" ürününde iade oranı %${Math.round(highest.rate)} seviyesine çıktı! Kalite kontrol tavsiye edilir.`,
          btn: 'İade Sebepleri'
        });
      }

      // 4. Lost Champion Customers
      let lostChampions = 0;
      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(now.getDate() - 40);
      Object.values(customerStats).forEach(c => {
        if (c.count >= 2 && c.lastOrder < fortyDaysAgo) {
          lostChampions++;
        }
      });
      if (lostChampions > 0) {
        newActions.push({
          id: 'act-lost-cust', prio: 'important', type: 'Müşteri',
          title: `Geçmişte çok sipariş veren ${lostChampions} sadık müşteriniz 40 gündür alışveriş yapmıyor. Win-back kampanyası başlatın.`,
          btn: 'Kampanya Kur'
        });
      }
      
      // 5. Top Seller Info
      if (topSeller.rev > 0) {
          newActions.push({
              id: 'act-top-seller', prio: 'info', type: 'Performans',
              title: `Haftanın yıldızı: "${topSeller.name}". Bu ürünün stok seviyelerini kontrol edin ve reklam bütçesini artırmayı değerlendirin.`,
              btn: 'Stok Durumu'
          });
      }
      
      // 6. Cross-sell / Upsell Info
      newActions.push({
          id: 'act-upsell', prio: 'info', type: 'Pazarlama',
          title: `Sepet ortalamanızı artırmak için çok satan ürünlerinizde %10'luk "Birlikte Al" paket kampanyası kurgulayabilirsiniz.`,
          btn: 'Kampanya Önerileri'
      });

      // Fallback info if nothing critical
      if (newActions.length === 0) {
        newActions.push({
          id: 'act-all-good', prio: 'info', type: 'Sistem',
          title: 'Gerçek zamanlı analiz tamamlandı. Kârlılık hedeflerinde kritik bir risk tespit edilmedi.',
          btn: 'P&L İncele'
        });
      }

      newTimeline.push({ id: `tl-${Date.now()}`, title: 'AI Derin Analiz tamamlandı', time: 'Şimdi' });

      setInboxActions(newActions);
      setTimelineEvents(newTimeline);
    }
  }, [orders, isInitialized]);

  const addTimelineEvent = useCallback((event) => {
    setTimelineEvents(prev => [{ ...event, id: `tl-${Date.now()}` }, ...prev]);
  }, []);

  const addInboxAction = useCallback((action) => {
    setInboxActions(prev => [{ ...action, id: `act-${Date.now()}` }, ...prev]);
  }, []);

  const dismissInboxAction = useCallback((id) => {
    setInboxActions(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    timelineEvents,
    inboxActions,
    addTimelineEvent,
    addInboxAction,
    dismissInboxAction
  };
}
