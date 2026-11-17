const mongoose = require('mongoose');
const Book = require('../models/Book');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Helper to find a book either by MongoDB ObjectId or custom bookId.
 */
const findBookByIdOrCustomId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const book = await Book.findById(id);
    if (book) return book;
  }
  return await Book.findOne({ bookId: id });
};

/**
 * 1. CREATE BOOK
 * POST /api/v1/books
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, publicationYear, totalCopies, availableCopies } = req.body;

    // Check if a book with the same ISBN already exists
    const existingBook = await Book.findOne({ isbn: isbn.trim().toUpperCase() });
    if (existingBook) {
      return next(new AppError(`A book with ISBN '${isbn}' already exists.`, 409));
    }

    // Create and save new book
    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim().toUpperCase(),
      category: category.trim(),
      publicationYear,
      totalCopies,
      availableCopies: availableCopies !== undefined ? availableCopies : totalCopies,
    });

    return sendSuccess(res, 201, 'Book created successfully', newBook);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET ALL BOOKS
 * GET /api/v1/books
 * Supports optional pagination (?page=1&limit=10) and sorting (?sort=title)
 */
const getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      sortOption = req.query.sort.split(',').join(' ');
    }

    const [books, total] = await Promise.all([
      Book.find().sort(sortOption).skip(skip).limit(limit),
      Book.countDocuments(),
    ]);

    const meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      count: books.length,
    };

    return sendSuccess(res, 200, 'Books retrieved successfully', books, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET BOOK BY ID
 * GET /api/v1/books/:id
 * Supports both MongoDB _id and custom bookId (e.g. BK-123456)
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await findBookByIdOrCustomId(id);

    if (!book) {
      return next(new AppError(`Book not found with ID '${id}'`, 404));
    }

    return sendSuccess(res, 200, 'Book retrieved successfully', book);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. UPDATE BOOK
 * PUT /api/v1/books/:id
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await findBookByIdOrCustomId(id);

    if (!book) {
      return next(new AppError(`Book not found with ID '${id}'`, 404));
    }

    const { title, author, isbn, category, publicationYear, totalCopies, availableCopies } = req.body;

    // Check if new ISBN conflicts with another book
    if (isbn && isbn.trim().toUpperCase() !== book.isbn) {
      const existingIsbn = await Book.findOne({
        isbn: isbn.trim().toUpperCase(),
        _id: { $ne: book._id },
      });
      if (existingIsbn) {
        return next(new AppError(`A book with ISBN '${isbn}' already exists.`, 409));
      }
      book.isbn = isbn.trim().toUpperCase();
    }

    // Determine target total and available copies to check business rule
    const targetTotal = totalCopies !== undefined ? totalCopies : book.totalCopies;
    const targetAvailable = availableCopies !== undefined ? availableCopies : book.availableCopies;

    if (targetAvailable > targetTotal) {
      return next(new AppError('Available copies cannot exceed total copies', 400));
    }

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();
    if (publicationYear !== undefined) book.publicationYear = publicationYear;
    if (totalCopies !== undefined) book.totalCopies = totalCopies;
    if (availableCopies !== undefined) book.availableCopies = availableCopies;

    const updatedBook = await book.save();

    return sendSuccess(res, 200, 'Book updated successfully', updatedBook);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. DELETE BOOK
 * DELETE /api/v1/books/:id
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await findBookByIdOrCustomId(id);

    if (!book) {
      return next(new AppError(`Book not found with ID '${id}'`, 404));
    }

    await Book.findByIdAndDelete(book._id);

    return sendSuccess(res, 200, 'Book deleted successfully', { id: book._id, bookId: book.bookId });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. SEARCH BOOKS BY TITLE
 * GET /api/v1/books/search/title?query={title}
 */
const searchBooksByTitle = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return next(new AppError('Search query parameter is required and cannot be empty', 400));
    }

    // Case-insensitive regex partial match
    const books = await Book.find({
      title: { $regex: query.trim(), $options: 'i' },
    });

    return sendSuccess(res, 200, `Found ${books.length} book(s) matching title '${query}'`, books, {
      count: books.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. SEARCH BOOKS BY AUTHOR
 * GET /api/v1/books/search/author?query={author}
 */
const searchBooksByAuthor = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return next(new AppError('Search query parameter is required and cannot be empty', 400));
    }

    // Case-insensitive regex partial match
    const books = await Book.find({
      author: { $regex: query.trim(), $options: 'i' },
    });

    return sendSuccess(res, 200, `Found ${books.length} book(s) matching author '${query}'`, books, {
      count: books.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. FILTER BOOKS BY CATEGORY
 * GET /api/v1/books/filter/category?category={category}
 */
const filterBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (!category || category.trim() === '') {
      return next(new AppError('Category query parameter is required and cannot be empty', 400));
    }

    // Case-insensitive match on category
    const books = await Book.find({
      category: { $regex: `^${category.trim()}$`, $options: 'i' },
    });

    return sendSuccess(
      res,
      200,
      `Found ${books.length} book(s) in category '${category}'`,
      books,
      { count: books.length }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooksByTitle,
  searchBooksByAuthor,
  filterBooksByCategory,
};
