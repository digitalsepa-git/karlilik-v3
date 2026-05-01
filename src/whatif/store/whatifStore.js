import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import productCosts from "../../data/productCosts.json";
import { expensesData, calculateDailyExpense } from "../../data/expensesData";

const DEFAULT_INPUTS = {
  reversePricing: { cost: 0, targetMargin: 0, baseShipping: 0, baseAdUnit: 0, baseFixedUnit: 0, commissionRate: 0, taxRate: 0 },
  newProductLaunch: { cost: 0, targetMargin: 0 },
  priceElasticity: { currentPrice: 0, priceChange: 0, elasticity: -1.5, currentDemand: 0, cost: 0, baseShipping: 0, baseAdUnit: 0, baseFixedUnit: 0, commissionRate: 0, taxRate: 0 },
  campaign: { campaignType: "discount", discountPct: 0, bundleN: 0, bundleM: 0, demandLift: 0, baseDemand: 0, basePrice: 0, cost: 0, baseShipping: 0, baseAdUnit: 0, baseFixedUnit: 0, commissionRate: 0, taxRate: 0 },
  costImpact: { price: 0, currentCommission: 0, currentShipping: 0, currentCost: 0, commissionDelta: 0, shippingDelta: 0, costDelta: 0, baseAdUnit: 0, baseFixedUnit: 0, commissionRate: 0, taxRate: 0 },
  adRoas: { currentBudget: 0, budgetMultiplier: 1, decayFactor: 0.7, currentRoas: 0, profitMargin: 0 },
};

