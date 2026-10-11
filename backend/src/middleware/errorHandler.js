export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(error, req, res, next) {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((field) => field.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid note id' });
  }

  if (!error.statusCode) {
    console.error(error);
  }
  res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Something went wrong',
  });
}
