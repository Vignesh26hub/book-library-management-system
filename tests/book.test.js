const request = require('supertest');
const app = require('../app');
const Book = require('../models/Book');

// Mock the Book model so unit tests run fast and reliably in isolation without an external DB
jest.mock('../models/Book');

describe('📚 Book Library Management System API Tests', () => {
  const sampleBook = {
    _id: '673892ab12cdef3456789012',
    bookId: 'BK-100201',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Software Engineering',
    publicationYear: 2008,
    totalCopies: 10,
    availableCopies: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // 1. HEALTH CHECK TEST
  // ===========================================================================
  describe('GET /api/v1/health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('healthy');
    });
  });

  // ===========================================================================
  // 2. CREATE BOOK (POST /api/v1/books)
  // ===========================================================================
  describe('POST /api/v1/books', () => {
    const validBookPayload = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Software Engineering',
      publicationYear: 2008,
      totalCopies: 10,
      availableCopies: 8,
    };

    it('should create a new book and return 201 Created on valid input', async () => {
      Book.findOne.mockResolvedValue(null); // No duplicate ISBN
      Book.create.mockResolvedValue(sampleBook);

      const res = await request(app).post('/api/v1/books').send(validBookPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Clean Code');
      expect(res.body.data.isbn).toBe('978-0132350884');
      expect(Book.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request when title is empty', async () => {
      const invalidPayload = { ...validBookPayload, title: '   ' };

      const res = await request(app).post('/api/v1/books').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.title).toBe('Title cannot be empty');
      expect(Book.create).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when author is empty', async () => {
      const invalidPayload = { ...validBookPayload, author: '' };

      const res = await request(app).post('/api/v1/books').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.author).toBe('Author cannot be empty');
      expect(Book.create).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when publication year is invalid', async () => {
      const invalidPayload = { ...validBookPayload, publicationYear: 800 }; // Year < 1000

      const res = await request(app).post('/api/v1/books').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.publicationYear).toBeDefined();
    });

    it('should return 400 Bad Request when total copies is negative', async () => {
      const invalidPayload = { ...validBookPayload, totalCopies: -5 };

      const res = await request(app).post('/api/v1/books').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.totalCopies).toBe('Total copies cannot be negative and must be an integer');
    });

    it('should return 400 Bad Request when available copies exceed total copies', async () => {
      const invalidPayload = { ...validBookPayload, totalCopies: 5, availableCopies: 10 };

      const res = await request(app).post('/api/v1/books').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.availableCopies).toBe('Available copies cannot exceed total copies');
    });

    it('should return 409 Conflict when ISBN already exists', async () => {
      Book.findOne.mockResolvedValue(sampleBook); // Duplicate ISBN found

      const res = await request(app).post('/api/v1/books').send(validBookPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
      expect(Book.create).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 3. GET ALL BOOKS (GET /api/v1/books)
  // ===========================================================================
  describe('GET /api/v1/books', () => {
    it('should return 200 OK and list of books with pagination metadata', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleBook]),
      };
      Book.find.mockReturnValue(mockQuery);
      Book.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/books?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.page).toBe(1);
    });
  });

  // ===========================================================================
  // 4. GET BOOK BY ID (GET /api/v1/books/:id)
  // ===========================================================================
  describe('GET /api/v1/books/:id', () => {
    it('should return 200 OK when book is found by ID', async () => {
      Book.findById.mockResolvedValue(sampleBook);

      const res = await request(app).get('/api/v1/books/673892ab12cdef3456789012');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Clean Code');
    });

    it('should return 404 Not Found when book does not exist', async () => {
      Book.findById.mockResolvedValue(null);
      Book.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/books/673892ab12cdef3456789999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Book not found');
    });
  });

  // ===========================================================================
  // 5. UPDATE BOOK (PUT /api/v1/books/:id)
  // ===========================================================================
  describe('PUT /api/v1/books/:id', () => {
    it('should return 200 OK and updated book on valid update', async () => {
      const existingBookDoc = {
        ...sampleBook,
        save: jest.fn().mockResolvedValue({
          ...sampleBook,
          title: 'Clean Architecture',
          totalCopies: 15,
        }),
      };
      Book.findById.mockResolvedValue(existingBookDoc);

      const res = await request(app)
        .put('/api/v1/books/673892ab12cdef3456789012')
        .send({ title: 'Clean Architecture', totalCopies: 15 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Clean Architecture');
      expect(existingBookDoc.save).toHaveBeenCalledTimes(1);
    });

    it('should return 404 Not Found when updating a non-existing book', async () => {
      Book.findById.mockResolvedValue(null);
      Book.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/books/673892ab12cdef3456789999')
        .send({ title: 'Non-existing Book' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request when update has availableCopies > totalCopies', async () => {
      const existingBookDoc = {
        ...sampleBook,
        totalCopies: 5,
        availableCopies: 5,
      };
      Book.findById.mockResolvedValue(existingBookDoc);

      const res = await request(app)
        .put('/api/v1/books/673892ab12cdef3456789012')
        .send({ totalCopies: 5, availableCopies: 10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.availableCopies).toBe('Available copies cannot exceed total copies');
    });
  });

  // ===========================================================================
  // 6. DELETE BOOK (DELETE /api/v1/books/:id)
  // ===========================================================================
  describe('DELETE /api/v1/books/:id', () => {
    it('should return 200 OK when book is successfully deleted', async () => {
      Book.findById.mockResolvedValue(sampleBook);
      Book.findByIdAndDelete.mockResolvedValue(sampleBook);

      const res = await request(app).delete('/api/v1/books/673892ab12cdef3456789012');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');
      expect(Book.findByIdAndDelete).toHaveBeenCalledWith(sampleBook._id);
    });

    it('should return 404 Not Found when deleting a non-existent book', async () => {
      Book.findById.mockResolvedValue(null);
      Book.findOne.mockResolvedValue(null);

      const res = await request(app).delete('/api/v1/books/673892ab12cdef3456789999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // 7. SEARCH & FILTER ROUTES
  // ===========================================================================
  describe('Search & Filter Endpoints', () => {
    it('GET /search/title - should return matching books on query', async () => {
      Book.find.mockResolvedValue([sampleBook]);

      const res = await request(app).get('/api/v1/books/search/title?query=Clean');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /search/title - should return 400 Bad Request when query is missing', async () => {
      const res = await request(app).get('/api/v1/books/search/title');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('GET /search/author - should return matching books on query', async () => {
      Book.find.mockResolvedValue([sampleBook]);

      const res = await request(app).get('/api/v1/books/search/author?query=Robert');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /search/author - should return 400 Bad Request when query is missing', async () => {
      const res = await request(app).get('/api/v1/books/search/author');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /filter/category - should return matching books by category', async () => {
      Book.find.mockResolvedValue([sampleBook]);

      const res = await request(app).get('/api/v1/books/filter/category?category=Software Engineering');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /filter/category - should return 400 Bad Request when category is missing', async () => {
      const res = await request(app).get('/api/v1/books/filter/category');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // 8. UNKNOWN ROUTE (404 NOT FOUND)
  // ===========================================================================
  describe('Unknown Route Handling', () => {
    it('should return 404 Not Found for undefined endpoint', async () => {
      const res = await request(app).get('/api/v1/non-existent-route');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot find endpoint');
    });
  });
});
