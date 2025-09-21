const mongoose = require("mongoose");

const likedActivitySchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    likedActivities: [likedActivitySchema],
    dislikedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);



module.exports = mongoose.model("User", userSchema);