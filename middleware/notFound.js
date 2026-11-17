const AppError = require('../utils/appError');

/**
 * Middleware to handle unmatched/undefined routes.
 * Creates an AppError with 404 Not Found and forwards it to the global error handler.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
};

module.exports = notFound;
