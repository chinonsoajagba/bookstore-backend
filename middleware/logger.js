// Logger middleware - logs method, path, status, response time, and request body
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${duration}ms`
    };
    
    // Log request body for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      logData.body = req.body;
    }
    
    console.log(JSON.stringify(logData));
    originalEnd.apply(res, args);
  };
  
  next();
};

module.exports = logger;