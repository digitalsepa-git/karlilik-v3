import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function run() {
  const supplierId = process.env.VITE_TRENDYOL_SUPPLIER_ID;
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  const endDate = new Date().getTime();
  const startDate = endDate - (2 * 24 * 60 * 60 * 1000);
  const url = `https://api.trendyol.com/sapigw/suppliers/${supplierId}/orders?size=1&startDate=${startDate}&endDate=${endDate}&orderByField=CreatedDate&orderByDirection=DESC`;
  const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}`, 'User-Agent': '931428 - SelfIntegration' } });
  const data = await res.json();
  if(data.content?.length > 0) {
      console.log("Raw Order Date:", data.content[0].orderDate);
      console.log("Parsed Date:", new Date(data.content[0].orderDate));
  }
}
run();
