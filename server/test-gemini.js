require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("This is a test prompt to ensure the API key and model work correctly. Reply with exactly 'TEST SUCCESSFUL'.");
    console.log("Full Result:", JSON.stringify(result, null, 2));
    console.log("Text:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message, e);
  }
}
run();
