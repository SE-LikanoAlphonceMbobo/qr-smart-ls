const db = require('../config/db');

// Helper: Generate Unique Slug
const generateSlug = (name) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Trim hyphens
  
  // Add random 4-digit number to ensure uniqueness
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomNum}`;
};

// @route   POST api/restaurant
// @desc    Create a new restaurant
// @access  Private
exports.createRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, logo_url } = req.body;

    // Simple validation
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and Type are required' });
    }

    // Generate immutable slug
    const publicSlug = generateSlug(name);

    // Insert into DB
    const query = `
      INSERT INTO restaurants (user_id, name, type, logo_url, public_slug)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [
      userId, 
      name, 
      type, 
      logo_url || null, // Handle optional logo
      publicSlug
    ]);

    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/restaurant
// @desc    Get all restaurants for user (To use later in dropdowns)
// @access  Private
exports.getRestaurants = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};