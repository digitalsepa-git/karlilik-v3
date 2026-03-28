let dbData = {};
try {
    const mod = await import('../../src/server/targets.json', { assert: { type: 'json' } });
    dbData = mod.default || {};
} catch (e) {
    try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        dbData = require('../../src/server/targets.json');
    } catch (e2) {
        console.error('Could not load targets.json:', e2.message);
        dbData = {};
    }
}

export const handler = async (event, context) => {
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

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(dbData)
    };
};
