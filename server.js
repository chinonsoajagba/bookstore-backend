require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectToDatabase, getDb } = require('./db');
const logger = require('./middleware/logger');
const staticImage = require('./middleware/staticFiles');

const app = express();

// CORS middleware - allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Custom middleware
app.use(logger);
app.use(staticImage);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lessons API is running!',
    database: 'MongoDB Atlas',
    endpoints: {
      lessons: '/lessons',
      lessonById: '/lessons/:id',
      search: '/search?q=query',
      orders: '/orders',
      images: '/images/:filename'
    }
  });
});

// GET /lessons - Get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const db = getDb();
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /lessons/:id - Get single lesson by ID
app.get('/lessons/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    let query;
    // Try to parse as ObjectId, fallback to string match
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    
    const lesson = await db.collection('lessons').findOne(query);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// PUT /lessons/:id - Update any attribute of a lesson
app.put('/lessons/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent negative spaces
    if (updates.spaces !== undefined && updates.spaces < 0) {
      updates.spaces = 0;
    }
    
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    
    const result = await db.collection('lessons').findOneAndUpdate(
      query,
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// GET /search - Server-side search across subject, location, price, spaces
app.get('/search', async (req, res) => {
  try {
    const db = getDb();
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Case-insensitive regex search across multiple fields
    const searchRegex = { $regex: q, $options: 'i' };
    
    // Try to parse as number for price/spaces search
    const numericValue = parseFloat(q);
    const isNumeric = !isNaN(numericValue);
    
    let searchQuery;
    if (isNumeric) {
      searchQuery = {
        $or: [
          { subject: searchRegex },
          { location: searchRegex },
          { price: numericValue },
          { spaces: numericValue }
        ]
      };
    } else {
      searchQuery = {
        $or: [
          { subject: searchRegex },
          { location: searchRegex }
        ]
      };
    }
    
    const lessons = await db.collection('lessons').find(searchQuery).toArray();
    res.json(lessons);
  } catch (error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /orders - Create new order
app.post('/orders', async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, lessonIDs, numSpaces } = req.body;
    
    // Validate required fields
    if (!name || !phone || !lessonIDs || !numSpaces) {
      return res.status(400).json({ 
        error: 'All fields are required: name, phone, lessonIDs, numSpaces' 
      });
    }
    
    // Create new order document
    const order = {
      name,
      phone,
      lessonIDs,
      numSpaces,
      timestamp: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    res.status(201).json({ 
      ...order, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /orders - Get all orders (for testing/export)
app.get('/orders', async (req, res) => {
  try {
    const db = getDb();
    const orders = await db.collection('orders').find({}).toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Start server with database connection
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Connected to MongoDB Atlas');
      console.log('Available endpoints:');
      console.log('  GET  /');
      console.log('  GET  /lessons');
      console.log('  GET  /lessons/:id');
      console.log('  PUT  /lessons/:id');
      console.log('  GET  /search?q=query');
      console.log('  POST /orders');
      console.log('  GET  /orders');
      console.log('  GET  /images/:filename');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();