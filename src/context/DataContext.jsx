import React, { createContext, useContext, useState, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useIkasProducts } from '../hooks/useIkasProducts';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    // Merkezi tarih aralığı kontrolü (Dashboard vb. filtrelerle senkronize edilebilir)
    const [globalDateRange, setGlobalDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Ana verileri tek bir sefer çekiyoruz
    const { products, categories, loading: productsLoading, error: productsError, refetch: refetchProducts } = useIkasProducts();
    const { orders, loading: ordersLoading, error: ordersError } = useOrders(products);
    const { data: gaData, loading: gaLoading, error: gaError } = useGoogleAnalytics(globalDateRange.startDate, globalDateRange.endDate);

    const value = useMemo(() => ({
        globalDateRange,
        setGlobalDateRange,
        ordersData: { orders, loading: ordersLoading, error: ordersError },
        productsData: { products, categories, loading: productsLoading, error: productsError, refetch: refetchProducts },
        analyticsData: { data: gaData, loading: gaLoading, error: gaError }
    }), [
        globalDateRange, 
        orders, ordersLoading, ordersError, 
        products, categories, productsLoading, productsError, 
        gaData, gaLoading, gaError
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData hook must be used within a DataProvider');
    }
    return context;
};
