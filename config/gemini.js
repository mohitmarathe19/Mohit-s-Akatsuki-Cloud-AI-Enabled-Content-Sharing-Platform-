const { GoogleGenAI } = require("@google/genai");

let client;
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not defined");
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

module.exports = { getGeminiClient };
