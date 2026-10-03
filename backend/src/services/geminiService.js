const { GoogleGenAI } = require("@google/genai");

let client;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("Gemini API key is not configured");
    err.status = 503;
    throw err;
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

async function generateText(prompt) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "";
}

async function embedText(text) {
  const ai = getClient();
  const response = await ai.models.embedContent({
    model: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 }
  });

  const values =
    response?.embeddings?.[0]?.values ||
    response?.embedding?.values ||
    response?.embeddings?.[0];

  if (!Array.isArray(values) || values.length !== 768) {
    throw new Error("Embedding response must contain a 768-dimensional vector");
  }
  return values;
}

module.exports = { generateText, embedText };
