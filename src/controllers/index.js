const db = require('../config/database');

const finnhub = require('finnhub');

const finnhubClient = new finnhub.DefaultApi("d25ku19r01qns40ff5bgd25ku19r01qns40ff5c0") // Replace this


const getAllHoldings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM holdings'); // Replace 'table_name' with your table name
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// write getAllStocks

// const getAllStocks = async (req, res) => {
//   try {
//     // Fetch all stocks from the database
//     const [stocks] = await db.query('SELECT stock_id, stock_name FROM stocks');

//     // Fetch real-time prices and 52-week high/low for all stocks
//     const stockUpdates = await Promise.all(
//       stocks.map((stock) => {
//         return new Promise((resolve, reject) => {
//           // Fetch real-time price
//           finnhubClient.quote(stock.stock_name, (quoteError, quoteData) => {
//             if (quoteError) {
//               console.error(`Error fetching real-time data for ${stock.stock_name}:`, quoteError);
//               return reject(quoteError);
//             }

//             // Fetch 52-week high and low
//             finnhubClient.companyBasicFinancials(stock.stock_name, 'all', (financialError, financialData) => {
//               if (financialError) {
//                 console.error(`Error fetching financial data for ${stock.stock_name}:`, financialError);
//                 return reject(financialError);
//               }

//               const metrics = financialData?.metric || {};
//               resolve({
//                 stock_name: stock.stock_name,
//                 stock_id: stock.stock_id,
//                 curr_price: quoteData.c,
//                 week_52_high: metrics['52WeekHigh'] || null,
//                 week_52_low: metrics['52WeekLow'] || null,
//               });
//             });
//           });
//         });
//       })
//     );

//     // Update the database with the fetched real-time prices
//     for (const update of stockUpdates) {
//       await db.query('UPDATE stocks SET curr_price = ? WHERE stock_id = ?', [update.curr_price, update.stock_id]);
//     }

//     // Return the updated stocks data along with 52-week high/low
//     res.json(stockUpdates);
//   } catch (error) {
//     console.error('Error fetching or updating stocks:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
const getAllStocks = async (req, res) => {
  try {
    // Fetch all stocks from the database
    const [stocks] = await db.query('SELECT stock_id, stock_name FROM stocks');

    // Fetch real-time prices, 52-week high/low, and other metrics for all stocks
    const stockUpdates = await Promise.all(
      stocks.map((stock) => {
        return new Promise((resolve, reject) => {
          // Fetch real-time price and other metrics
          finnhubClient.quote(stock.stock_name, (quoteError, quoteData) => {
            if (quoteError) {
              console.error(`Error fetching real-time data for ${stock.stock_name}:`, quoteError);
              return reject(quoteError);
            }

            // Fetch 52-week high and low
            finnhubClient.companyBasicFinancials(stock.stock_name, 'all', (financialError, financialData) => {
              if (financialError) {
                console.error(`Error fetching financial data for ${stock.stock_name}:`, financialError);
                return reject(financialError);
              }

              const metrics = financialData?.metric || {};
              resolve({
                stock_name: stock.stock_name,
                stock_id: stock.stock_id,
                curr_price: quoteData.c, // Today's stock price
                price_diff: quoteData.d, // Difference from previous day's close
                percent_change: quoteData.dp, // Percentage change
                week_52_high: metrics['52WeekHigh'] || null,
                week_52_low: metrics['52WeekLow'] || null,
              });
            });
          });
        });
      })
    );

    // Update the database with the fetched real-time prices
    for (const update of stockUpdates) {
      await db.query('UPDATE stocks SET curr_price = ? WHERE stock_id = ?', [update.curr_price, update.stock_id]);
    }

    // Return the updated stocks data along with additional metrics
    res.json(stockUpdates);
  } catch (error) {
    console.error('Error fetching or updating stocks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateHoldings = async (req, res) => {
  const { stock_id, user_id, quantity, buying_price } = req.body;

  if (!stock_id || !user_id || !quantity || !buying_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the user_id exists in the user table
    const [userExists] = await db.query('SELECT user_id FROM user WHERE user_id = ?', [user_id]);
    if (userExists.length === 0) {
      return res.status(400).json({ error: 'Invalid user_id: User does not exist' });
    }

    // Check if the stock_id and user_id combination exists in the holdings table
    const [existingHolding] = await db.query(
      'SELECT holding_quantity, valuation FROM holdings WHERE stock_id = ? AND user_id = ?',
      [stock_id, user_id]
    );

    if (existingHolding.length === 0) {
      // If the stock_id and user_id combination does not exist, insert a new entry
      const valuation = buying_price * quantity;
      await db.query(
        'INSERT INTO holdings (user_id, stock_id, holding_quantity, valuation, buy_datetime) VALUES (?, ?, ?, ?, NOW())',
        [user_id, stock_id, quantity, valuation]
      );
      return res.status(201).json({ message: 'Holding added successfully' });
    } else {
      // If the stock_id and user_id combination exists, update the quantity and valuation
      const oldQuantity = existingHolding[0].holding_quantity;
      const oldValuation = existingHolding[0].valuation;

      const newQuantity = oldQuantity + quantity;
      const newValuation = oldValuation + buying_price * quantity;

      await db.query(
        'UPDATE holdings SET holding_quantity = ?, valuation = ? WHERE stock_id = ? AND user_id = ?',
        [newQuantity, newValuation, stock_id, user_id]
      );
      return res.status(200).json({ message: 'Holding updated successfully' });
    }
  } catch (error) {
    console.error('Error updating holdings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports = { getAllHoldings, getAllStocks, updateHoldings };




