const express = require("express");

const { generateActivity } = require("../controllers/activityController");

const { likeActivity, dislikeActivity } = require("../controllers/interactionController");

const {getLikedActivities} = require("../controllers/userController");


const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, generateActivity);

router.get("/liked", protect, getLikedActivities);

router.put("/like/:id", protect, likeActivity);

router.put("/dislike/:id", protect, dislikeActivity);

module.exports = router;