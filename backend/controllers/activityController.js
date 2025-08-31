const openai = require("../config/openai");
const Activity = require("../models/Activity");
const User = require("../models/Users");

const generateActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { groupSize, price, type } = req.query;

    // --- Build filter based on user choices
    const dbFilter = {};
    if (groupSize) dbFilter.groupSize = groupSize;
    if (price) dbFilter.price = price;
    if (type) dbFilter.type = type;

    // Exclude already liked or disliked activities
    dbFilter._id = { $nin: [...user.likedActivities, ...user.dislikedActivities] };

    // --- Pick a random activity from DB that matches filters
    let activity = await Activity.aggregate([
      { $match: dbFilter },
      { $sample: { size: 1 } },
    ]);

    activity = activity[0];

    // --- If no activity found, generate a new one
    if (!activity) {
      const prompt = `
      Generate a fun activity for one or more people.
      Respond ONLY in JSON with keys:
      name, description, price ($, $$, $$$), groupSize (1-2, 3-5, 6+), type (indoor/outdoor)
      ${
        groupSize || price || type
          ? `Make sure it matches these filters if possible: 
            groupSize: ${groupSize || "any"}, 
            price: ${price || "any"}, 
            type: ${type || "any"}`
          : ""
      }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const raw = response.choices[0].message.content;
      const cleaned = raw.replace(/^```json\s*/, "").replace(/```$/, "");
      const generatedActivity = JSON.parse(cleaned);

      // --- Prevent duplicate entries (check by name)
      let existing = await Activity.findOne({ name: generatedActivity.name });
      if (!existing) {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `
          A realistic photo of ${
            generatedActivity.groupSize === "1-2"
              ? "one person"
              : generatedActivity.groupSize === "3-5"
              ? "a small group of friends"
              : "a large group"
          } 
          enjoying ${generatedActivity.name}. ${generatedActivity.description}.
          Scene type: ${
            generatedActivity.type === "indoor" ? "indoors" : "outdoors"
          }.
          Natural lighting, cinematic composition, DSLR-quality, highly detailed, vibrant colors.
        `,
          size: "1024x1024",
        });

        generatedActivity.image = imageResponse.data[0].url;

        activity = await Activity.create(generatedActivity);
      } else {
        activity = existing;
      }
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateActivity };