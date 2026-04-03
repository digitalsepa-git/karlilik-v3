import fetch from 'node-fetch';

async function run() {
    try {
        console.log("Fetching GET http://localhost:8888/api/integrations");
        const dbRes = await fetch('http://localhost:8888/api/integrations');
        const dbData = await dbRes.json();
        console.log("Integrations data:", JSON.stringify({
             ikas_keys: !!dbData.ikas?.clientId,
             ty_keys: !!dbData.ty?.apiKey,
             ty_supplier_id: dbData.ty?.supplierId
        }));
        
        const supplierId = dbData.ty?.supplierId;
        const authStr = Buffer.from(`${dbData.ty?.apiKey}:${dbData.ty?.apiSecret}`).toString('base64');
        
        const nowTs = new Date().getTime();
        const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
        
        const tyUrl = `http://localhost:8888/trendyol-api/sapigw/suppliers/${supplierId}/orders?size=1&startDate=${day15Ts}&endDate=${nowTs}&orderByField=CreatedDate&orderByDirection=DESC`;
        console.log("Fetching Trendyol:", tyUrl);
        
        const tyRes = await fetch(tyUrl, { headers: { 'Authorization': `Basic ${authStr}` } });
        const tyData = await tyRes.json();
        console.log("Trendyol Content Length:", tyData.content?.length);
        if (tyData.errors) console.log("Trendyol Errors:", tyData.errors);
        
    } catch(e) {
        console.error("Test Error:", e.message);
    }
}
run();
