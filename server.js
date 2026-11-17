require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Library API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📚 Health check endpoint: http://localhost:${PORT}/api/v1/health`);
  console.log(`📖 Books API endpoint:    http://localhost:${PORT}/api/v1/books`);
});

// Handle unhandled promise rejections (e.g. database connection lost)
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
