import { useState, useEffect, useCallback } from 'react';

const LOG_STORAGE_KEY = 'gilan_activity_log';

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
        setTimelineEvents(parsed.timelineEvents || []);
        setInboxActions(parsed.inboxActions || []);
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

    // Only auto-generate if we don't have enough actions
    if (inboxActions.length === 0) {
      const newActions = [];
      const newTimeline = [];
      const now = new Date();

      // Example Insight 1: Dead Stock Warning
      // We look at orders to see if any products are selling poorly.
      // But we don't have stock data here unless passed. For now, let's look for products with negative margin.
      
      const productMargins = {};
      orders.forEach(o => {
        if (!productMargins[o.sku]) {
          productMargins[o.sku] = { rev: 0, profit: 0, name: o.productName };
        }
        productMargins[o.sku].rev += o.revenue || 0;
        productMargins[o.sku].profit += o.profit || 0;
      });

      let negativeMarginCount = 0;
      Object.values(productMargins).forEach(p => {
        if (p.rev > 0 && p.profit < 0) {
          negativeMarginCount++;
        }
      });

      if (negativeMarginCount > 0) {
        newActions.push({
          id: 'act-margin',
          prio: 'critical',
          type: 'Kârlılık',
          title: `${negativeMarginCount} üründe negatif marj tespit edildi. COGS ve Komisyon oranlarını kontrol edin.`,
          btn: 'Ürünleri İncele'
        });
        newTimeline.push({
          id: 'tl-margin',
          title: 'AI Kârlılık uyarısı üretti',
          time: 'Şimdi'
        });
      }

      // Example Insight 2: Returns Anomaly
      const returnedOrders = orders.filter(o => o.statusObj?.label === 'İptal' || o.statusObj?.label === 'İade' || o.statusObj?.label === 'Refunded');
      if (returnedOrders.length > 5) {
         newActions.push({
          id: 'act-returns',
          prio: 'important',
          type: 'Operasyon',
          title: `Son dönemde ${returnedOrders.length} iade/iptal yaşandı. Sebep analizi önerilir.`,
          btn: 'Analizi Gör'
        });
      }

      // Add a general timeline info
      if (newTimeline.length === 0) {
        newTimeline.push({
          id: 'tl-sync',
          title: 'Siparişler başarıyla senkronize edildi',
          time: 'Bugün'
        });
      }

      // Add a sample info action
      newActions.push({
        id: 'act-info-1',
        prio: 'info',
        type: 'Sistem',
        title: 'Gerçek zamanlı ciro akışı başlatıldı. Kâr Intelligence devrede.',
        btn: 'Detay'
      });

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
