import express from 'express';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get integrations config
router.get('/integrations', async (req, res) => {
    try {
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        const fileData = await fs.readFile(integrationsDbPath, 'utf8');
        res.json(JSON.parse(fileData));
    } catch(e) {
        res.json({});
    }
});

// Save integrations config
router.put('/integrations', async (req, res) => {
    try {
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        let dbData = {};
        try {
            dbData = JSON.parse(await fs.readFile(integrationsDbPath, 'utf8'));
        } catch(e) {}
        
        Object.assign(dbData, req.body);
        await fs.writeFile(integrationsDbPath, JSON.stringify(dbData, null, 2));
        res.json({ success: true, data: dbData });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/data', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Fetch dynamic credentials from integrations.json
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        let dbData = {};
        try {
            const fileData = await fs.readFile(integrationsDbPath, 'utf8');
            dbData = JSON.parse(fileData);
        } catch(e) { /* ignore if not exist */ }
        
        const gaCreds = dbData.googleads || {}; // Assuming we save it under the generic 'googleads' ID in Integrations
        const propertyId = gaCreds.propertyId || '506933695';
        
        let analyticsDataClient;
        if (gaCreds.clientEmail && gaCreds.privateKey) {
            analyticsDataClient = new BetaAnalyticsDataClient({
                credentials: {
                    client_email: gaCreds.clientEmail,
                    private_key: gaCreds.privateKey.replace(/\\n/g, '\n'),
                }
            });
        } else {
            // Fallback to local file if no dynamic ones found safely
            analyticsDataClient = new BetaAnalyticsDataClient({
                keyFilename: path.resolve(__dirname, '../../analytics-key.json')
            });
        }

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: startDate || '30daysAgo',
                    endDate: endDate || 'today',
                },
            ],
            dimensions: [
                { name: 'sessionSourceMedium' },
            ],
            metrics: [
                { name: 'sessions' },
                { name: 'conversions' },
                { name: 'totalRevenue' },
                { name: 'advertiserAdCost' }
            ],
        });

        // Parse and format data
        const formattedData = (response?.rows || []).map(row => {
            const sessions = row.metricValues?.[0] ? parseInt(row.metricValues[0].value, 10) : 0;
            return {
                source: row.dimensionValues?.[0] ? row.dimensionValues[0].value : 'Unknown',
                sessions: sessions,
                conversions: row.metricValues?.[1] ? parseInt(row.metricValues[1].value, 10) : 0,
                revenue: row.metricValues?.[2] ? parseFloat(row.metricValues[2].value) : 0,
                cost: row.metricValues?.[3] ? parseFloat(row.metricValues[3].value) : 0 
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
        res.status(500).json({ error: 'Failed to fetch Analytics Data', details: error.message });
    }
});

export default router;
