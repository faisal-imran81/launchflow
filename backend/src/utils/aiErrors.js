function buildError(message, status, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  err.isAiError = true;
  return err;
}

export function toAiError(error) {
  if (error?.isAiError) return error;

  const status = error?.status;
  const code = error?.code ?? error?.error?.code;

  if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
    return buildError(
      'AI generation timed out. Please try again.',
      504,
      'ai/timeout'
    );
  }

  if (status === 429) {
    return buildError("AI rate limit reached. Please try again in a minute.", 429, "ai/rate-limited");
  }

  if (status === 401 || status === 403) {
    console.error("[ai] Authentication failed. Check GROQ_API_KEY on the server.");
    return buildError("The AI service is not available right now. Please try again later.", 500, "ai/auth-failed");
  }

  if (code === "model_not_found" || code === "model_decommissioned") {
    console.error("[ai] Configured model is unavailable. Update AI_MODEL on the server.");
    return buildError("The AI model is currently unavailable. Please try again later.", 500, "ai/model-unavailable");
  }

  if (!status) {
    return buildError("Could not reach the AI service. Please try again.", 503, "ai/service-unavailable");
  }

  return buildError("AI generation failed. Please try again.", 502, "ai/bad-gateway");
}
