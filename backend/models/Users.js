const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    likedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
    dislikedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
