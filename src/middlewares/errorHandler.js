export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  req.log?.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
}
