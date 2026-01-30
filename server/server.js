require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db'); // Initialize DB connection

const app = express();

// 1. Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL })); // Allow React Frontend
app.use(express.json());

// 2. Rate Limiting (Apply to all requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// 3. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/restaurant', require('./routes/restaurant'));
app.use('/api/links', require('./routes/links'));
app.use('/api/upload', require('./routes/upload'));
 

app.use('/r', require('./routes/public'));

// 4. Base Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});