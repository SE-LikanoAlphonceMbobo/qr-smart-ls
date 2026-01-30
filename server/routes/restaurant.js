const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRestaurant, getRestaurants } = require('../controllers/restaurantController');

router.use(auth); // Protect all restaurant routes

router.post('/', createRestaurant);
router.get('/', getRestaurants);

module.exports = router;