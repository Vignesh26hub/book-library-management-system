const mongoose = require('mongoose');

/**
 * Mongoose Schema representing a Book in the Library Management System.
 * Enforces field validations, data types, indexing, and pre-save hooks.
 */
const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title cannot be empty'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author cannot be empty'],
      trim: true,
      minlength: [1, 'Author cannot be empty'],
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN cannot be empty'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category cannot be empty'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    publicationYear: {
      type: Number,
      required: [true, 'Publication year is required'],
      min: [1000, 'Publication year must be valid and at least 1000'],
      max: [new Date().getFullYear() + 1, 'Publication year cannot be in the distant future'],
      validate: {
        validator: Number.isInteger,
        message: 'Publication year must be an integer',
      },
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [0, 'Total copies cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Total copies must be an integer',
      },
      default: 1,
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Available copies must be an integer',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-validation hook:
 * 1. Automatically sets availableCopies equal to totalCopies if not explicitly set.
 * 2. Enforces the business rule that availableCopies cannot exceed totalCopies.
 * 3. Automatically generates a human-friendly bookId (e.g., 'BK-847291') if not present.
 */
bookSchema.pre('validate', function (next) {
  // If availableCopies is not provided, default it to totalCopies
  if (this.availableCopies === undefined || this.availableCopies === null) {
    this.availableCopies = this.totalCopies;
  }

  // Validate that availableCopies does not exceed totalCopies
  if (this.availableCopies > this.totalCopies) {
    this.invalidate('availableCopies', 'Available copies cannot exceed total copies');
  }

  // Auto-generate bookId if not yet created
  if (!this.bookId) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    this.bookId = `BK-${randomDigits}`;
  }

  next();
});

// Create text index on title and author for fast searching
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ category: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
