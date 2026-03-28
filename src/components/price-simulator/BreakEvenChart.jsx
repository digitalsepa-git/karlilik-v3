import React from 'react';

export const BreakEvenChart = ({ fixedCost = 0, variableCostPerUnit = 0, sellingPrice = 0, breakEvenPoint = 0 }) => {
    // Safety checks
    const safeFixedCost = Number(fixedCost) || 0;
    const safeVarCost = Number(variableCostPerUnit) || 0;
    const safePrice = Number(sellingPrice) || 0;
    const safeBEP = Number(breakEvenPoint) || 0;

    // Chart Dimensions
    const width = 600;
    const height = 300;
    const padding = 40;

    // Simulation Range (0 to 2x BEP to show the cross clearly)
    // If BEP is 0 or infinite (price <= var cost), default to some reasonable range
    const maxUnits = safeBEP > 0 && safeBEP !== Infinity ? safeBEP * 2 : 100;

    // Y-Axis Max Calculation
    const maxRevenue = maxUnits * safePrice;
    const maxTotalCost = safeFixedCost + (maxUnits * safeVarCost);
    const maxY = Math.max(maxRevenue, maxTotalCost) * 1.1; // 10% padding

    // Scaling Functions
    const xScale = (units) => padding + (units / maxUnits) * (width - 2 * padding);
    const yScale = (money) => height - padding - (money / maxY) * (height - 2 * padding);

    // Points
    const startX = xScale(0);
    const endX = xScale(maxUnits);

    // Lines
    // 1. Fixed Cost Line (Horizontal)
    const fixedY = yScale(safeFixedCost);

    // 2. Total Cost Line (Starts at Fixed Cost, goes to maxTotalCost)
    const totalCostEndY = yScale(maxTotalCost);

    // 3. Revenue Line (Starts at 0, goes to maxRevenue)
    const revenueStartY = yScale(0);
    const revenueEndY = yScale(maxRevenue);

    // Break Even Point Coordinates
    const bepX = xScale(safeBEP);
    const bepY = yScale(safeFixedCost + safeBEP * safeVarCost);

    // Formatters
    const formatMoney = (val) => `₺${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    if (safePrice <= safeVarCost) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-red-500 font-bold mb-2">Başabaş Noktası Yok</p>
                <p className="text-xs text-gray-500 text-center max-w-xs">
                    Satış fiyatı ({formatMoney(safePrice)}), değişken maliyetlerden ({formatMoney(safeVarCost)}) düşük olduğu için kâr elde edilemez.
                </p>
            </div>
        );
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg select-none">
            {/* Grid Lines */}
            <line x1={startX} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />
            <line x1={startX} y1={padding} x2={startX} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />

            {/* Fixed Cost Area (Shaded) */}
            <path
                d={`M ${startX} ${height - padding} L ${endX} ${height - padding} L ${endX} ${fixedY} L ${startX} ${fixedY} Z`}
                fill="#f3f4f6"
                opacity="0.5"
            />

            {/* Loss Area (Triangle between Total Cost and Revenue below BEP) */}
            <path
                d={`M ${startX} ${fixedY} L ${bepX} ${bepY} L ${startX} ${revenueStartY} Z`}
                fill="#fee2e2"
                opacity="0.5"
            />

            {/* Profit Area (Triangle between Revenue and Total Cost above BEP) */}
            <path
                d={`M ${bepX} ${bepY} L ${endX} ${revenueEndY} L ${endX} ${totalCostEndY} Z`}
                fill="#dcfce7"
                opacity="0.5"
            />

            {/* Lines */}
            <line x1={startX} y1={fixedY} x2={endX} y2={fixedY} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
            <text x={endX - 10} y={fixedY - 5} textAnchor="end" fontSize="10" fill="#6b7280">Sabit Maliyet</text>

            <line x1={startX} y1={fixedY} x2={endX} y2={totalCostEndY} stroke="#ef4444" strokeWidth="3" />
            <text x={endX + 5} y={totalCostEndY} fontSize="10" fill="#ef4444" dy="0.3em">Toplam Maliyet</text>

            <line x1={startX} y1={revenueStartY} x2={endX} y2={revenueEndY} stroke="#22c55e" strokeWidth="3" />
            <text x={endX + 5} y={revenueEndY} fontSize="10" fill="#22c55e" dy="0.3em">Gelir</text>

            {/* Break Even Point Marker */}
            {safeBEP > 0 && safeBEP !== Infinity && (
                <>
                    <circle cx={bepX} cy={bepY} r="6" fill="#4f46e5" stroke="white" strokeWidth="2" />
                    <line x1={bepX} y1={bepY} x2={bepX} y2={height - padding} stroke="#4f46e5" strokeWidth="1" strokeDasharray="4,4" />

                    {/* Tooltip-like Label */}
                    <g transform={`translate(${bepX}, ${bepY - 20})`}>
                        <rect x="-60" y="-25" width="120" height="25" rx="4" fill="#4f46e5" />
                        <text x="0" y="-8" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                            BEP: {Math.ceil(safeBEP)} Adet
                        </text>
                        <polygon points="-5,0 5,0 0,6" fill="#4f46e5" />
                    </g>
                </>
            )}

            {/* Axes Labels */}
            <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#6b7280">Satış Adedi (Birim)</text>
            <text x={15} y={height / 2} textAnchor="middle" transform={`rotate(-90, 15, ${height / 2})`} fontSize="12" fill="#6b7280">Tutar (TL)</text>
        </svg>
    );
};
