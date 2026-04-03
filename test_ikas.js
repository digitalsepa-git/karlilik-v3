import('dotenv').then(({default: dotenv}) => {
  dotenv.config({ path: '.env.local' });
  const token = process.env.VITE_IKAS_ACCESS_TOKEN;
  if (!token) return console.log('No Ikas Token found in .env.local');
  
  const query = `
    query {
        listOrder(limit: 5, sortBy: "createdAt", sortDirection: DESC) {
            data {
                id
                orderNumber
                totalPrice
                finalPrice
                discountAmount
                subTotal
                currency
                status
                orderLines {
                    quantity
                    finalPrice
                    discountAmount
                    basePrice
                    sellPrice
                }
            }
        }
    }
  `;
  
  fetch('https://api.ikas.com/api/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query })
  })
  .then(r => r.json())
  .then(json => {
      console.log('--- IKAS API ---');
      console.dir(json, {depth: null});
  })
  .catch(console.error);
});
