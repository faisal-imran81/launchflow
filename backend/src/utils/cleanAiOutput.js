/**
 * Strips markdown code fences and surrounding chatter from AI-generated text.
 *
 * If the text contains a fenced block (```lang\n...\n```), the content inside
 * the first fence is returned trimmed. Otherwise the whole string is trimmed.
 * Falsy values (null, undefined, empty string) are returned as-is.
 *
 * @param {string | null | undefined} text - Raw AI response text
 * @returns {string | null | undefined} Cleaned text ready for use as a Dockerfile or YAML
 */
export function cleanAiOutput(text) {
  if (!text) return text;

  const fenced = text.match(/```[a-zA-Z]*\r?\n([\s\S]*?)```/);
  if (fenced) {
    return fenced[1].trim();
  }

  return text.trim();
}
