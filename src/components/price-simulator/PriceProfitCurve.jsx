import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceArea
} from 'recharts';

export const PriceProfitCurve = ({
    originalInputs,
    currentInputs,
    totalMonthlyFixedCost,
    originalTotalVariableCost
}) => {
    // Generate the curve data
    const { data, maxProfitPoint, optimumPoint, riskPoint } = useMemo(() => {
        if (!originalInputs) return { data: [], maxProfitPoint: null, optimumPoint: null, riskPoint: null };

        const basePrice = originalInputs.targetPrice || 100;
        const baseVelocity = originalInputs.velocity || 1;
        const commRate = currentInputs.commissionRate || 0;

        // Elasticity constants to match SimulatorInterface
        const ELASTICITY = -1.5;
        const SCALE_FACTOR = 0.2;

        const points = [];
        // Span from -30% to +30% of base price
        const minPrice = basePrice * 0.7;
        const maxPrice = basePrice * 1.3;
        const step = (maxPrice - minPrice) / 30;

        for (let p = minPrice; p <= maxPrice; p += step) {
            // 1. Simulate Velocity
            const priceDiffPct = (p - basePrice) / basePrice;
            const volChangePct = priceDiffPct * ELASTICITY;
            let simulatedVel = baseVelocity * (1 + volChangePct);
            if (simulatedVel < 0) simulatedVel = 0;

            // 2. Simulate Variable Cost (Economies of Scale)
            let simulatedVarCost = originalTotalVariableCost;
            if (baseVelocity > 0 && simulatedVel > 0) {
                const velChangePct = (simulatedVel - baseVelocity) / baseVelocity;
                simulatedVarCost = originalTotalVariableCost * (1 - (velChangePct * SCALE_FACTOR));
                // Bounds
                if (simulatedVarCost < originalTotalVariableCost * 0.5) simulatedVarCost = originalTotalVariableCost * 0.5;
                if (simulatedVarCost > originalTotalVariableCost * 1.5) simulatedVarCost = originalTotalVariableCost * 1.5;
            }

            // 3. Profit Calculation
            const commissionAmount = p * (commRate / 100);
            const netPerUnit = p - simulatedVarCost - commissionAmount;

            const monthlyVolume = simulatedVel * 30;
            const monthlyProfit = (netPerUnit * monthlyVolume) - totalMonthlyFixedCost;

            points.push({
                price: p,
                profit: monthlyProfit,
                volume: monthlyVolume
            });
        }

        // Find Highlights
        let maxProfitP = points[0];
        points.forEach(pt => {
            if (pt.profit > maxProfitP.profit) maxProfitP = pt;
        });

        // Risk point: Lowest profit on the left side of the max profit
        const leftSide = points.filter(pt => pt.price < maxProfitP.price);
        let riskP = leftSide.length > 0 ? leftSide[0] : points[0];
        leftSide.forEach(pt => {
            if (pt.profit < riskP.profit) riskP = pt;
        });

        // Optimum point: A balanced point. Let's say it's the point closest to the original target price, 
        // OR a point halfway between Risk and Max. Let's find the point closest to currentInputs.targetPrice.
        let optP = points[0];
        let minDiff = Infinity;
        points.forEach(pt => {
            const diff = Math.abs(pt.price - currentInputs.targetPrice);
            if (diff < minDiff) {
                minDiff = diff;
                optP = pt;
            }
        });

        // Ensure they aren't exactly the same dot visually if they overlap too closely
        if (Math.abs(optP.price - maxProfitP.price) < step) {
            // If optimum is max profit, let's just let them overlap or shift one.
            // We will handle overlapping by relying on the user's input.
        }

        return { data: points, maxProfitPoint: maxProfitP, optimumPoint: optP, riskPoint: riskP };

    }, [originalInputs, currentInputs.targetPrice, currentInputs.commissionRate, totalMonthlyFixedCost, originalTotalVariableCost]);

    if (!data.length) return null;

    const formatMoney = (val) => `₺${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-300 text-xs font-bold mb-1">Satış Fiyatı: <span className="text-white text-sm">{formatMoney(data.price)}</span></p>
                    <p className="text-emerald-400 text-xs font-bold">Aylık Kâr: <span className="text-white text-sm">{formatMoney(data.profit)}</span></p>
                    <p className="text-indigo-300 text-[10px] mt-1 opacity-80">Tahmini Hacim: {data.volume.toLocaleString()} Adet/Ay</p>
                </div>
            );
        }
        return null;
    };

    // Calculate Y Domain to give some padding
    const minProfit = Math.min(...data.map(d => d.profit));
    const maxProfit = Math.max(...data.map(d => d.profit));
    const yPadding = (maxProfit - minProfit) * 0.1;
    const yMin = Math.max(0, minProfit - yPadding); // Don't go below 0 if possible, or allow negatives if it's a loss
    const yMax = maxProfit + yPadding;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-4">
            <div className="mb-4 text-left">
                <h3 className="text-sm font-extrabold text-gray-900">Fiyat-Hacim-Kâr Eğrisi</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Kâr her zaman fiyat artışıyla yükselmez.</p>
            </div>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="price"
                            tickFormatter={formatMoney}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            minTickGap={20}
                        />
                        <YAxis
                            domain={[yMin, yMax]}
                            tickFormatter={formatMoney}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />

                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                        />

                        {/* Highlight Points */}
                        {riskPoint && (
                            <ReferenceDot x={riskPoint.price} y={riskPoint.profit} r={6} fill="#fff" stroke="#ef4444" strokeWidth={3} />
                        )}
                        {optimumPoint && (
                            <ReferenceDot x={optimumPoint.price} y={optimumPoint.profit} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={3} />
                        )}
                        {maxProfitPoint && (
                            <ReferenceDot x={maxProfitPoint.price} y={maxProfitPoint.profit} r={6} fill="#fff" stroke="#22c55e" strokeWidth={3} />
                        )}

                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white"></div>
                    <span className="text-[11px] font-bold text-gray-600">Risk Bölgesi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white"></div>
                    <span className="text-[11px] font-bold text-gray-600">Optimum Denge</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-white"></div>
                    <span className="text-[11px] font-bold text-gray-600">Maks. Kâr</span>
                </div>
            </div>
        </div>
    );
};
