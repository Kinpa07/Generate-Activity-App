const Activity = require("../models/Activity");
const User = require("../models/Users");

// Like an activity
const likeActivity = async (req, res, next) => {
  try {
    const user = req.user; 
    const activityId = req.params.id;


    if (!user.likedActivities.includes(activityId)) {
      user.likedActivities.push(activityId);

      user.dislikedActivities = user.dislikedActivities.filter(
        (id) => id.toString() !== activityId
      );
      await user.save();
    }

    res.json({ message: "Activity liked", likedActivities: user.likedActivities });
  } catch (err) {
    next(err);
  }
};

// Dislike an activity
const dislikeActivity = async (req, res, next) => {
  try {
    const user = req.user;
    const activityId = req.params.id;

    if (!user.dislikedActivities.includes(activityId)) {
      user.dislikedActivities.push(activityId);
      user.likedActivities = user.likedActivities.filter(
        (id) => id.toString() !== activityId
      );
      await user.save();
    }

    res.json({ message: "Activity disliked", dislikedActivities: user.dislikedActivities });
  } catch (err) {
    next(err);
  }
};

module.exports = { likeActivity, dislikeActivity };
