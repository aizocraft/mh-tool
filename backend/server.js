// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// === DYNAMIC CORS FROM .env ===
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// === DATABASE ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// === ROUTES ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/analytics', require('./routes/analytics'));

// === SERVE FRONTEND IN PRODUCTION (FULL-STACK ON RENDER) ===
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, process.env.FRONTEND_BUILD_PATH || '../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS allowed: ${allowedOrigins.join(' | ')}`);
});