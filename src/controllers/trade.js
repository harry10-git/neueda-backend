const db = require("../config/database");

const sellStock = async (req, res) => {
    // console.log('trigger sell');
    
  const { user_id, stock_id, curr_price, sellQuantity } = req.body;

  if (!user_id || !stock_id || !curr_price || !sellQuantity) {
    console.log(user_id, stock_id, curr_price, sellQuantity);
    
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

    if (sellQuantity === holding_quantity) {
      // Remove the row if selling all
      await db.query(
        "DELETE FROM holdings WHERE user_id = ? AND stock_id = ?",
        [user_id, stock_id]
      );
    } else {
      // Update the row with new quantity and valuation
      const newQuantity = holding_quantity - sellQuantity;
      const newValuation = valuation - (sellQuantity * curr_price);
      await db.query(
        "UPDATE holdings SET holding_quantity = ?, valuation = ? WHERE user_id = ? AND stock_id = ?",
        [newQuantity, newValuation, user_id, stock_id]
      );
    }

    return res.status(200).json({ message: "Stock sold successfully" });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = { sellStock };