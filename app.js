const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const bookRoutes = require('./routes/bookRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// =============================================================================
// Middlewares
// =============================================================================
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging (disabled during test runs to keep output clean)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// =============================================================================
// Health Check Endpoint
// =============================================================================
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Book Library Management System API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// API Routes
// =============================================================================
app.use('/api/v1/books', bookRoutes);

// =============================================================================
// 404 Not Found & Error Handling
// =============================================================================
// Handle undefined routes
app.use(notFound);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
