function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (res.headersSent) {
    return;
  }

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
