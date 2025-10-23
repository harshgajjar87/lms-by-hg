const express = require('express');
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('addedBy', 'name');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get books by category
router.get('/category/:category', async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.category }).sort({ title: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book details
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add book (admin only)
router.post('/', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    const bookData = { ...req.body, addedBy: req.user._id };
    if (req.file) {
      bookData.image = `/uploads/${req.file.filename}`;
    }
    // Set availableCopies to totalCopies when adding a new book
    bookData.availableCopies = bookData.totalCopies;
    const book = new Book(bookData);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update book (admin only)
router.put('/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete book (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories with limited books (4-5 per category)
router.get('/categories/books', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    const categoriesWithBooks = await Promise.all(
      categories.map(async (category) => {
        const books = await Book.find({ category }).limit(5).sort({ title: 1 });
        return { category, books };
      })
    );
    res.json(categoriesWithBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
