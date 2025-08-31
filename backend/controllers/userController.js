const Activity = require("../models/Activity");
const User = require("../models/Users");

// Get all liked activities for a user
const getLikedActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("likedActivities");

    res.json(user.likedActivities);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLikedActivities };