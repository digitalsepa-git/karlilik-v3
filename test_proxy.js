import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function run() {
  const authStr = Buffer.from(`${process.env.VITE_TRENDYOL_API_KEY}:${process.env.VITE_TRENDYOL_API_SECRET}`).toString('base64');
  
  const nowTs = new Date().getTime();
  const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
  
  const url = `http://localhost:8888/trendyol-api/sapigw/suppliers/931428/orders?size=20&startDate=${day15Ts}&endDate=${nowTs}&orderByField=CreatedDate&orderByDirection=DESC`;
  console.log("Testing Netlify Proxy at:", url);
  
  try {
      const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}` } });
      const data = await res.json();
      console.log("Proxy Response Keys:", Object.keys(data));
      if (data.errors) console.log("Proxy Errors:", data.errors);
      else console.log("Proxy Total Elements:", data.totalElements);
  } catch(e) {
      console.error("Proxy Request Failed:", e.message);
  }
}
run();
