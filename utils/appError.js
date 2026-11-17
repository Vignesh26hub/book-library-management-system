/**
 * Custom Application Error class extending native JavaScript Error.
 * Used across controllers and middleware to generate operational errors
 * with specific HTTP status codes and uniform properties.
 */
class AppError extends Error {
  /**
   * @param {string} message - Descriptive error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // 'fail' for 4xx client errors, 'error' for 5xx server errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Operational error flag indicates this is a known, trusted error handled by our application
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
