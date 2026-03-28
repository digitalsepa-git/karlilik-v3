import { useState, useEffect } from 'react';

export function useGoogleAnalytics(startDate, endDate) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchMetrics() {
            try {
                if (!startDate || !endDate) return;

                setLoading(true);
                const queryParams = new URLSearchParams({ startDate, endDate }).toString();
                const res = await fetch(`/api/data?${queryParams}`);

                // If the response is not ok, parse error text to show it correctly instead of unhandled json parse
                let json = null;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    json = await res.json();
                } else {
                    const text = await res.text();
                    throw new Error(text || 'API JSON formatında yanıt vermedi');
                }

                if (!res.ok) {
                    throw new Error((json && (json.error || json.details)) || 'API yanıt vermedi');
                }

                if (isMounted) {
                    // Initialize structure
                    const parsed = {
                        totalAdCost: 0,
                        totalRevenue: 0,
                        totalConversions: 0,
                        totalClicks: 0, // Using sessions as proxy for clicks
                        channels: {
                            googleAds: { cost: 0, revenue: 0, clicks: 0, roas: 0 },
                            metaAds: { cost: 0, revenue: 0, clicks: 0, roas: 0 },
                            other: { cost: 0, revenue: 0, clicks: 0, roas: 0 }
                        }
                    };

                    // Process formatted data array from backend
                    if (Array.isArray(json)) {
                        json.forEach(item => {
                            const channelGroup = item.source || '';
                            const cost = item.cost || 0;
                            const clicks = item.sessions || 0; // mapping sessions to clicks proxy for UI 
                            const rev = item.revenue || 0;
                            const convs = item.conversions || 0;

                            parsed.totalAdCost += cost;
                            parsed.totalRevenue += rev;
                            parsed.totalConversions += convs;
                            parsed.totalClicks += clicks;

                            // Bucket by channel grouping
                            if (channelGroup.toLowerCase().includes('google') || channelGroup.toLowerCase().includes('search') || channelGroup.toLowerCase().includes('cross-network')) {
                                parsed.channels.googleAds.cost += cost;
                                parsed.channels.googleAds.revenue += rev;
                                parsed.channels.googleAds.clicks += clicks;
                            } else if (channelGroup.toLowerCase().includes('meta') || channelGroup.toLowerCase().includes('facebook') || channelGroup.toLowerCase().includes('ig') || channelGroup.toLowerCase().includes('instagram') || channelGroup.toLowerCase().includes('social')) {
                                parsed.channels.metaAds.cost += cost;
                                parsed.channels.metaAds.revenue += rev;
                                parsed.channels.metaAds.clicks += clicks;
                            } else {
                                parsed.channels.other.cost += cost;
                                parsed.channels.other.revenue += rev;
                                parsed.channels.other.clicks += clicks;
                            }
                        });
                    }

                    // Calculate final composite ROAS
                    parsed.overallRoas = parsed.totalAdCost > 0 ? (parsed.totalRevenue / parsed.totalAdCost) : 0;
                    parsed.cpa = parsed.totalConversions > 0 ? (parsed.totalAdCost / parsed.totalConversions) : 0;
                    parsed.cr = parsed.totalClicks > 0 ? (parsed.totalConversions / parsed.totalClicks) * 100 : 0;

                    // Channel ROAS
                    parsed.channels.googleAds.roas = parsed.channels.googleAds.cost > 0 ? (parsed.channels.googleAds.revenue / parsed.channels.googleAds.cost) : 0;
                    parsed.channels.metaAds.roas = parsed.channels.metaAds.cost > 0 ? (parsed.channels.metaAds.revenue / parsed.channels.metaAds.cost) : 0;

                    setData(parsed);
                }
            } catch (err) {
                console.warn("Failed to load GA metrics. Returning Zeroed Data:", err);
                if (isMounted) {
                    const fallbackData = {
                        totalAdCost: 0,
                        totalRevenue: 0,
                        totalConversions: 0,
                        totalClicks: 0,
                        overallRoas: 0,
                        cpa: 0,
                        cr: 0,
                        channels: {
                            googleAds: { cost: 0, revenue: 0, clicks: 0, roas: 0 },
                            metaAds: { cost: 0, revenue: 0, clicks: 0, roas: 0 },
                            other: { cost: 0, revenue: 0, clicks: 0, roas: 0 }
                        }
                    };
                    setData(fallbackData);
                    setError(err.message || 'Meta ve Google değerleri sıfırlandı.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchMetrics();
        return () => { isMounted = false; };
    }, [startDate, endDate]);

    return { data, loading, error };
}
