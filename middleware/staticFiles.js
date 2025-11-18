const path = require('path');
const fs = require('fs');

// Static file middleware for book images
const staticFiles = (req, res, next) => {
  if (req.url.startsWith('/images/')) {
    const imagePath = path.join(__dirname, '../public', req.url);
    
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: 'Image not found' });
      }
      res.sendFile(imagePath);
    });
  } else {
    next();
  }
};

module.exports = staticFiles;