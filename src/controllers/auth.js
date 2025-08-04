const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const db = require("../config/database");

const register = async (req, res) => {
  try {
    // Check if username or email already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM user WHERE user_name = ? OR email = ?",
      [req.body.username, req.body.email]
    );
    // console.log("DB query callback hit");

    if (existingUsers.length) {
      return res.status(409).json("User already exists!");
    }

    // console.log("register hit 1");
    // Hash password and create user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    // console.log("register hit 2");

    // Insert new user into database
    const q = "INSERT INTO user (`user_name`, `email`, `password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hash];
    // console.log("register hit 3");

    await db.query(q, [values]);
    // console.log("register hit 4");
    return res.status(200).json("User has been created successfully!");
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json(err);
  }
};

const login = async (req, res) => {
  const q = "select * from user where user_name = ?";
  try {
    const [data] = await db.query(q, [req.body.username]);
    if (data.length === 0) return res.status(404).json("User not found!");

    // check password
    const isCorrectPassword = bcrypt.compareSync(req.body.password, data[0].password);
    if (!isCorrectPassword) return res.status(400).json("Wrong password or username!");

    const token = jwt.sign({ id: data[0].user_name }, "jwtkey");
    const { password, ...other } = data[0];

    res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json(other);
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json(err);
  }
};

const logout = (req, res) => {
  // Logic for user logout
  res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out.")
};

module.exports = {
  register,
  login,
  logout,
};