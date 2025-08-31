const openai = require("../config/openai");

const generateActivity = async (req, res, next) => {
  try {
    const prompt = `
    Generate a fun activity for one or more people.
    Respond ONLY in JSON with keys:
    name, description, price ($, $$, $$$), groupSize (1-2, 3-5, 6+), type (indoor/outdoor)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    const raw = response.choices[0].message.content;

    const cleaned = raw.replace(/^```json\s*/, "").replace(/```$/, "");

    const activity = JSON.parse(cleaned);

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `
    A realistic photo of ${
      activity.groupSize === "1-2"
        ? "one person"
        : activity.groupSize === "3-5"
        ? "a small group of friends"
        : "a large group"
    } 
    enjoying ${activity.name}. ${activity.description}.
    Scene type: ${activity.type === "indoor" ? "indoors" : "outdoors"}.
    Natural lighting, cinematic composition, DSLR-quality, highly detailed, vibrant colors.
  `,
      size: "1024x1024",
    });

    activity.image = imageResponse.data[0].url;

    res.json(activity);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateActivity };