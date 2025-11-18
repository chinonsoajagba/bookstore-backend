const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  availableInventory: {
    type: Number,
    required: true,
    default: 0
  },
  icon: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);