export const useWhatifStore = create()(
  persist(
    (set, get) => ({
      activeModule: "reversePricing",
      inputs: DEFAULT_INPUTS,
      selectedProduct: null,
      selectedChannel: "",
      isContextApplied: false,
      savedScenarios: [],
      
      setActiveModule: (id) => set({ activeModule: id }),
      
      setInput: (moduleId, patch) => set(state => ({
        inputs: { ...state.inputs, [moduleId]: { ...state.inputs[moduleId], ...patch } },
      })),
      
      setProduct: (p) => set({ selectedProduct: p, isContextApplied: false }),
      setChannel: (c) => set({ selectedChannel: c, isContextApplied: false }),
      
      loadDefaults: (orders = [], gaData = null) => {
        const state = get();
        if (!state.selectedProduct) return;
        
        const product = state.selectedProduct;
        const isTrendyol = state.selectedChannel === 'trendyol';
        const commissionRate = isTrendyol ? 0.15 : 0.02;
        const taxRate = 0.20;

        // 1. Calculate global context and base demand
        let oldestOrderDay = new Date();
        if (Array.isArray(orders) && orders.length > 0) {
            oldestOrderDay = orders.reduce((oldest, tx) => {
                if (!tx.dateRaw) return oldest;
                const d = new Date(tx.dateRaw);
                return d < oldest ? d : oldest;
            }, new Date());
        }
        let ms = new Date() - oldestOrderDay;
        let globalTotalDays = Math.ceil(ms / (1000 * 60 * 60 * 24));
        if (globalTotalDays < 1) globalTotalDays = 1;
        
        let globalTotalRevenue = 0;
        let globalIkasRevenue = 0;
        let salesQuantity = 0;
        
        if (Array.isArray(orders)) {
          orders.forEach(order => {
            if (!order.dateRaw) return;
            const chLower = order.channel?.toLowerCase() || '';
            const isIkasOrder = chLower.includes('web') || chLower.includes('ikas');
            
            // Only exclude cancelled/refunded, matching ProductProfitability.jsx
            if (order.statusObj?.label !== 'İptal' && order.statusObj?.label !== 'İade' && order.statusObj?.label !== 'CANCELLED' && order.statusObj?.label !== 'REFUNDED') {
              globalTotalRevenue += (order.revenue || 0);
              if (isIkasOrder) {
                globalIkasRevenue += (order.revenue || 0);
              }
            }
            
            // Calculate sales quantity for 30 days for base demand (or lifetime if we want to match, but baseDemand is just a simulation slider default)
            const orderDate = new Date(order.dateRaw);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (orderDate >= thirtyDaysAgo && order.statusObj?.label !== 'İptal') {
              order.lines?.forEach(line => {
                if (line.productId === product.id) {
                  salesQuantity += (line.quantity || 1);
                }
              });
            }
          });
        }
        
        globalTotalRevenue = Math.max(1, globalTotalRevenue);
        globalIkasRevenue = Math.max(1, globalIkasRevenue);
        
        // 2. Extract specific base costs
        const productSku = product.sku || `SKU-${product.name?.substring(0, 6) || 'DEFAULT'}`;
        const fallbackCost = productCosts[productSku] || productCosts["DEFAULT"] || { cogs: 360, shipping: 45 };
        
        const baseCogs = product.cost || fallbackCost.cogs;
        const baseShipping = fallbackCost.shipping || 45;
        
        // Ads (Global Ad Ratio applied to Ikas COGS)
        const totalAdBudget = gaData?.totalAdCost || 0;
        const globalAdRatio = globalIkasRevenue > 0 ? (totalAdBudget / globalIkasRevenue) : 0;
        const baseAdUnit = isTrendyol ? 0 : (baseCogs * globalAdRatio);
        
        // Fixed Costs (Global Fixed Ratio applied to COGS)
        const sharedFixed = expensesData
            .filter(e => e.valueType === 'amount' && (!e.allocationScope || e.allocationScope.type === 'global'))
            .reduce((sum, e) => sum + calculateDailyExpense(e), 0) * globalTotalDays;
            
        const ikasOnlyFixed = expensesData
            .filter(e => e.valueType === 'amount' && e.allocationScope?.target === 'Web Sitesi')
            .reduce((sum, e) => sum + calculateDailyExpense(e), 0) * globalTotalDays;

        const globalSharedFixedRatio = globalTotalRevenue > 0 ? (sharedFixed / globalTotalRevenue) : 0;
        const globalIkasOnlyFixedRatio = globalIkasRevenue > 0 ? (ikasOnlyFixed / globalIkasRevenue) : 0;
        
        const allocatedFixedRatio = isTrendyol ? globalSharedFixedRatio : (globalSharedFixedRatio + globalIkasOnlyFixedRatio);
        const baseFixedUnit = baseCogs * (allocatedFixedRatio > 0 ? allocatedFixedRatio : 0.03);
        
        const baseDemand = salesQuantity > 0 ? salesQuantity : 100;
        
        set(s => ({
          isContextApplied: true,
          inputs: {
            ...s.inputs,
            reversePricing: {
              ...s.inputs.reversePricing,
              cost: baseCogs,
              targetMargin: 0.20,
              baseShipping,
              baseAdUnit,
              baseFixedUnit,
              commissionRate,
              taxRate
            },
            priceElasticity: {
              ...s.inputs.priceElasticity,
              currentPrice: product.price || 1000,
              cost: baseCogs,
              currentDemand: baseDemand,
              baseShipping,
              baseAdUnit,
              baseFixedUnit,
              commissionRate,
              taxRate
            },
            campaign: {
              ...s.inputs.campaign,
              basePrice: product.price || 1000,
              cost: baseCogs,
              baseDemand: baseDemand,
              baseShipping,
              baseAdUnit,
              baseFixedUnit,
              commissionRate,
              taxRate
            },
            costImpact: {
              ...s.inputs.costImpact,
              price: product.price || 1000,
              currentCost: baseCogs,
              currentCommission: commissionRate,
              baseAdUnit,
              baseFixedUnit,
              commissionRate,
              taxRate
            }
          },
        }));
      },
      
      saveScenario: (name) => {
        const state = get();
        const scenario = {
          id: uuid(),
          name,
          module: state.activeModule,
          productId: state.selectedProduct?.id,
          channelId: state.selectedChannel,
          inputs: state.inputs[state.activeModule],
          output: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(s => ({ savedScenarios: [...s.savedScenarios, scenario] }));
      },
      
      loadScenario: (id) => {
        const state = get();
        const scenario = state.savedScenarios.find(s => s.id === id);
        if (!scenario) return;
        set({
          activeModule: scenario.module,
          selectedChannel: scenario.channelId,
          inputs: { ...state.inputs, [scenario.module]: scenario.inputs },
        });
      },
      
      deleteScenario: (id) => set(state => ({
        savedScenarios: state.savedScenarios.filter(s => s.id !== id),
      })),
    }),
    {
      name: "gilan-whatif-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedScenarios: state.savedScenarios,
        activeModule: state.activeModule,
      }),
    }
  )
);
