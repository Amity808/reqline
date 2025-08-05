/**
 * Error handling middleware
 * Catches any unhandled errors and formats them appropriately
 */

function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  // Default error response
  const errorResponse = {
    error: true,
    message: "Internal server error",
  };

  // If in development, include more details
  if (process.env.NODE_ENV === "development") {
    errorResponse.details = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
}

module.exports = errorHandler;
