import React from 'react';
import { SimulatorInterface } from '../components/price-simulator/SimulatorInterface';

export const ProductSimulator = ({ openChatWithContext, onGoBack }) => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={onGoBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Ana Menüye Dön
                </button>
            </div>

            <SimulatorInterface
                activeTab="product"
                setActiveTab={() => { }} // No-op, stick to product
                onGoBack={onGoBack}
                // Initial data can be null, causing it to load default product
                // Or we could pass a specific product here if navigated with params
                initialData={{ mode: 'product', productId: 1 }}
                openChatWithContext={openChatWithContext}
            />
        </div>
    );
};

export default ProductSimulator;
