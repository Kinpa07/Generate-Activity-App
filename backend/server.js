require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const corsOptions = {
  origin: ["http://localhost:5173"],
};

const app = express();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

