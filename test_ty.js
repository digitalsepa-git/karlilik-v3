import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '/Users/kemalbozdag/karlılıkanalizi/.env.local' });

async function run() {
  const supplierId = process.env.VITE_TRENDYOL_SUPPLIER_ID;
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  
  // Last 60 days
  const endDate = new Date().getTime();
  const startDate = endDate - (60 * 24 * 60 * 60 * 1000);
  
  const url = `https://api.trendyol.com/sapigw/suppliers/${supplierId}/orders?size=200&startDate=${startDate}&endDate=${endDate}&orderByField=CreatedDate&orderByDirection=DESC`;
  console.log("Fetching url:", url);
  
  const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}`, 'User-Agent': '931428 - SelfIntegration' } });
  const data = await res.json();
  console.log("Total Elements:", data.totalElements);
  console.log("Returned Elements:", data.content?.length);
  if(data.content?.length > 0) {
      console.log("First Order Date:", new Date(data.content[0].orderDate));
      console.log("Last Order Date:", new Date(data.content[data.content.length-1].orderDate));
      console.log("Sample Order:", JSON.stringify(data.content[0], null, 2));
  }
}
run();
