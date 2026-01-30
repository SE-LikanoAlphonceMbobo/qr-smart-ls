const db = require('../config/db');

// @route   GET api/dashboard
// @desc    Get user stats and recent links
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all restaurants and their links for this user
    const query = `
      SELECT 
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.logo_url,
        l.id as link_id,
        l.label,
        l.url,
        l.icon,
        l.is_active,
        l.created_at
      FROM restaurants r
      LEFT JOIN links l ON r.id = l.restaurant_id
      WHERE r.user_id = $1
      ORDER BY l.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    const rows = result.rows;

    // 2. Calculate Stats from the data
    const restaurantSet = new Set();
    let totalLinks = 0;
    let totalActiveLinks = 0;
    const recentLinks = [];

    rows.forEach(row => {
      if (row.restaurant_id) restaurantSet.add(row.restaurant_id);
      
      if (row.link_id) {
        totalLinks++;
        if (row.is_active) totalActiveLinks++;
        
        // Prepare data for UI
        recentLinks.push({
          id: row.link_id,
          label: row.label,
          url: row.url,
          restaurant: row.restaurant_name, // Helpful to know which restaurant
          status: row.is_active ? 'Active' : 'Inactive',
          icon: row.icon || 'link'
        });
      }
    });

    // Limit recent links to top 5
    const formattedLinks = recentLinks.slice(0, 5);

    const stats = {
      totalRestaurants: restaurantSet.size,
      totalLinks: totalLinks,
      totalActiveLinks: totalActiveLinks,
      totalScans: 0 // Placeholder for future analytics table
    };

    res.json({
      stats,
      links: formattedLinks
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};