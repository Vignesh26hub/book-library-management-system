# 📚 Book Library Management System — Backend REST API

A professional, production-grade Book Library Management System backend built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. Designed as a portfolio showcase project demonstrating clean backend architecture, robust data validation, centralized error handling, and automated testing with **Jest** and **Supertest**.

---

## 📌 Table of Contents
1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [Folder Structure & Architecture](#-folder-structure--architecture)
4. [Environment Configuration & Security](#-environment-configuration--security)
5. [MongoDB Setup Guide](#-mongodb-setup-guide)
6. [Getting Started (Run Locally)](#-getting-started-run-locally)
7. [REST API Documentation](#-rest-api-documentation)
8. [Data Validation & Error Handling](#-data-validation--error-handling)
9. [Automated Testing (Jest & Supertest)](#-automated-testing-jest--supertest)
10. [Postman API Testing Guide](#-postman-api-testing-guide)
11. [GitHub Upload Instructions](#-github-upload-instructions)

---

## ✨ Key Features
- **Book Lifecycle Management**: Full CRUD operations to create, read, update, and delete book records.
- **Auto-Generated Identifiers**: Both MongoDB `_id` and formatted library IDs (`bookId: BK-XXXXXX`).
- **Advanced Querying**:
  - Search books by **Title** (case-insensitive partial matching).
  - Search books by **Author** (case-insensitive partial matching).
  - Filter books by **Category**.
- **Pagination & Sorting**: Query books with `?page=1&limit=10&sort=title`.
- **Strict Business Validation**:
  - Title and Author cannot be empty.
  - ISBN must be strictly unique.
  - Publication year must be a valid 4-digit integer (`1000 <= year <= current year + 1`).
  - Total copies must be non-negative (`>= 0`).
  - Available copies cannot exceed total copies (`availableCopies <= totalCopies`).
- **Centralized Error Handling**: Unified JSON error schema handling Mongoose validation errors, duplicate ISBN conflicts (code `11000`), CastErrors, and operational exceptions.
- **Automated Unit & Integration Testing**: 23 automated test cases with Jest & Supertest.

---

## 🛠 Technology Stack
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | 22.x LTS | Server-side JavaScript runtime |
| **Express.js** | 4.21.x | Web framework for RESTful routing and middleware |
| **MongoDB** | 6.x / 7.x | NoSQL document database |
| **Mongoose** | 8.x | ODM (Object Data Modeling) library for MongoDB |
| **Dotenv** | 16.x | Secure environment variable configuration |
| **Cors & Morgan** | 2.8.x / 1.10.x | Cross-Origin Resource Sharing & HTTP request logging |
| **Jest** | 29.x | JavaScript unit and integration test framework |
| **Supertest** | 7.x | Programmatic HTTP assertion library for Express |
| **Postman** | v2.1.0 | API documentation and manual/automated testing |

---

## 🏛 Folder Structure & Architecture

```
book-library-management-system/
│
├── config/
│   └── db.js                  # MongoDB Mongoose connection handler
│
├── models/
│   └── Book.js                # Mongoose schema, validation rules, pre-save hooks
│
├── controllers/
│   └── bookController.js      # Business logic and database operations (async/await)
│
├── routes/
│   └── bookRoutes.js          # REST API endpoints mapping
│
├── middleware/
│   ├── validateBook.js        # Input validation middleware (create & update)
│   ├── errorHandler.js        # Centralized Express error handler
│   └── notFound.js            # 404 handler for undefined routes
│
├── utils/
│   ├── apiResponse.js         # Uniform JSON success & error response helpers
│   └── appError.js            # Custom operational error class
│
├── tests/
│   └── book.test.js           # 23 automated tests with Jest & Supertest
│
├── postman/
│   └── Book_Library_Management_System.postman_collection.json # Ready-to-import Postman collection
│
├── app.js                     # Express app setup & middleware configuration
├── server.js                  # Entry point (connects DB and starts HTTP server)
├── package.json               # Dependencies and npm scripts
├── .env.example               # Environment variables template
├── .env                       # Local environment variables (ignored by Git)
├── .gitignore                 # Files excluded from version control
└── README.md                  # Complete documentation
```

---

## 🔐 Environment Configuration & Security

**Rule**: Never commit database passwords, connection strings, or secret keys to GitHub.

### Setup Your Environment File
1. Make a copy of `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Configure `.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/library_db
   ```

---

## 🗄 MongoDB Setup Guide

You can connect this project to either a **Local MongoDB instance** or **MongoDB Atlas Cloud (Free Tier)**.

### Option A: MongoDB Atlas Cloud (Recommended & Free)
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `admin`) and set a strong password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. Click **Connect** > **Drivers** > copy the connection string.
6. Paste the connection string into your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/library_db?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB
1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. Use the default connection string in your `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/library_db
   ```

---

## 🚀 Getting Started (Run Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server in Development Mode
```bash
npm run dev
```
*(Uses `nodemon` to automatically restart upon file changes).*

### 3. Start the Server in Production Mode
```bash
npm start
```
The server will start at: `http://localhost:5000`.

---

## 📡 REST API Documentation

### API Summary Table
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | Service health status check | `200 OK` |
| **POST** | `/api/v1/books` | Add a new book to the library | `201 CREATED` |
| **GET** | `/api/v1/books` | Get all books (with pagination & sorting) | `200 OK` |
| **GET** | `/api/v1/books/:id` | Get single book by ID or bookId | `200 OK` / `404` |
| **PUT** | `/api/v1/books/:id` | Update an existing book | `200 OK` / `400` / `404` / `409` |
| **DELETE** | `/api/v1/books/:id` | Delete a book by ID | `200 OK` / `404` |
| **GET** | `/api/v1/books/search/title?query={title}` | Search books by title | `200 OK` |
| **GET** | `/api/v1/books/search/author?query={author}` | Search books by author | `200 OK` |
| **GET** | `/api/v1/books/filter/category?category={cat}` | Filter books by category | `200 OK` |

---

### Detailed Endpoint Examples

#### 1. Add Book
- **URL**: `POST /api/v1/books`
- **Request Body**:
```json
{
  "title": "The Pragmatic Programmer",
  "author": "David Thomas & Andrew Hunt",
  "isbn": "978-0135957059",
  "category": "Software Engineering",
  "publicationYear": 2019,
  "totalCopies": 8,
  "availableCopies": 6
}
```
- **Response** (`201 CREATED`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Book created successfully",
  "data": {
    "bookId": "BK-847291",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas & Andrew Hunt",
    "isbn": "978-0135957059",
    "category": "Software Engineering",
    "publicationYear": 2019,
    "totalCopies": 8,
    "availableCopies": 6,
    "_id": "673892ab12cdef3456789012",
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  }
}
```

---

#### 2. Get All Books
- **URL**: `GET /api/v1/books?page=1&limit=10`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Books retrieved successfully",
  "data": [
    {
      "bookId": "BK-847291",
      "title": "The Pragmatic Programmer",
      "author": "David Thomas & Andrew Hunt",
      "isbn": "978-0135957059",
      "category": "Software Engineering",
      "publicationYear": 2019,
      "totalCopies": 8,
      "availableCopies": 6,
      "_id": "673892ab12cdef3456789012"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "count": 1
  }
}
```

---

#### 3. Get Book By ID
- **URL**: `GET /api/v1/books/673892ab12cdef3456789012` *(or `/api/v1/books/BK-847291`)*
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Book retrieved successfully",
  "data": {
    "_id": "673892ab12cdef3456789012",
    "bookId": "BK-847291",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas & Andrew Hunt",
    "isbn": "978-0135957059",
    "category": "Software Engineering",
    "publicationYear": 2019,
    "totalCopies": 8,
    "availableCopies": 6
  }
}
```

---

#### 4. Update Book
- **URL**: `PUT /api/v1/books/673892ab12cdef3456789012`
- **Request Body**:
```json
{
  "totalCopies": 12,
  "availableCopies": 10
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Book updated successfully",
  "data": {
    "_id": "673892ab12cdef3456789012",
    "bookId": "BK-847291",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas & Andrew Hunt",
    "isbn": "978-0135957059",
    "category": "Software Engineering",
    "publicationYear": 2019,
    "totalCopies": 12,
    "availableCopies": 10
  }
}
```

---

#### 5. Delete Book
- **URL**: `DELETE /api/v1/books/673892ab12cdef3456789012`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Book deleted successfully",
  "data": {
    "id": "673892ab12cdef3456789012",
    "bookId": "BK-847291"
  }
}
```

---

#### 6. Search Books By Title
- **URL**: `GET /api/v1/books/search/title?query=Pragmatic`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Found 1 book(s) matching title 'Pragmatic'",
  "data": [ ... ],
  "meta": { "count": 1 }
}
```

---

#### 7. Filter Books By Category
- **URL**: `GET /api/v1/books/filter/category?category=Software Engineering`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Found 1 book(s) in category 'Software Engineering'",
  "data": [ ... ],
  "meta": { "count": 1 }
}
```

---

## 🛡 Data Validation & Error Handling

All incoming requests are validated by `validateBook.js` middleware before reaching the controller.

### Validation Rules
| Field | Rules | Example Invalid Value | Error Response |
| :--- | :--- | :--- | :--- |
| `title` | Required, non-empty string | `""` | `"Title cannot be empty"` |
| `author` | Required, non-empty string | `""` | `"Author cannot be empty"` |
| `isbn` | Required, unique string | duplicate ISBN | `"A book with ISBN '...' already exists."` |
| `publicationYear`| Integer between `1000` and current year + 1 | `850` | `"Publication year must be an integer between 1000 and 2027"` |
| `totalCopies` | Required, integer `>= 0` | `-1` | `"Total copies cannot be negative and must be an integer"` |
| `availableCopies`| Integer `>= 0`, cannot exceed `totalCopies` | `totalCopies: 5, availableCopies: 10` | `"Available copies cannot exceed total copies"` |

### Sample Validation Error Response (`400 BAD REQUEST`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed for one or more fields",
  "errors": {
    "title": "Title cannot be empty",
    "totalCopies": "Total copies cannot be negative and must be an integer",
    "availableCopies": "Available copies cannot exceed total copies"
  }
}
```

### Sample Duplicate ISBN Error Response (`409 CONFLICT`)
```json
{
  "success": false,
  "statusCode": 409,
  "message": "A book with ISBN '978-0135957059' already exists."
}
```

---

## 🧪 Automated Testing (Jest & Supertest)

The project includes **23 automated tests** covering all positive and negative test cases.

### Run Tests
```bash
npm test
```

### Verified Test Results
```text
PASS tests/book.test.js
  📚 Book Library Management System API Tests
    GET /api/v1/health
      √ should return 200 OK and health status (99 ms)
    POST /api/v1/books
      √ should create a new book and return 201 Created on valid input (41 ms)
      √ should return 400 Bad Request when title is empty (20 ms)
      √ should return 400 Bad Request when author is empty (12 ms)
      √ should return 400 Bad Request when publication year is invalid (16 ms)
      √ should return 400 Bad Request when total copies is negative (15 ms)
      √ should return 400 Bad Request when available copies exceed total copies (15 ms)
      √ should return 409 Conflict when ISBN already exists (14 ms)
    GET /api/v1/books
      √ should return 200 OK and list of books with pagination metadata (22 ms)
    GET /api/v1/books/:id
      √ should return 200 OK when book is found by ID (17 ms)
      √ should return 404 Not Found when book does not exist (13 ms)
    PUT /api/v1/books/:id
      √ should return 200 OK and updated book on valid update (13 ms)
      √ should return 404 Not Found when updating a non-existing book (16 ms)
      √ should return 400 Bad Request when update has availableCopies > totalCopies (17 ms)
    DELETE /api/v1/books/:id
      √ should return 200 OK when book is successfully deleted (21 ms)
      √ should return 404 Not Found when deleting a non-existent book (21 ms)
    Search & Filter Endpoints
      √ GET /search/title - should return matching books on query (15 ms)
      √ GET /search/title - should return 400 Bad Request when query is missing (13 ms)
      √ GET /search/author - should return matching books on query (15 ms)
      √ GET /search/author - should return 400 Bad Request when query is missing (13 ms)
      √ GET /filter/category - should return matching books by category (10 ms)
      √ GET /filter/category - should return 400 Bad Request when category is missing (11 ms)
    Unknown Route Handling
      √ should return 404 Not Found for undefined endpoint (12 ms)

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        2.608 s
```

---

## 📮 Postman API Testing Guide

A ready-to-use Postman collection is located at:
`postman/Book_Library_Management_System.postman_collection.json`

### How to Import & Use in Postman
1. Open **Postman**.
2. Click **Import** > Select the file `postman/Book_Library_Management_System.postman_collection.json`.
3. The collection will import with the preconfigured variable:
   - `baseUrl`: `http://localhost:5000/api/v1/books`
4. Start your server with `npm start` and test every endpoint in sequence!

---

## 🐙 GitHub Upload Instructions

Push this project to your GitHub account with these simple steps:

1. **Create an empty repository on GitHub**:
   - Go to [https://github.com/new](https://github.com/new).
   - Name: `book-library-management-system`.
   - Set to **Public**.
   - Do NOT initialize with README, .gitignore, or license.
   - Click **Create repository**.

2. **Open your terminal in this project folder**:
   ```powershell
   cd "C:\Users\Vignesh\.gemini\antigravity\scratch\book-library-management-system"
   ```

3. **Initialize Git, commit, and push**:
   ```powershell
   git init
   git branch -M main
   git add .
   git commit -m "Initial commit: Book Library Management System backend"
   git remote add origin https://github.com/Vignesh26hub/book-library-management-system.git
   git push -u origin main
   ```
*(Replace `Vignesh26hub` with your GitHub username if different).*
