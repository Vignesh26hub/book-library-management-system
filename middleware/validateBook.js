const AppError = require('../utils/appError');

/**
 * Validation Middleware for Creating a Book.
 * Runs before the controller to ensure incoming payload satisfies all requirements.
 */
const validateCreateBook = (req, res, next) => {
  const { title, author, isbn, category, publicationYear, totalCopies, availableCopies } = req.body;
  const errors = {};

  // 1. Title validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Title cannot be empty';
  }

  // 2. Author validation
  if (!author || typeof author !== 'string' || author.trim() === '') {
    errors.author = 'Author cannot be empty';
  }

  // 3. ISBN validation
  if (!isbn || typeof isbn !== 'string' || isbn.trim() === '') {
    errors.isbn = 'ISBN cannot be empty';
  }

  // 4. Category validation
  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.category = 'Category cannot be empty';
  }

  // 5. Publication Year validation
  const currentYear = new Date().getFullYear();
  if (
    publicationYear === undefined ||
    publicationYear === null ||
    typeof publicationYear !== 'number' ||
    !Number.isInteger(publicationYear) ||
    publicationYear < 1000 ||
    publicationYear > currentYear + 1
  ) {
    errors.publicationYear = `Publication year must be an integer between 1000 and ${currentYear + 1}`;
  }

  // 6. Total Copies validation
  if (
    totalCopies === undefined ||
    totalCopies === null ||
    typeof totalCopies !== 'number' ||
    !Number.isInteger(totalCopies) ||
    totalCopies < 0
  ) {
    errors.totalCopies = 'Total copies cannot be negative and must be an integer';
  }

  // 7. Available Copies validation
  if (availableCopies !== undefined && availableCopies !== null) {
    if (
      typeof availableCopies !== 'number' ||
      !Number.isInteger(availableCopies) ||
      availableCopies < 0
    ) {
      errors.availableCopies = 'Available copies cannot be negative and must be an integer';
    } else if (totalCopies !== undefined && availableCopies > totalCopies) {
      errors.availableCopies = 'Available copies cannot exceed total copies';
    }
  }

  // If there are validation errors, return 400 Bad Request
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed for one or more fields',
      errors,
    });
  }

  next();
};

/**
 * Validation Middleware for Updating a Book.
 * Validates only the fields that are present in the update payload.
 */
const validateUpdateBook = (req, res, next) => {
  const { title, author, isbn, category, publicationYear, totalCopies, availableCopies } = req.body;
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    errors.title = 'Title cannot be empty';
  }

  if (author !== undefined && (typeof author !== 'string' || author.trim() === '')) {
    errors.author = 'Author cannot be empty';
  }

  if (isbn !== undefined && (typeof isbn !== 'string' || isbn.trim() === '')) {
    errors.isbn = 'ISBN cannot be empty';
  }

  if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
    errors.category = 'Category cannot be empty';
  }

  if (
    publicationYear !== undefined &&
    (typeof publicationYear !== 'number' ||
      !Number.isInteger(publicationYear) ||
      publicationYear < 1000 ||
      publicationYear > currentYear + 1)
  ) {
    errors.publicationYear = `Publication year must be an integer between 1000 and ${currentYear + 1}`;
  }

  if (
    totalCopies !== undefined &&
    (typeof totalCopies !== 'number' || !Number.isInteger(totalCopies) || totalCopies < 0)
  ) {
    errors.totalCopies = 'Total copies cannot be negative and must be an integer';
  }

  if (
    availableCopies !== undefined &&
    (typeof availableCopies !== 'number' || !Number.isInteger(availableCopies) || availableCopies < 0)
  ) {
    errors.availableCopies = 'Available copies cannot be negative and must be an integer';
  }

  if (
    totalCopies !== undefined &&
    availableCopies !== undefined &&
    availableCopies > totalCopies
  ) {
    errors.availableCopies = 'Available copies cannot exceed total copies';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed for one or more fields',
      errors,
    });
  }

  next();
};

module.exports = {
  validateCreateBook,
  validateUpdateBook,
};
