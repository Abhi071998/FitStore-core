// Catches requests to routes that don't exist.
export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

// Central error handler: logs the error and sends it as a JSON response.
export function errorHandler(err, req, res, next) {
  req.log?.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
}
