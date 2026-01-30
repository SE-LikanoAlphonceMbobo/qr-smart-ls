const express = require('express');
const router = express.Router(); // <--- FIX: Changed from express('express').Router()
const db = require('../config/db');

// GET /r/:slug - Public view for scans
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // Join restaurants and links
    const query = `
      SELECT 
        r.name, r.type, r.logo_url, r.id as restaurant_id,
        l.label, l.url, l.icon, l.display_order
      FROM restaurants r
      LEFT JOIN links l ON r.id = l.restaurant_id AND l.is_active = true
      WHERE r.public_slug = $1 AND r.status = 'active'
      ORDER BY l.display_order ASC
    `;

    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Format data: One restaurant object, array of links
    const restaurant = {
      name: result.rows[0].name,
      type: result.rows[0].type,
      logoUrl: result.rows[0].logo_url,
      links: result.rows
        .map(row => ({
          label: row.label,
          url: row.url,
          icon: row.icon
        }))
        .filter(link => link.label !== null) // Filter out empty joins if no links
    };

    res.json(restaurant);
  } catch (err) {
    console.error('Public Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;