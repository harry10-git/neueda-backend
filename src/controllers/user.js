const db = require("../config/database");

const addWalletCash = async (req, res) => {
  const { user_id, amount } = req.body;
    
  if (!user_id || typeof amount !== "number") {
    return res.status(400).json({ error: "user_id and amount are required" });
  }

  try {
    // Update wallet_cash by adding the amount to the existing value
    const q = `
      UPDATE user
      SET wallet_cash = wallet_cash + ?
      WHERE user_id = ?
    `;
    const [result] = await db.query(q, [amount, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "Wallet cash updated successfully" });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

const getWalletCash = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const q = `SELECT wallet_cash FROM user WHERE user_id = ?`;
    const [rows] = await db.query(q, [user_id]);

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ wallet_cash: rows[0].wallet_cash });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = { addWalletCash, getWalletCash };
