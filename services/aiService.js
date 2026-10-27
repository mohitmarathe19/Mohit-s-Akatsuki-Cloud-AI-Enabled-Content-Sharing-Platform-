const { getGeminiClient } = require("../config/gemini");
const ApiError = require("../utils/ApiError");

const MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Sends the post to Gemini and returns { title, description, content }.
 */
exports.improvePostContent = async (post, extraInstructions) => {
  const prompt = `You are an expert editor. Improve the following blog post: fix grammar and spelling,
improve clarity, flow and structure, and keep the author's meaning, tone and language.
Do not invent facts. ${extraInstructions ? `Extra instructions from the author: ${extraInstructions}` : ""}

Return ONLY a JSON object with exactly these keys: "title", "description", "content".

TITLE: ${post.title}
DESCRIPTION: ${post.description || ""}
CONTENT:
${post.content}`;

  let text;
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    text = response.text;
  } catch (err) {
    console.error("Gemini error:", err.message);
    throw new ApiError(502, "AI service failed: " + err.message);
  }

  if (!text) throw new ApiError(502, "AI returned an empty response");

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.content) throw new Error("missing content");
    return parsed;
  } catch {
    // fall back: treat whole reply as improved content
    return { content: text.trim() };
  }
};
