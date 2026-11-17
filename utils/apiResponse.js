/**
 * Standardized JSON response helper utilities to ensure consistent API payloads.
 */

/**
 * Sends a successful JSON response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Human-readable success message
 * @param {any} data - Payload data (object, array, null)
 * @param {object} [meta] - Optional pagination or metadata
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = undefined) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends an error JSON response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {any} [errors] - Optional detailed validation error map or array
 */
const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
