require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are SkyCast AI.

Rules:
- Give clean answers.
- Do NOT use markdown.
- Do NOT use ** or *.
- Use simple bullet points.
- Keep formatting neat.

Question:
${userMessage}
`;

    const result = await model.generateContent(prompt);

    res.json({
      reply: result.response.text(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "AI Error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
