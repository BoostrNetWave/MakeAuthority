const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIUsageLog = require("../models/AIUsageLog");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Model priority list (fastest / cheapest first) ─────────────────────────
const MODEL_PRIORITY = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// ── Retry helper ────────────────────────────────────────────────────────────
/**
 * Calls fn() up to `maxAttempts` times with exponential back-off.
 * Retries on 503, 429, or network failures (fetch failed).
 */
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1500) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isRetryable =
        err?.status === 503 ||   // service unavailable / overloaded
        err?.status === 429 ||   // rate limited
        err?.message?.includes("fetch failed") || // network blip
        err?.message?.includes("UNAVAILABLE");

      if (!isRetryable || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 1.5s, 3s, 6s
      console.warn(
        `[Gemini] Attempt ${attempt} failed (${err?.status ?? err?.message?.slice(0, 60)}). ` +
        `Retrying in ${delay}ms…`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ── Model-fallback helper ───────────────────────────────────────────────────
/**
 * Tries each model in MODEL_PRIORITY until one succeeds.
 * Falls back to the next model on 503/network errors.
 */
async function generateWithFallback(prompt) {
  let lastError;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await withRetry(() => model.generateContent(prompt));
      return { result, modelUsed: modelName };
    } catch (err) {
      lastError = err;
      const isOverloaded =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes("fetch failed") ||
        err?.message?.includes("UNAVAILABLE");

      if (!isOverloaded) throw err; // Non-retryable — bail immediately
      console.warn(`[Gemini] Model "${modelName}" unavailable, trying next fallback…`);
    }
  }
  throw lastError;
}

// ── Public helper ───────────────────────────────────────────────────────────
/**
 * Call Gemini and log token usage automatically.
 *
 * @param {string} userId       - The ID of the user making the request.
 * @param {string} functionName - Identifier for the AI tool (e.g. "grant_recommendations").
 * @param {Array}  messages     - Array of { role: 'system'|'user', content: string }.
 * @param {number} maxTokens    - (Kept for legacy compat, ignored in string prompting).
 * @returns {Promise<string>}   The AI-generated response text.
 */
const callGemini = async (userId, functionName, messages, maxTokens = 2000) => {
  try {
    // Convert OpenAI-style messages to a single Gemini prompt string
    let combinedPrompt = "";
    for (const msg of messages) {
      if (msg.role === "system") {
        combinedPrompt += `System Instructions: ${msg.content}\n\n`;
      } else {
        combinedPrompt += `${msg.content}\n\n`;
      }
    }

    const { result, modelUsed } = await generateWithFallback(combinedPrompt);
    const text = result.response.text();

    // Log usage — wrapped in catch so logging never crashes the main flow
    await AIUsageLog.create({
      user:       userId,
      function:   functionName,
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
      cost:       0,
      success:    true,
    }).catch((logErr) =>
      console.warn("[Gemini] Usage log failed (non-fatal):", logErr.message)
    );

    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

module.exports = { callGemini };
