const Activity = require("../models/Activity");
const User = require("../models/Users");

// Get all liked activities for a user
const getLikedActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      completed,
      price,
      groupSize,
      type,
      search,
      sort = "addedAt:desc",
      page = 1,
      limit = 6,
    } = req.query;

    // 1. Get user with liked activities
    const user = await User.findById(userId).populate("likedActivities.activity");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let activities = user.likedActivities;

    // 2. Filtering
    if (completed === "true") {
      activities = activities.filter((a) => a.completed === true);
    } else if (completed === "false") {
      activities = activities.filter((a) => a.completed === false);
    }
    if (price) {
      activities = activities.filter((a) => a.activity?.price === price);
    }
    if (groupSize) {
      activities = activities.filter((a) => a.activity?.groupSize === groupSize);
    }
    if (type) {
      activities = activities.filter((a) => a.activity?.type === type);
    }
    if (search) {
      const regex = new RegExp(search, "i");
      activities = activities.filter((a) => regex.test(a.activity?.name));
    }

    // 3. Sorting
    const [field, direction] = sort.split(":"); // e.g. addedAt:desc
    activities.sort((a, b) => {
      if (field === "addedAt") {
        return direction === "asc"
          ? new Date(a.addedAt) - new Date(b.addedAt)
          : new Date(b.addedAt) - new Date(a.addedAt);
      }
      return 0;
    });

    // 4. Pagination
    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = activities.slice(start, start + parseInt(limit, 10));

    res.json({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages,
      data: paginated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLikedActivities };

