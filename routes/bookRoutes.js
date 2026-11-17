const express = require('express');
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooksByTitle,
  searchBooksByAuthor,
  filterBooksByCategory,
} = require('../controllers/bookController');

const { validateCreateBook, validateUpdateBook } = require('../middleware/validateBook');

// 1. Search & Filter routes (defined before /:id so they are not treated as ID params)
router.get('/search/title', searchBooksByTitle);
router.get('/search/author', searchBooksByAuthor);
router.get('/filter/category', filterBooksByCategory);

// 2. Collection routes
router.route('/')
  .post(validateCreateBook, createBook)
  .get(getAllBooks);

// 3. Document-specific routes (by ID)
router.route('/:id')
  .get(getBookById)
  .put(validateUpdateBook, updateBook)
  .delete(deleteBook);

module.exports = router;
