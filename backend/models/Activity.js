const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: String, enum: ["$", "$$", "$$$"], required: true },
    groupSize: { type: String, enum: ["1-2", "3-5", "6+"], required: true },
    type: { type: String, enum: ["indoor", "outdoor"], required: true },
    image: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);