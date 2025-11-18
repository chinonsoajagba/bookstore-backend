// Logger middleware - outputs all requests to console
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

module.exports = logger;