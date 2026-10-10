export function cleanAiOutput(text) {
  if (!text) return text;

  const fenced = text.match(/```[a-zA-Z]*\r?\n([\s\S]*?)```/);
  if (fenced) {
    return fenced[1].trim();
  }

  return text.trim();
}
