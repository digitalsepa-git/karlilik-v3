// Netlify Serverless Function: Integrations Config
// Returns API credentials from environment variables
// GET /api/integrations

export const handler = async (event, context) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    // PUT/POST - acknowledge but we can't persist in serverless (stateless)
    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: true })
        };
    }

    // GET - return credentials from environment variables
    const config = {};

    // Ikas credentials
    if (process.env.VITE_IKAS_CLIENT_ID || process.env.VITE_IKAS_CLIENT_SECRET) {
        config.ikas = {
            clientId: process.env.VITE_IKAS_CLIENT_ID || '',
            clientSecret: process.env.VITE_IKAS_CLIENT_SECRET || ''
        };
    }

    // Trendyol credentials
    if (process.env.VITE_TRENDYOL_API_KEY || process.env.VITE_TRENDYOL_API_SECRET) {
        config.ty = {
            supplierId: process.env.VITE_TRENDYOL_SUPPLIER_ID || '',
            apiKey: process.env.VITE_TRENDYOL_API_KEY || '',
            apiSecret: process.env.VITE_TRENDYOL_API_SECRET || ''
        };
    }

    // Google Analytics credentials
    if (process.env.GA_CLIENT_EMAIL || process.env.GA_PRIVATE_KEY) {
        config.googleads = {
            propertyId: process.env.VITE_GA_PROPERTY_ID || '',
            clientEmail: process.env.GA_CLIENT_EMAIL || '',
            privateKey: process.env.GA_PRIVATE_KEY || ''
        };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(config)
    };
};
