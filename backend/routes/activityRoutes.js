const express = require("express");

const { generateActivity, planActivity } = require("../controllers/activityController");

const { likeActivity, dislikeActivity, markCompleted } = require("../controllers/interactionController");

const {getLikedActivities} = require("../controllers/userController");


const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, generateActivity);

router.get("/liked", protect, getLikedActivities);

router.put("/like/:id", protect, likeActivity);

router.put("/dislike/:id", protect, dislikeActivity);

router.put("/completed/:id", protect, markCompleted);

router.post("/planner/:id", protect, planActivity);


module.exports = router;