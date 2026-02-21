// src/lib/gemini.js
// Shared Gemini utility with model fallback support

import { GoogleGenAI } from "@google/genai";

// Model fallback chain: try models in order until one succeeds
const FALLBACK_MODELS = [
    "gemini-3-pro-preview",
    "gemini-2.5-flash",      // Primary - fastest
    "gemini-2.5-pro",        // Fallback 1 - more capable
    "gemini-3-flash-preview",      // Fallback 2 - stable alternative
];

// HTTP status codes that indicate model overload/rate limiting
const RETRYABLE_STATUS_CODES = [429, 503, 500, 502, 504];

// Check if error is retryable (overload, rate limit, etc.)
function isRetryableError(error) {
    const errorMessage = String(error?.message || error).toLowerCase();

    // Check for known overload/rate limit patterns
    if (
        errorMessage.includes("overloaded") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("resource exhausted") ||
        errorMessage.includes("temporarily unavailable") ||
        errorMessage.includes("service unavailable") ||
        errorMessage.includes("too many requests")
    ) {
        return true;
    }

    // Check HTTP status codes
    if (error?.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
        return true;
    }

    return false;
}

// Sleep utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate content with automatic model fallback
 * @param {Object} options - Generation options
 * @param {Array} options.contents - The contents array for Gemini
 * @param {string} [options.preferredModel] - Optional preferred model to try first
 * @param {number} [options.maxRetries=2] - Max retries per model
 * @param {number} [options.baseDelay=1000] - Base delay for exponential backoff in ms
 * @returns {Promise<Object>} - The response from Gemini
 */
export async function generateContentWithFallback({
    contents,
    preferredModel = null,
    maxRetries = 2,
    baseDelay = 1000,
}) {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build model list: preferred model first (if specified), then fallbacks
    const modelsToTry = preferredModel
        ? [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)]
        : FALLBACK_MODELS;

    let lastError = null;

    for (const model of modelsToTry) {
        console.log(`[Gemini] Attempting generation with model: ${model}`);

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await genAI.models.generateContent({
                    model,
                    contents,
                });

                console.log(`[Gemini] Success with model: ${model} (attempt ${attempt + 1})`);
                return { response, model };

            } catch (error) {
                lastError = error;
                console.warn(
                    `[Gemini] Model ${model} failed (attempt ${attempt + 1}/${maxRetries + 1}):`,
                    error?.message || String(error)
                );

                // If it's a retryable error, wait and retry
                if (isRetryableError(error) && attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`[Gemini] Retrying in ${delay}ms...`);
                    await sleep(delay);
                    continue;
                }

                // If not retryable or max retries reached, move to next model
                break;
            }
        }

        console.log(`[Gemini] Model ${model} exhausted retries, trying next model...`);
    }

    // All models failed
    throw new Error(
        `All Gemini models failed. Last error: ${lastError?.message || String(lastError)}`
    );
}

/**
 * Extract text from Gemini response (handles different response formats)
 * @param {Object} response - The response from Gemini
 * @returns {string} - The extracted text
 */
export function extractTextFromResponse(response) {
    let rawText = "";

    if (response.text) {
        rawText = response.text.trim();
    } else if (response.candidates?.length) {
        const part = response.candidates[0].content?.parts?.[0];
        rawText = part?.text?.trim() || "";
    }

    return rawText;
}

/**
 * Clean LLM output - remove markdown fences and common artifacts
 * @param {string} raw - Raw text from LLM
 * @returns {string} - Cleaned text
 */
export function cleanLLMOutput(raw) {
    return raw
        .replace(/```json|```/g, "")
        .replace(/^\s*\n/gm, "")
        .trim();
}

// Export the fallback models list for reference
export { FALLBACK_MODELS };

/**
 * Sanitize backslashes in a JSON string so that lone backslashes
 * (e.g. LaTeX: \cos, \frac, \pi, \sqrt) become valid JSON (\\cos).
 */
export function sanitizeJsonBackslashes(str) {
    return str.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, "\\\\");
}

/**
 * Robustly extract and parse JSON from LLM output.
 * Handles cases where LLM includes conversational text with LaTeX before the JSON block,
 * and handles improperly escaped backslashes.
 * @param {string} text - Raw text from LLM
 * @returns {Object|null} - Parsed JSON object, or null if parsing fails
 */
export function extractFirstJson(text) {
    if (!text || typeof text !== "string") return null;
    let t = text.trim();
    t = t.replace(/^\uFEFF/, "");

    let candidate = "";

    // Attempt 1: Look for markdown code block ```json ... ``` or just ``` ... ```
    const blockMatch = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (blockMatch && blockMatch[1]) {
        candidate = blockMatch[1].trim();
    } else {
        // Attempt 2: Find the first { that is followed by a quote (heuristic for JSON object start)
        const startIdx = t.search(/\{\s*["']/);
        if (startIdx !== -1) {
            const lastIdx = t.lastIndexOf("}");
            if (lastIdx > startIdx) {
                candidate = t.substring(startIdx, lastIdx + 1);
            } else {
                candidate = t.substring(startIdx);
            }
        } else {
            // Fallback
            candidate = t;
        }
    }

    if (!candidate) return null;

    // Phase 1: parse as-is
    try {
        return JSON.parse(candidate);
    } catch { /* fall through */ }

    // Phase 2: sanitize LaTeX / invalid backslashes
    const sanitized = sanitizeJsonBackslashes(candidate);
    try {
        return JSON.parse(sanitized);
    } catch { /* fall through */ }

    // Phase 3: fix unquoted keys + trailing commas + sanitize
    const fixed = sanitized
        .replace(/([^{,:\s]+)\s*:/g, (m, p1) => (p1.startsWith('"') ? m : `"${p1}":`))
        .replace(/,(\s*[}\]])/g, "$1");
    try {
        return JSON.parse(fixed);
    } catch (err) {
        console.warn("extractFirstJson failed to parse candidate JSON.");
        return null;
    }
}
