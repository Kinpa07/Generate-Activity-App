const mongoose = require("mongoose");

const connectDB = async function start() {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/activity-swipe-app";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB;