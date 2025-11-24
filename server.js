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

// Sample lesson data (COMPLETE LIST - all 10 lessons)
const lessons = [
{
  _id: "1001",
  title: "Mathematics",
  description: "A full course work of Advanced Mathematics.",
  price: 20.00,
  image: "images/Maths1.jpg", // Make sure this path is correct
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
    message: 'Lessons API is running! (Using local data)',
    endpoints: {
      lessons: '/lessons',
      search: '/lessons/search?q=query',
      orders: '/orders'
    }
  });
});

// GET /lessons - Get all lessons
app.get('/lessons', (req, res) => {
  console.log('Returning', lessons.length, 'lessons');
  res.json(lessons);
});

// GET /lessons/search - Search lessons
app.get('/lessons/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const filteredLessons = lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(q.toLowerCase()) ||
      lesson.description.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json(filteredLessons);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /orders - Create new order
app.post('/orders', (req, res) => {
  try {
    const { name, phone, lessonIDs, quantities, total } = req.body;
    
    // Validate required fields
    if (!name || !phone || !lessonIDs || !quantities || !total) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Create new order
    const order = {
      _id: Date.now().toString(),
      name,
      phone,
      lessonIDs,
      quantities,
      total,
      createdAt: new Date()
    };
    
    orders.push(order);
    
    // Update lesson inventory
    lessonIDs.forEach((lessonId, index) => {
      const lesson = lessons.find(l => l._id === lessonId.toString());
      if (lesson) {
        lesson.availableInventory -= quantities[index] || 1;
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /lessons/:id - Update lesson inventory
app.put('/lessons/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const lessonIndex = lessons.findIndex(lesson => lesson._id === id);
    if (lessonIndex === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // PREVENT NEGATIVE INVENTORY
    if (updates.availableInventory !== undefined && updates.availableInventory < 0) {
      updates.availableInventory = 0;
    }
    
    // Update lesson
    lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates };
    
    res.json(lessons[lessonIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
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
  console.log('  GET  /lessons');
  console.log('  GET  /lessons/search?q=query');
  console.log('  POST /orders');
  console.log('  PUT  /lessons/:id');
  console.log('  GET  /orders (for testing)');
  console.log('Total lessons in database:', lessons.length);
});