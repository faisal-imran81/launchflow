const FENCE = "`".repeat(3);
const TOP_LEVEL_KEY = /^["']?([A-Za-z_][\w-]*)["']?\s*:/;
const SECRET_KEY = /(password|passwd|token|secret|api[_-]?key)/i;

export function validateWorkflow(text) {
  const errors = [];
  const warnings = [];

  if (typeof text !== "string" || text.trim() === "") {
    return { valid: false, errors: ["Workflow is empty"], warnings };
  }

  if (text.includes(FENCE)) {
    return {
      valid: false,
      errors: ["Workflow contains markdown code fences"],
      warnings,
    };
  }

  const lines = text.split(/\r?\n/);

  if (lines.some((line) => /^ *\t/.test(line))) {
    errors.push("Workflow uses tab indentation (YAML requires spaces)");
  }

  const topKeys = new Set();
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed === "---" || trimmed.startsWith("#")) continue;
    if (/^\s/.test(line)) continue;

    const match = line.match(TOP_LEVEL_KEY);
    if (!match) {
      errors.push(`Line ${index + 1} is not valid workflow YAML: ${trimmed.slice(0, 40)}`);
      continue;
    }
    topKeys.add(match[1]);
  }

  if (!topKeys.has("name")) warnings.push('Workflow has no "name"');
  if (!topKeys.has("on")) errors.push('Workflow has no "on" trigger');
  if (!topKeys.has("jobs")) errors.push('Workflow has no "jobs" section');

  const jobs = [];
  const jobsStart = lines.findIndex((line) => /^["']?jobs["']?\s*:/.test(line));
  if (jobsStart !== -1) {
    let jobIndent = null;
    for (const line of lines.slice(jobsStart + 1)) {
      const trimmed = line.trim();
      if (trimmed === "" || trimmed.startsWith("#")) continue;
      if (!/^\s/.test(line)) break;

      const indent = line.match(/^\s*/)[0].length;
      if (jobIndent === null) jobIndent = indent;

      const header = indent === jobIndent ? trimmed.match(/^([\w-]+)\s*:\s*$/) : null;
      if (header) {
        jobs.push({ name: header[1], body: [] });
        continue;
      }
      if (jobs.length > 0) jobs[jobs.length - 1].body.push(line);
    }

    if (jobs.length === 0) errors.push("No jobs defined under jobs");
  }

  for (const job of jobs) {
    const body = job.body.join("\n");
    if (!/^\s+runs-on\s*:/m.test(body)) {
      errors.push(`Job "${job.name}" has no runs-on`);
    }
    if (!/^\s+steps\s*:/m.test(body)) {
      errors.push(`Job "${job.name}" has no steps`);
    }
  }

  for (const line of lines) {
    const match = line.match(/^\s*-?\s*uses\s*:\s*["']?([^\s"'#]+)/);
    if (!match) continue;

    const ref = match[1];
    if (ref.startsWith("./") || ref.startsWith("docker://")) continue;

    if (!ref.includes("@")) {
      warnings.push(`Action "${ref}" has no version`);
    } else if (/@(main|master|latest)$/.test(ref)) {
      warnings.push(`Action "${ref}" is not pinned to a version`);
    }
  }

  if (!/uses\s*:\s*["']?actions\/checkout\b/.test(text)) {
    warnings.push("No actions/checkout step found");
  }

  if (text.includes("docker/build-push-action") && !text.includes("docker/login-action")) {
    warnings.push("Image is built and pushed without docker/login-action");
  }

  for (const line of lines) {
    const match = line.match(/^\s*-?\s*([\w-]+)\s*:\s*(.+?)\s*$/);
    if (!match) continue;

    const [, key, value] = match;
    if (key.toLowerCase() === "secrets" || !SECRET_KEY.test(key)) continue;
    if (value.includes("${{") || value.startsWith("#")) continue;
    if (/^(read|write|none)$/.test(value)) continue;

    errors.push(`Possible hardcoded secret in "${key}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}
