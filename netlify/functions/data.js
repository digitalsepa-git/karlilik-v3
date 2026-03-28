// Netlify Serverless Function: Google Analytics Data API Proxy
// GET /api/data?startDate=...&endDate=...

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export const handler = async (event, context) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    try {
        const startDate = event.queryStringParameters?.startDate || '30daysAgo';
        const endDate = event.queryStringParameters?.endDate || 'today';

        const propertyId = process.env.VITE_GA_PROPERTY_ID || '506933695';
        const clientEmail = process.env.GA_CLIENT_EMAIL;
        const privateKey = process.env.GA_PRIVATE_KEY;

        if (!clientEmail || !privateKey) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing GA Credentials. Set GA_CLIENT_EMAIL and GA_PRIVATE_KEY in Netlify env vars.' })
            };
        }

        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, '\n'),
            }
        });

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'sessionSourceMedium' }],
            metrics: [
                { name: 'sessions' },
                { name: 'conversions' },
                { name: 'totalRevenue' },
                { name: 'advertiserAdCost' }
            ],
        });

        const formattedData = (response?.rows || []).map(row => {
            return {
                source: row.dimensionValues?.[0]?.value || 'Unknown',
                sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
                conversions: parseInt(row.metricValues?.[1]?.value || '0', 10),
                revenue: parseFloat(row.metricValues?.[2]?.value || '0'),
                cost: parseFloat(row.metricValues?.[3]?.value || '0')
            };
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(formattedData)
        };
    } catch (error) {
        console.error('GA Function Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'GA data fetch failed', details: error.message })
        };
    }
};
