import OpenAI from "openai";

// Groq exposes an OpenAI-compatible endpoint. The key remains server-only and
// is never sent to the browser.
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "missing-groq-api-key",
  baseURL: "https://api.groq.com/openai/v1",
});

export default groqClient;
