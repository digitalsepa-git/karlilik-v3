import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function run() {
  const supplierId = process.env.VITE_TRENDYOL_SUPPLIER_ID;
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  
  const nowTs = new Date().getTime();
  const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
  
  const url = `https://api.trendyol.com/sapigw/suppliers/${supplierId}/orders?size=200&startDate=${day15Ts}&endDate=${nowTs}&orderByField=CreatedDate&orderByDirection=DESC`;
  console.log("Fetching url 15 days:", url);
  
  const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}`, 'User-Agent': '931428 - SelfIntegration' } });
  const data = await res.json();
  console.log("Total Elements 15 days:", data.totalElements);
  
  if (data.errors) {
      console.log("ERRORS:", JSON.stringify(data.errors));
  }
}
run();
