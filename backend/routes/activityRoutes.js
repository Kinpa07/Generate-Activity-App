const express = require("express");

const { generateActivity } = require("../controllers/activityController");

const router = express.Router();

router.get("/", generateActivity);

module.exports = router;