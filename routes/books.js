const express = require('express');
const Book = require('C:\Users\Nonso\Documents\New folder\Blah\Project\backend\models\book.js');
const router = express.Router();

// GET /books - Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /books/search - Search books
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// PUT /books/:id - Update book (for inventory)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findOneAndUpdate(
      { _id: id },
      updates,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

module.exports = router;