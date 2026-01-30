const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password, phone, security_question, security_answer } = req.body;

  try {
    // 1. Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Hash Security Answer (Critical for security)
    const answer_hash = await bcrypt.hash(security_answer.toLowerCase(), salt);

    // 4. Insert new user with extended fields
    const newUser = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, security_question, security_answer_hash) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email`,
      [name, email, phone, password_hash, security_question, answer_hash]
    );

    // 5. Return JWT
    const payload = { user: { id: newUser.rows[0].id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: newUser.rows[0] });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.rows[0].id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: user.rows[0] }); // Return user info for personalized welcome
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};