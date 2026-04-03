import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function run() {
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  const nowTs = new Date().getTime();
  const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
  const url = `http://localhost:8888/trendyol-api/sapigw/suppliers/931428/orders?size=1&startDate=${day15Ts}&endDate=${nowTs}&orderByField=CreatedDate&orderByDirection=DESC`;
  
  const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}` } });
  const data = await res.json();
  if (data.content && data.content.length > 0) {
      console.log("Raw orderDate:", data.content[0].orderDate);
      console.log("Parsed Date string:", new Date(data.content[0].orderDate).toISOString());
  } else {
      console.log("No orders in last 15 days returning from proxy.", data);
  }
}
run();
