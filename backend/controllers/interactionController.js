const Activity = require("../models/Activity");
const User = require("../models/Users");

// Like an activity
const likeActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    // Check if already liked
    const alreadyLiked = user.likedActivities.find(
      (item) => item.activity.toString() === id
    );

    if (!alreadyLiked) {
      user.likedActivities.push({ activity: id, completed: false });
      // Ensure it's removed from disliked if it was there
      user.dislikedActivities = user.dislikedActivities.filter(
        (disId) => disId.toString() !== id
      );
      await user.save();
    }

    res.json({ success: true, likedActivities: user.likedActivities });
  } catch (err) {
    next(err);
  }
};

// Dislike an activity
const dislikeActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    // Add to disliked if not already
    if (!user.dislikedActivities.includes(id)) {
      user.dislikedActivities.push(id);
    }

    // Remove from likedActivities (subdoc array)
    user.likedActivities = user.likedActivities.filter(
      (item) => item.activity.toString() !== id
    );

    await user.save();

    res.json({
      message: "Activity disliked",
      dislikedActivities: user.dislikedActivities,
      likedActivities: user.likedActivities,
    });
  } catch (err) {
    next(err);
  }
};

// Toggle or mark completed
const markCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    const liked = user.likedActivities.find(
      (item) => item.activity.toString() === id
    );

    if (!liked) {
      return res.status(404).json({ error: "Activity not in likes" });
    }

    liked.completed = true;
    await user.save();

    res.json({ success: true, likedActivities: user.likedActivities });
  } catch (err) {
    next(err);
  }
};

module.exports = { likeActivity, dislikeActivity, markCompleted };
