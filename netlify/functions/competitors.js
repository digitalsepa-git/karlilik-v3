import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Netlify esbuild bundles relative imports, but for JSON we use createRequire pattern
let dbData = [];
try {
    // When bundled by esbuild, the JSON should be resolvable
    const mod = await import('../../src/server/competitors.json', { assert: { type: 'json' } });
    dbData = mod.default || [];
} catch (e) {
    try {
        // Fallback: try require-style (CJS compat)
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        dbData = require('../../src/server/competitors.json');
    } catch (e2) {
        console.error('Could not load competitors.json:', e2.message);
        dbData = [];
    }
}

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

    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: true, warning: 'Netlify functions are ephemeral — data saved to session only' })
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
