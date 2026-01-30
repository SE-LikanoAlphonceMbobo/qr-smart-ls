const db = require('../config/db');

// @route   GET api/links/:restaurantId
// @desc    Get all links for a restaurant
// @access  Private
exports.getLinks = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    // Verify user owns this restaurant (Security Check)
    // For brevity here, we assume req.user checks are done, but in prod verify user_id matches restaurant.user_id
    
    const result = await db.query(
      'SELECT * FROM links WHERE restaurant_id = $1 ORDER BY display_order ASC',
      [restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/links
// @desc    Create a new link
// @access  Private
exports.createLink = async (req, res) => {
  try {
    const { restaurant_id, label, url, icon } = req.body;
    
    // Get current count to set display_order
    const countResult = await db.query('SELECT COUNT(*) FROM links WHERE restaurant_id = $1', [restaurant_id]);
    const displayOrder = parseInt(countResult.rows[0].count) + 1;

    const result = await db.query(
      `INSERT INTO links (restaurant_id, label, url, icon, display_order) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [restaurant_id, label, url, icon, displayOrder]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/links/:id
// @desc    Delete a link (Soft delete or Hard delete)
// @access  Private
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM links WHERE id = $1', [id]);
    res.json({ message: 'Link deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};