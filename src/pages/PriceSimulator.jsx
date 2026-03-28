import React, { useState } from 'react';
import { SimulatorLauncher } from '../components/price-simulator/SimulatorLauncher';
import { SimulatorInterface } from '../components/price-simulator/SimulatorInterface';
import { ProductFlow } from '../components/price-simulator/flows/ProductFlow';
import { CategoryFlow } from '../components/price-simulator/flows/CategoryFlow';
import { CompanyFlow } from '../components/price-simulator/flows/CompanyFlow';
import { ChannelFlow } from '../components/price-simulator/flows/ChannelFlow';
import { SetFlow } from '../components/price-simulator/flows/SetFlow';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Simulator Crash:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
                    <h2 className="text-xl font-bold text-red-800 mb-4">Bir hata oluştu</h2>
                    <p className="text-red-700 font-mono text-sm whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const PriceSimulator = ({ openChatWithContext, onNavigate }) => {
    // State Management for the Orchestrator
    const [view, setView] = useState('LAUNCHER'); // 'LAUNCHER' | 'WIZARD' | 'SIMULATOR'
    const [activeTab, setActiveTab] = useState('product'); // 'product', 'category', etc.
    const [simulationData, setSimulationData] = useState(null);

    const handleLaunch = (mode) => {
        setActiveTab(mode);
        // Dispatch to appropriate Wizard based on Mode
        if (['product', 'category', 'company', 'channel', 'set'].includes(mode)) {
            setView('WIZARD');
        } else {
            // Fallback for not-yet-implemented flows
            setView('SIMULATOR');
        }
    };

    const handleFlowComplete = (data) => {
        if (activeTab === 'product' && onNavigate) {
            // Navigate to separate page with the simulation data
            onNavigate('product-simulator', null, data);
            return;
        }
        if (activeTab === 'company' && onNavigate) {
            // Navigate to separate page with the simulation data
            onNavigate('company-simulator', null, data);
            return;
        }
        setSimulationData(data);
        setView('SIMULATOR');
    };

    const handleBackToLauncher = () => {
        setView('LAUNCHER');
        setSimulationData(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {view === 'LAUNCHER' && (
                <SimulatorLauncher
                    activeTab={activeTab}
                    onLaunch={handleLaunch}
                />
            )}

            {/* View Director: Decides which Wizard to show */}
            {view === 'WIZARD' && activeTab === 'product' && (
                <ProductFlow
                    isOpen={true}
                    onClose={handleBackToLauncher}
                    onComplete={handleFlowComplete}
                />
            )}

            {view === 'WIZARD' && activeTab === 'category' && (
                <CategoryFlow
                    isOpen={true}
                    onClose={handleBackToLauncher}
                    onComplete={handleFlowComplete}
                />
            )}

            {view === 'WIZARD' && activeTab === 'company' && (
                <CompanyFlow
                    isOpen={true}
                    onClose={handleBackToLauncher}
                    onComplete={handleFlowComplete}
                />
            )}

            {view === 'WIZARD' && activeTab === 'channel' && (
                <ChannelFlow
                    isOpen={true}
                    onClose={handleBackToLauncher}
                    onComplete={handleFlowComplete}
                />
            )}

            {view === 'WIZARD' && activeTab === 'set' && (
                <SetFlow
                    isOpen={true}
                    onClose={handleBackToLauncher}
                    onComplete={handleFlowComplete}
                />
            )}

            {view === 'SIMULATOR' && (
                <ErrorBoundary>
                    <SimulatorInterface
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onGoBack={handleBackToLauncher}
                        // Pass initial data if available (TODO: SimulatorInterface needs to accept this)
                        initialData={simulationData}
                        openChatWithContext={openChatWithContext}
                    />
                </ErrorBoundary>
            )}
        </div>
    );
};

export default PriceSimulator;
