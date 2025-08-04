const db = require("../config/database");
const finnhub = require('finnhub');

const finnhubClient = new finnhub.DefaultApi("d25ku19r01qns40ff5bgd25ku19r01qns40ff5c0"); // Replace this

const getUserStocksNews = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  // Get unique stocks for the user
  const q = `
    SELECT DISTINCT s.stock_name
    FROM holdings h
    JOIN stocks s ON h.stock_id = s.stock_id
    WHERE h.user_id = ?
  `;

  try {
    const [stocks] = await db.query(q, [user_id]);
    if (!stocks.length) {
      return res.status(404).json({ error: "No stocks found for user" });
    }

    // Get today's date and a recent date for the news range
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // 7 days ago

    // For each stock, fetch the first 2 news articles and flatten into a single array
    const allNews = [];
    await Promise.all(
      stocks.map(stock =>
        new Promise((resolve) => {
          finnhubClient.companyNews(stock.stock_name, from, to, (error, data) => {
            if (error || !Array.isArray(data)) {
              return resolve();
            }
            // Take first 2 news articles and push to allNews array
            data.slice(0, 2).forEach(newsItem => {
              allNews.push({
                stock: stock.stock_name,
                ...newsItem
              });
            });
            resolve();
          });
        })
      )
    );

    return res.status(200).json(allNews);
  } catch (err) {
    console.error("DB error or Finnhub error:", err);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
};


// const getHoldingsByUserId = async (req, res) => {
//   const { user_id } = req.params;

//   if (!user_id) {
//     return res.status(400).json({ error: "user_id is required" });
//   }

//   // Join holdings with stocks to get stock_name and symbol
//   const q = `
//     SELECT h.*, s.stock_name, s.symbol
//     FROM holdings h
//     JOIN stocks s ON h.stock_id = s.stock_id
//     WHERE h.user_id = ?
//   `;
//   try {
//     const [holdings] = await db.query(q, [user_id]);

//     // For each holding, fetch real-time data from finnhub
//     const enrichedHoldings = await Promise.all(
//       holdings.map(holding => {
//         return new Promise((resolve) => {
//           finnhubClient.quote(holding.symbol, (err, quoteData) => {
//             if (err || !quoteData) {
//               // If error, just return holding without enrichment
//               return resolve({
//                 ...holding,
//                 curr_price: null,
//                 price_diff: null,
//                 percent_diff: null,
//                 week_52_high: null,
//                 week_52_low: null
//               });
//             }

//             finnhubClient.companyBasicFinancials(holding.symbol, 'all', (finErr, finData) => {
//               let week_52_high = null;
//               let week_52_low = null;
//               if (!finErr && finData && finData.metric) {
//                 week_52_high = finData.metric['52WeekHigh'] || null;
//                 week_52_low = finData.metric['52WeekLow'] || null;
//               }

//               const curr_price = quoteData.c || null;
//               const prev_close = quoteData.pc || null;
//               const price_diff = (curr_price !== null && prev_close !== null) ? (curr_price - prev_close) : null;
//               const percent_diff = (curr_price !== null && prev_close !== null && prev_close !== 0)
//                 ? ((curr_price - prev_close) / prev_close) * 100
//                 : null;

//               resolve({
//                 ...holding,
//                 curr_price,
//                 price_diff,
//                 percent_diff,
//                 week_52_high,
//                 week_52_low
//               });
//             });
//           });
//         });
//       })
//     );

//     return res.status(200).json(enrichedHoldings);
//   } catch (err) {
//     console.error("DB error:", err);
//     return res.status(500).json({ error: "Database error" });
//   }
// };

const getHoldingsByUserId = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  // Only select columns that exist in your schema
  const q = `
    SELECT h.*, s.stock_name
    FROM holdings h
    JOIN stocks s ON h.stock_id = s.stock_id
    WHERE h.user_id = ?
  `;
  try {
    const [holdings] = await db.query(q, [user_id]);

    // For each holding, fetch real-time data and logo from finnhub
    const enrichedHoldings = await Promise.all(
      holdings.map(holding => {
        return new Promise((resolve) => {
          finnhubClient.quote(holding.stock_name, (err, quoteData) => {
            if (err || !quoteData) {
              return resolve({
                ...holding,
                curr_price: null,
                price_diff: null,
                percent_diff: null,
                week_52_high: null,
                week_52_low: null,
                logo: null
              });
            }

            finnhubClient.companyBasicFinancials(holding.stock_name, 'all', (finErr, finData) => {
              let week_52_high = null;
              let week_52_low = null;
              if (!finErr && finData && finData.metric) {
                week_52_high = finData.metric['52WeekHigh'] || null;
                week_52_low = finData.metric['52WeekLow'] || null;
              }

              // Fetch logo using companyProfile2
              finnhubClient.companyProfile2({ symbol: holding.stock_name }, (logoErr, profileData) => {
                const logo = (!logoErr && profileData && profileData.logo) ? profileData.logo : null;

                const curr_price = quoteData.c || null;
                const prev_close = quoteData.pc || null;
                const price_diff = (curr_price !== null && prev_close !== null) ? (curr_price - prev_close) : null;
                const percent_diff = (curr_price !== null && prev_close !== null && prev_close !== 0)
                  ? ((curr_price - prev_close) / prev_close) * 100
                  : null;

                resolve({
                  ...holding,
                  curr_price,
                  price_diff,
                  percent_diff,
                  week_52_high,
                  week_52_low,
                  logo
                });
              });
            });
          });
        });
      })
    );

    return res.status(200).json(enrichedHoldings);
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

const allStockLogos = async (req, res) => {
  try {
    // Get all distinct stock names from the stocks table
    const q = `SELECT DISTINCT stock_name FROM stocks`;
    const [stocks] = await db.query(q);

    // For each stock, fetch the logo from finnhub
    const logos = await Promise.all(
      stocks.map(stock =>
        new Promise((resolve) => {
          finnhubClient.companyProfile2({ symbol: stock.stock_name }, (err, profileData) => {
            if (err || !profileData || !profileData.logo) {
              return resolve(null);
            }
            resolve(profileData.logo);
          });
        })
      )
    );

    // Filter out any nulls (stocks with no logo found)
    const filteredLogos = logos.filter(logo => !!logo);

    return res.status(200).json(filteredLogos);
  } catch (err) {
    console.error("DB error or Finnhub error:", err);
    return res.status(500).json({ error: "Failed to fetch stock logos" });
  }
};

module.exports = { getHoldingsByUserId, getUserStocksNews, allStockLogos };