const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // We need to make sure this file exists
const { getDashboardData } = require('../controllers/dashboardController');

// If you haven't created authMiddleware wrapper, use the one we built:
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

router.get('/', getDashboardData);

module.exports = router;