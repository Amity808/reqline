const express = require("express");
const cors = require("cors");
const reqlineRoutes = require("./routes/reqline");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Reqline parser is running",
    timestamp: Date.now(),
  });
});

// Main reqline endpoint
app.use("/", reqlineRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint not found",
  });
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Reqline parser server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Main endpoint: http://localhost:${PORT}/`);
});

module.exports = app;
