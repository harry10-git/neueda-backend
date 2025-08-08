const db = require("../config/database");

const sellStock = async (req, res) => {
  const { user_id, stock_id, curr_price, sellQuantity } = req.body;

  if (!user_id || !stock_id || !curr_price || !sellQuantity) {
    return res.status(400).json({ error: "user_id, stock_id, curr_price, and sellQuantity are required" });
  }

  try {
    // Check if user has holdings for that stock
    const [holdings] = await db.query(
      "SELECT holding_quantity, valuation FROM holdings WHERE user_id = ? AND stock_id = ?",
      [user_id, stock_id]
    );

    if (!holdings.length) {
      return res.status(404).json({ error: "No holdings found for this stock and user" });
    }

    const { holding_quantity, valuation } = holdings[0];

    if (sellQuantity > holding_quantity) {
      return res.status(400).json({ error: "Sell quantity exceeds holding quantity" });
    }

    const soldAmount = sellQuantity * curr_price;

    if (sellQuantity === holding_quantity) {
      // Remove the row if selling all
      await db.query(
        "DELETE FROM holdings WHERE user_id = ? AND stock_id = ?",
        [user_id, stock_id]
      );
    } else {
      // Update the row with new quantity and valuation
      const newQuantity = holding_quantity - sellQuantity;
      const newValuation = valuation - soldAmount;
      await db.query(
        "UPDATE holdings SET holding_quantity = ?, valuation = ? WHERE user_id = ? AND stock_id = ?",
        [newQuantity, newValuation, user_id, stock_id]
      );
    }

    // Add the sold amount to user's wallet_cash
    await db.query(
      "UPDATE user SET wallet_cash = wallet_cash + ? WHERE user_id = ?",
      [soldAmount, user_id]
    );

    return res.status(200).json({ message: "Stock sold successfully" });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

const buyStock = async (req, res) => {
  const { user_id, stock_id, buyQuantity, curr_price } = req.body;

  // console.log('user_id:', user_id, 'stock_id:', stock_id, 'buyQuantity:', buyQuantity, 'curr_price:', curr_price);
  

  if (!user_id || !stock_id || !buyQuantity || !curr_price) {
    return res.status(400).json({ error: "user_id, stock_id, buyQuantity, and curr_price are required" });
  }

  try {
    // Check user's wallet cash
    const [userRows] = await db.query(
      "SELECT wallet_cash FROM user WHERE user_id = ?",
      [user_id]
    );
    if (!userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const wallet_cash = userRows[0].wallet_cash;
    const purchaseAmount = buyQuantity * curr_price;

    if (wallet_cash < purchaseAmount) {
      return res.status(400).json({ error: "Insufficient funds, please add more money." });
    }

    // Check if user already holds this stock
    const [holdings] = await db.query(
      "SELECT holding_quantity, valuation FROM holdings WHERE user_id = ? AND stock_id = ?",
      [user_id, stock_id]
    );

    if (!holdings.length) {
      // Insert new holding
      await db.query(
        "INSERT INTO holdings (user_id, stock_id, holding_quantity, valuation, buy_datetime) VALUES (?, ?, ?, ?, NOW())",
        [user_id, stock_id, buyQuantity, purchaseAmount]
      );
    } else {
      // Update existing holding
      const { holding_quantity, valuation } = holdings[0];
      const newQuantity = holding_quantity + buyQuantity;
      const newValuation = valuation + purchaseAmount;
      await db.query(
        "UPDATE holdings SET holding_quantity = ?, valuation = ?, buy_datetime = NOW() WHERE user_id = ? AND stock_id = ?",
        [newQuantity, newValuation, user_id, stock_id]
      );
    }

    // Deduct purchase amount from user's wallet_cash
    await db.query(
      "UPDATE user SET wallet_cash = wallet_cash - ? WHERE user_id = ?",
      [purchaseAmount, user_id]
    );

    return res.status(200).json({ message: "Stock purchased successfully" });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = { sellStock, buyStock };