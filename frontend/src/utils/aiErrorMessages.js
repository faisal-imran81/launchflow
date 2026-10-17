const CODE_MESSAGES = {
  "ai/rate-limited": "Too many requests. Please wait a moment and try again.",
  "ai/service-unavailable": "The AI service is temporarily unavailable. Please try again later.",
  "ai/bad-gateway": "The AI provider returned an error. Please try again.",
  "ai/auth-failed": "The AI service is not available right now. Please try again later.",
  "ai/model-unavailable": "The AI model is currently unavailable. Please try again later.",
  "bad-request/invalid-json": "Invalid request data. Please check your input.",
};

const STATUS_MESSAGES = {
  429: CODE_MESSAGES["ai/rate-limited"],
  502: CODE_MESSAGES["ai/bad-gateway"],
  503: CODE_MESSAGES["ai/service-unavailable"],
};

export function getAiErrorMessage(err, fallback) {
  if (!err?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }

  const { data, status } = err.response;

  if (data?.code && CODE_MESSAGES[data.code]) return CODE_MESSAGES[data.code];
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];

  return fallback;
}

export function resolveAiError(err, fallback) {
  return getAiErrorMessage(err, err?.response?.data?.error || fallback);
}
