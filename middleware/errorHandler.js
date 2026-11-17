/**
 * Centralized Error Handling Middleware for Express.
 * Intercepts all errors passed via next(err) and formats a consistent JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // 1. Handle Mongoose Validation Error (e.g., Schema constraints violated)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for one or more fields';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 2. Handle Mongoose Duplicate Key Error (MongoDB error code 11000 - e.g. duplicate ISBN)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue)[0];
    const duplicateValue = err.keyValue[duplicateField];
    message = `A book with this ${duplicateField} ('${duplicateValue}') already exists.`;
  }

  // 3. Handle Mongoose CastError (e.g. invalid MongoDB ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': '${err.value}'`;
  }

  // Log server errors for developer debugging (in non-test environments)
  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error('🔥 Server Error:', err);
  }

  // Send standardized JSON error response
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in development mode for debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
