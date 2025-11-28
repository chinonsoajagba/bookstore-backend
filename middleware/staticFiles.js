const path = require('path');
const fs = require('fs');

// Static image middleware - handles GET /images/:filename
// Streams image file if exists, returns 404 JSON if not found
const staticImage = (req, res, next) => {
  // Only handle /images/ routes
  if (!req.url.startsWith('/images/')) {
    return next();
  }
  
  // Extract filename from URL
  const filename = req.url.replace('/images/', '');
  const imagePath = path.join(__dirname, '../images', filename);
  
  // Check if file exists and stream it
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Stream the file
    const stream = fs.createReadStream(imagePath);
    stream.pipe(res);
  });
};

module.exports = staticImage;