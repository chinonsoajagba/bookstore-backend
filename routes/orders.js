const express = require('express');
const Order = require('C:\Users\Nonso\Documents\New folder\Blah\Project\backend\models\order.js');
const Book = require('C:\Users\Nonso\Documents\New folder\Blah\Project\backend\routes\books.js');
const router = express.Router();

// POST /orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { name, phone, bookIDs, quantities, total } = req.body;

    // Validate required fields
    if (!name || !phone || !bookIDs || !quantities || !total) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create new order
    const order = new Order({
      name,
      phone,
      bookIDs,
      quantities,
      total
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;