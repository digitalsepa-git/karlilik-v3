// Netlify Serverless Function: Trendyol API Proxy
// /trendyol-api/* → https://api.trendyol.com/*
// Trendyol API strictly requires a specific User-Agent format

export const handler = async (event, context) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
    }

    try {
        // When called via redirect from /trendyol-api/*, event.path contains
        // the original request path. We strip the prefix to get the API path.
        let proxyPath = event.path
            .replace(/^\/trendyol-api\/?/, '/')
            .replace(/^\/\.netlify\/functions\/trendyol\/?/, '/');
        
        // Ensure path starts with /
        if (!proxyPath.startsWith('/')) proxyPath = '/' + proxyPath;
        
        const qsp = event.queryStringParameters || {};
        const queryStr = Object.keys(qsp).length > 0 
            ? '?' + new URLSearchParams(qsp).toString() 
            : '';
            
        const targetUrl = `https://api.trendyol.com${proxyPath}${queryStr}`;
        
        console.log('[Trendyol Proxy] Path:', event.path, 'Query:', queryStr, '→ Target:', targetUrl);
        
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';

        const response = await fetch(targetUrl, {
            method: event.httpMethod,
            headers: {
                'Authorization': authHeader,
                'User-Agent': '931428 - SelfIntegration'
            }
        });

        const data = await response.text();

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: data
        };
    } catch (error) {
        console.error('Trendyol API Proxy Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Trendyol API proxy failed', details: error.message })
        };
    }
};
