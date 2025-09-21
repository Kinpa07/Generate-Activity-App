const openai = require("../config/openai");
const Activity = require("../models/Activity");
const User = require("../models/Users");
const cloudinary = require("../config/cloudinary");

const categories = [
  "Physical / movement (sports, outdoor play, active games)",
  "Creative / artistic (DIY, crafts, photography, cooking, music)",
  "Social / interactive (conversation games, group bonding, teamwork)",
  "Relaxing / mindful (wellness, nature, journaling, meditation)",
  "Discovery / exploration (local community, hidden gems, cultural experiences)",
];

const generateActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { groupSize, price, type } = req.query;

    // --- Build filter
    const dbFilter = {};
    if (groupSize) dbFilter.groupSize = groupSize;
    if (price) dbFilter.price = price;
    if (type) dbFilter.type = type;

    // Exclude already liked/disliked
    const likedIds = user.likedActivities.map((item) => item.activity);
    const dislikedIds = user.dislikedActivities;

    dbFilter._id = { $nin: [...likedIds, ...dislikedIds] };

    // --- Try random existing activity
    let activity = await Activity.aggregate([
      { $match: dbFilter },
      { $sample: { size: 1 } },
    ]);
    activity = activity[0];

    if (activity) return res.json(activity);

    // --- Otherwise generate new one
    let generatedActivity = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      const prompt = `
        Generate a unique and fun activity idea that fits in this category: ${category}.
        It must be realistic and doable in everyday life (no fantasy, sci-fi, or impossible activities).
        Do NOT suggest activities that are too similar to scavenger hunts, photo challenges, mystery boxes, or escape rooms.
        Avoid repeating "challenge", "hunt", "mystery", or "escape" themes.

        Respond ONLY in JSON with keys:
        - name: short catchy title (3–5 words)
        - description: 1–2 engaging sentences
        - price: $, $$, or $$$
        - groupSize: 1-2, 3-5, or 6+
        - type: indoor or outdoor

        ${
          groupSize || price || type
            ? `Match user preferences if possible:
              groupSize: ${groupSize || "any"},
              price: ${price || "any"},
              type: ${type || "any"}`
            : ""
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      });

      const raw = response.choices[0].message.content;
      const cleaned = raw.replace(/^```json\s*/, "").replace(/```$/, "");
      generatedActivity = JSON.parse(cleaned);

      // Check for duplicates by name
      const exists = await Activity.findOne({ name: generatedActivity.name });
      if (!exists) break;
      if (attempt === 2) return res.json(exists); // fallback to existing
    }

    // --- Default fallback image
    let tempUrl =
      "https://images.unsplash.com/photo-1503264116251-35a269479413?w=512&h=512&fit=crop";

    try {
      // Generate image from OpenAI
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `
          A realistic photo of ${
            generatedActivity.groupSize === "1-2"
              ? "one person"
              : generatedActivity.groupSize === "3-5"
              ? "a small group of friends"
              : "a large group"
          } enjoying ${generatedActivity.name}. ${
          generatedActivity.description
        }.
          Scene type: ${
            generatedActivity.type === "indoor" ? "indoors" : "outdoors"
          }.
          Natural lighting, cinematic composition, DSLR-quality, vibrant colors.
        `,
        size: "1024x1024",
      });

      tempUrl = imageResponse.data[0].url;
    } catch (err) {
      console.error("Image generation failed:", err.message);
    }

    // Save immediately with temp URL (fast response)
    const activityDoc = await Activity.create({
      ...generatedActivity,
      image: tempUrl,
    });

    res.json(activityDoc);

    // --- Upload to Cloudinary in background
    (async () => {
      try {
        const upload = await cloudinary.uploader.upload(tempUrl, {
          folder: "pickly/activities",
        });
        activityDoc.image = upload.secure_url;
        await activityDoc.save();
        console.log("Image updated in DB:", upload.secure_url);
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
      }
    })();
  } catch (error) {
    next(error);
  }
};


// Generate a plan for a specific activity
const planActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Prompt for AI planning
    const prompt = `
      Create a detailed step-by-step plan for the following activity:
      - Name: ${activity.name}
      - Description: ${activity.description}

      The plan should include:
      1. Preparation (what to bring/do before starting)
      2. Suggested location/setting
      3. Step-by-step execution
      4. Optional tips for making it more fun
      Keep it realistic, concise, and easy to follow.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const plan = response.choices[0].message.content;

    res.json({ activityId: id, plan });
  } catch (err) {
    next(err);
  }
};


module.exports = { generateActivity, planActivity };
