const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Enhanced CORS middleware - allow all origins for now
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Sample book data (COMPLETE LIST - all 10 books)
const books = [
{
  _id: "1001",
  title: "Mathematics",
  description: "A full course work of Advanced Mathematics.",
  price: 20.00,
  image: "images/maths1.jpg", // Make sure this path is correct
  availableInventory: 5,
  icon: "fa-calculator",
  subject: "Math"
},
  {
    _id: "1002",
    title: "English",
    description: "Advanced Level English.",
    price: 10.00,
    image: "images/english2.jpg",
    availableInventory: 5,
    icon: "fa-book",
    subject: "English"
  },
  {
    _id: "1003",
    title: "Computer Science",
    description: "Intro to Computer Science.",
    price: 8.00,
    image: "images/computer.jpg",
    availableInventory: 5,
    icon: "fa-laptop-code",
    subject: "Computer Science"
  },
  {
    _id: "1004",
    title: "International Relations",
    description: "A full study guide on the intro to International Relations.",
    price: 6.00,
    image: "images/inter-rel.jpg",
    availableInventory: 5,
    icon: "fa-globe",
    subject: "Politics"
  },
  {
    _id: "1005",
    title: "Commerce",
    description: "A full study guide to your future of Commerce.",
    price: 5.50,
    image: "images/commerce.jpg",
    availableInventory: 12,
    icon: "fa-chart-line",
    subject: "Business"
  },
  {
    _id: "1006",
    title: "Medicine",
    description: "Beginner to Advanced level courses.",
    price: 12.00,
    image: "images/medicine.jpg",
    availableInventory: 5,
    icon: "fa-stethoscope",
    subject: "Science"
  },
  {
    _id: "1007",
    title: "Engineering",
    description: "Advanced Engineering courses.",
    price: 15.00,
    image: "images/engineering.jpg",
    availableInventory: 5,
    icon: "fa-gears",
    subject: "Engineering"
  },
  {
    _id: "1008",
    title: "Law",
    description: "Brand Law.",
    price: 9.00,
    image: "images/law.jpg",
    availableInventory: 5,
    icon: "fa-gavel",
    subject: "Law"
  },
  {
    _id: "1009",
    title: "Dark Magic",
    description: "Shadow Wizard Money Gang.",
    price: 25.00,
    image: "images/magic.jpg",
    availableInventory: 5,
    icon: "fa-wand-magic-sparkles",
    subject: "Mystical Arts"
  },
  {
    _id: "1010",
    title: "Physics",
    description: "Fundamental principles of Physics.",
    price: 18.00,
    image: "images/physics.jpg",
    availableInventory: 8,
    icon: "fa-atom",
    subject: "Science"
  }
];

// Store orders in memory (for demo purposes)
let orders = [];

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bookstore API is running! (Using local data)',
    endpoints: {
      books: '/books',
      search: '/books/search?q=query',
      orders: '/orders'
    }
  });
});

// GET /books - Get all books
app.get('/books', (req, res) => {
  console.log('Returning', books.length, 'books');
  res.json(books);
});

// GET /books/search - Search books
app.get('/books/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const filteredBooks = books.filter(book => 
      book.title.toLowerCase().includes(q.toLowerCase()) ||
      book.description.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /orders - Create new order
app.post('/orders', (req, res) => {
  try {
    const { name, phone, bookIDs, quantities, total } = req.body;
    
    // Validate required fields
    if (!name || !phone || !bookIDs || !quantities || !total) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Create new order
    const order = {
      _id: Date.now().toString(),
      name,
      phone,
      bookIDs,
      quantities,
      total,
      createdAt: new Date()
    };
    
    orders.push(order);
    
    // Update book inventory
    bookIDs.forEach((bookId, index) => {
      const book = books.find(b => b._id === bookId.toString());
      if (book) {
        book.availableInventory -= quantities[index] || 1;
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /books/:id - Update book inventory
// PUT /books/:id - Update book inventory
app.put('/books/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const bookIndex = books.findIndex(book => book._id === id);
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // PREVENT NEGATIVE INVENTORY
    if (updates.availableInventory !== undefined && updates.availableInventory < 0) {
      updates.availableInventory = 0;
    }
    
    // Update book
    books[bookIndex] = { ...books[bookIndex], ...updates };
    
    res.json(books[bookIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// GET /orders - Get all orders (for testing)
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Using local data)`);
  console.log('Available endpoints:');
  console.log('  GET  /');
  console.log('  GET  /books');
  console.log('  GET  /books/search?q=query');
  console.log('  POST /orders');
  console.log('  PUT  /books/:id');
  console.log('  GET  /orders (for testing)');
  console.log('Total books in database:', books.length);
});