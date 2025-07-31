const db = require('../config/database');

const getAllData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers'); // Replace 'table_name' with your table name
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { getAllData };