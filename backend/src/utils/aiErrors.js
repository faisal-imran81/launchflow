function buildError(message, status) {
  const err = new Error(message);
  err.status = status;
  err.isAiError = true;
  return err;
}

export function toAiError(error) {
  if (error?.isAiError) return error;

  const status = error?.status;
  const code = error?.code ?? error?.error?.code;

  if (status === 429) {
    return buildError("AI rate limit reached. Please try again in a minute.", 429);
  }

  if (status === 401 || status === 403) {
    return buildError("AI service authentication failed. Check GROQ_API_KEY on the server.", 500);
  }

  if (code === "model_not_found" || code === "model_decommissioned") {
    return buildError("The configured AI model is unavailable. Update AI_MODEL on the server.", 500);
  }

  if (!status) {
    return buildError("Could not reach the AI service. Please try again.", 503);
  }

  return buildError("AI generation failed. Please try again.", 502);
}
