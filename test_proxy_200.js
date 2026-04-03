import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  const nowTs = new Date().getTime();
  const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
  const url = `http://localhost:8888/trendyol-api/sapigw/suppliers/931428/orders?size=200&startDate=${day15Ts}&endDate=${nowTs}&orderByField=CreatedDate&orderByDirection=DESC`;
  
  console.log("Fetching size 200:", url);
  const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}` } });
  const data = await res.json();
  console.log("Response total elements:", data.totalElements);
  console.log("Content length:", data.content ? data.content.length : 'none');
  if (data.errors) console.log("Errors:", data.errors);
}
run();
