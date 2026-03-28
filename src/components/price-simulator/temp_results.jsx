{
    simContext.type === 'channel' ? (
        // CHANNEL P&L RESULTS
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Net Profit */}
                <div className="bg-white rounded-xl border border-emerald-100 shadow-lg shadow-emerald-500/5 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5"><svg className="w-20 h-20 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg></div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Tahmini Toplam Net Kâr</h3>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold tracking-tight ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ₺{results.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>

                {/* Margin */}
                <div className="bg-white rounded-xl border border-indigo-100 shadow-lg shadow-indigo-500/5 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5"><svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg></div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Ortalama Kâr Marjı</h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold tracking-tight ${results.margin > 20 ? 'text-indigo-600' : results.margin > 10 ? 'text-blue-500' : 'text-orange-500'}`}>
                            %{results.margin.toFixed(1)}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${marginBadgeClass}`}>
                            {results.margin > 25 ? 'Mükemmel' : results.margin > 15 ? 'İyi' : results.margin > 0 ? 'Düşük' : 'Zarar'}
                        </span>
                    </div>
                </div>

                {/* Avg Commission */}
                <div className="bg-white rounded-xl border border-orange-100 shadow-lg shadow-orange-500/5 p-5 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Ort. Kanal Komisyonu</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-orange-600">
                            %{results.weightedCommissionRate ? results.weightedCommissionRate.toFixed(1) : '0.0'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Category Share Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-6">Kategori Bazlı Ciro Dağılımı</h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={inputs.categories || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="salesShare"
                                >
                                    {(inputs.categories || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][index % 5]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => `%${value}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-gray-900">
                                    {inputs.categories?.length || 0}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Kategori</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Breakdown Waterfall/Bar */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-6">Toplam Maliyet Dağılımı</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Ürün (SMM)', value: results.costs?.cogs || 0, fill: '#ef4444' },
                                    { name: 'Komisyon', value: results.costs?.commission || 0, fill: '#f97316' },
                                    { name: 'Pazarlama', value: results.costs?.marketing || 0, fill: '#3b82f6' },
                                    { name: 'Lojistik', value: (results.costs?.shipping || 0) + (results.costs?.returns || 0), fill: '#a855f7' },
                                    { name: 'Sabit', value: results.costs?.fixed || 0, fill: '#64748b' },
                                    { name: 'Net Kâr', value: results.netProfit || 0, fill: '#10b981' },
                                ]}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(val) => `₺${(val / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                                <RechartsTooltip
                                    formatter={(value) => `₺${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {
                                        [
                                            { fill: '#ef4444' },
                                            { fill: '#f97316' },
                                            { fill: '#3b82f6' },
                                            { fill: '#a855f7' },
                                            { fill: '#64748b' },
                                            { fill: '#10b981' },
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </>
    ) : (
    // EXISTING PRODUCT/CATEGORY RESULT PANELS
    <>
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Net Profit Card */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-32 h-32 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg></div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {simContext.type === 'category' ? 'Tahmini Toplam Kâr (Ay)' : 'Tahmini Net Kâr (Birim)'}
                </h3>
                <div className="flex items-baseline gap-1 relative z-10">
                    <span className={`text-5xl font-extrabold tracking-tight ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {simContext.type === 'category'
                            ? `₺${results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                            : `₺${results.netProfit.toFixed(2)}`
                        }
                    </span>
                    <span className="text-gray-400 font-medium text-sm">
                        {simContext.type === 'category' ? '/ ay' : '/ adet'}
                    </span>
                </div>

            </div>

            {/* Margin Card */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg></div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {simContext.type === 'category' ? 'Ortalama Kâr Marjı' : 'Kâr Marjı'}
                </h3>
                <div className="flex items-baseline gap-1 relative z-10">
                    <span className={`text-5xl font-extrabold tracking-tight ${results.margin > 20 ? 'text-indigo-600' : results.margin > 10 ? 'text-blue-500' : 'text-orange-500'}`}>
                        %{results.margin.toFixed(1)}
                    </span>
                </div>
                <div className="mt-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${marginBadgeClass}`}>
                        {results.margin > 25 ? 'Mükemmel' : results.margin > 15 ? 'İyi' : results.margin > 0 ? 'Düşük Kâr' : 'Zarar'}
                    </span>
                </div>
            </div>
        </div>

        {/* Secondary Stats (Competitor Analysis) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Buybox Fiyatı</p>
                <p className="text-xl font-bold text-gray-900 mt-1">₺{simContext.buyboxPrice?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Mevcut Fiyat</p>
                <p className="text-xl font-bold text-gray-900 mt-1">₺{simContext.currentPrice?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 col-span-2 lg:col-span-1">
                {simContext.type === 'category' ? (
                    <>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Tahmini Aylık Ciro</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                            ₺{((results.calculatedPrice || 0) * (inputs.velocity || 0) * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Başabaş Satış Fiyatı</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">₺{results.breakEven.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </>
                )}
            </div>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                    {simContext.type === 'category' ? 'Tahmini Aylık Maliyet Dağılımı' : 'Maliyet Dağılımı ve Kârlılık'}
                </h3>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {simContext.type === 'category' ? 'Kategori Toplamı' : '1 Birim Analizi'}
                </span>
            </div>

            {/* Visual Bar */}
            <div className="h-16 w-full bg-gray-100 rounded-xl overflow-hidden flex text-xs font-bold text-white relative shadow-inner mb-8">
                <div style={{ width: `${wCogs}%` }} className="h-full bg-slate-400 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                    {wCogs > 15 && <span className="drop-shadow-sm">Maliyet</span>}
                    {wCogs > 15 && <span className="opacity-90 font-mono">
                        ₺{simContext.type === 'category'
                            ? (results.costs.cogs * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                            : results.costs.cogs.toFixed(0)}
                    </span>}
                </div>
                <div style={{ width: `${wFixed}%` }} className="h-full bg-slate-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                    {wFixed > 15 && <span className="drop-shadow-sm">Sabit</span>}
                    {wFixed > 15 && <span className="opacity-90 font-mono">
                        ₺{simContext.type === 'category'
                            ? (results.costs.fixed * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                            : results.costs.fixed.toFixed(0)}
                    </span>}
                </div>
                <div style={{ width: `${wVar}%` }} className="h-full bg-orange-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                    {wVar > 15 && <span className="drop-shadow-sm">Değişken</span>}
                    {wVar > 15 && <span className="opacity-90 font-mono">
                        ₺{simContext.type === 'category'
                            ? (results.costs.variable * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                            : results.costs.variable.toFixed(0)}
                    </span>}
                </div>
                <div style={{ width: `${wProfit}%` }} className="h-full bg-emerald-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                    {wProfit > 15 && <span className="drop-shadow-sm">Kâr</span>}
                    {wProfit > 15 && <span className="opacity-90 font-mono">
                        ₺{simContext.type === 'category'
                            ? results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                            : results.netProfit.toFixed(1)}
                    </span>}
                </div>
            </div>

            {/* Rich Legend / Data Grid - Scalable Solution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. COGS */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0"></div>
                        <span className="text-xs font-bold text-gray-600 truncate">
                            {simContext.type === 'category' ? 'Toplam Ürün Maliyeti' : 'Ürün Maliyeti'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-gray-900">
                            ₺{simContext.type === 'category'
                                ? (results.costs.cogs * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : results.costs.cogs.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">({wCogs.toFixed(1)}%)</span>
                    </div>
                </div>

                {/* 2. Fixed */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0"></div>
                        <span className="text-xs font-bold text-gray-600 truncate">
                            {simContext.type === 'category' ? 'Toplam Sabit Gider' : 'Sabit Gider'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-gray-900">
                            ₺{simContext.type === 'category'
                                ? (results.costs.fixed * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : results.costs.fixed.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">({wFixed.toFixed(1)}%)</span>
                    </div>
                </div>

                {/* 3. Variable */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></div>
                        <span className="text-xs font-bold text-gray-600 truncate">
                            {simContext.type === 'category' ? 'Toplam Değişken Gider' : 'Değişken Gider'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-gray-900">
                            ₺{simContext.type === 'category'
                                ? (results.costs.variable * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : results.costs.variable.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">({wVar.toFixed(1)}%)</span>
                    </div>
                </div>

                {/* 4. Profit */}
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                        <span className="text-xs font-bold text-emerald-800 truncate">
                            {simContext.type === 'category' ? 'Toplam Net Kâr' : 'Net Kâr'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-emerald-700">
                            ₺{simContext.type === 'category'
                                ? results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : results.netProfit.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">({wProfit.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
        </div>


        {/* AI Insight (Product Mode Only usually, but kept for structure) */}
        {simContext.type === 'product' && (
            <AIInsightCard
                currentPrice={results.calculatedPrice || 0}
                buyboxPrice={simContext.buyboxPrice || 0}
                margin={results.margin || 0}
                openChatWithContext={openChatWithContext}
                productName={simContext?.title || 'Ürün'}
                isSimulated={originalInputs && JSON.stringify(inputs) !== JSON.stringify(originalInputs)}
                onApplyScenario={handleApplyScenario}
            />
        )}
    </>
)
}
