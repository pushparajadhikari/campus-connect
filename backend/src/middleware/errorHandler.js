const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
