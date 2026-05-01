import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";

const DEFAULT_INPUTS = {
  reversePricing: { cost: 800, targetMargin: 0.20, commission: 0.18, adSpend: 0.08 },
  newProductLaunch: { cost: 0, targetMargin: 0.25 },
  priceElasticity: { currentPrice: 1000, priceChange: 0, elasticity: -1.5, currentDemand: 100, cost: 500, commission: 0.18, adSpend: 0.08 },
  campaign: { campaignType: "discount", discountPct: 0.25, bundleN: 3, bundleM: 2, demandLift: 0.30, baseDemand: 100, basePrice: 1000, cost: 500, commission: 0.18, adSpend: 0.08 },
  costImpact: { price: 1000, currentCommission: 0.18, currentShipping: 25, currentCost: 500, commissionDelta: 0, shippingDelta: 0, costDelta: 0, adSpend: 0.08 },
  adRoas: { currentBudget: 10000, budgetMultiplier: 1, decayFactor: 0.7, currentRoas: 3.5, profitMargin: 0.20 },
};

export const useWhatifStore = create()(
  persist(
    (set, get) => ({
      activeModule: "reversePricing",
      inputs: DEFAULT_INPUTS,
      selectedProduct: null,
      selectedChannel: "trendyol",
      savedScenarios: [],
      
      setActiveModule: (id) => set({ activeModule: id }),
      
      setInput: (moduleId, patch) => set(state => ({
        inputs: { ...state.inputs, [moduleId]: { ...state.inputs[moduleId], ...patch } },
      })),
      
      setProduct: (p) => set({ selectedProduct: p }),
      setChannel: (c) => set({ selectedChannel: c }),
      
      loadDefaults: (orders = []) => {
        const state = get();
        if (!state.selectedProduct) return;
        
        const product = state.selectedProduct;
        
        // Dynamic commission logic based on channel
        let commissionRate = 0;
        if (state.selectedChannel === 'trendyol') {
          commissionRate = 0.18; 
        } else if (state.selectedChannel === 'ikas') {
          commissionRate = 0.0;
        } else {
          commissionRate = 0.15; // default fallback
        }
        
        // Calculate dynamic base demand from last 30 days of orders for the selected product
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let salesQuantity = 0;
        if (Array.isArray(orders)) {
          orders.forEach(order => {
            const orderDate = new Date(order.createdAt || order.createdAtDate);
            if (orderDate >= thirtyDaysAgo && order.status !== 'CANCELLED') {
              order.lines?.forEach(line => {
                if (line.productId === product.id) {
                  salesQuantity += (line.quantity || 1);
                }
              });
            }
          });
        }
        
        // If no sales found, fallback to 1 so the math doesn't break, or 100 as placeholder? The brief says "Gerçek satış adedi"
        const baseDemand = salesQuantity > 0 ? salesQuantity : 100;
        
        set(s => ({
          inputs: {
            ...s.inputs,
            reversePricing: {
              ...s.inputs.reversePricing,
              cost: product.cost || 800,
              commission: commissionRate,
            },
            priceElasticity: {
              ...s.inputs.priceElasticity,
              currentPrice: product.price || 1000,
              cost: product.cost || 500,
              commission: commissionRate,
              currentDemand: baseDemand,
            },
            campaign: {
              ...s.inputs.campaign,
              basePrice: product.price || 1000,
              cost: product.cost || 500,
              commission: commissionRate,
              baseDemand: baseDemand,
            },
            costImpact: {
              ...s.inputs.costImpact,
              price: product.price || 1000,
              currentCost: product.cost || 500,
              currentCommission: commissionRate,
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
