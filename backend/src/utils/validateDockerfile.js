const VALID_INSTRUCTIONS = new Set([
  "FROM", "RUN", "CMD", "LABEL", "EXPOSE", "ENV", "ADD", "COPY",
  "ENTRYPOINT", "VOLUME", "USER", "WORKDIR", "ARG", "ONBUILD",
  "STOPSIGNAL", "HEALTHCHECK", "SHELL", "MAINTAINER",
]);

const SECRET_ENV = /^ENV\s+\S*(SECRET|PASSWORD|TOKEN|API_KEY)\S*(=|\s)\s*\S+/i;

function toInstructions(text) {
  const instructions = [];
  let current = "";

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;

    if (line.endsWith("\\")) {
      current += `${line.slice(0, -1).trim()} `;
      continue;
    }

    instructions.push(`${current}${line}`.trim());
    current = "";
  }

  if (current.trim()) instructions.push(current.trim());
  return instructions;
}

export function validateDockerfile(text) {
  const errors = [];
  const warnings = [];

  if (typeof text !== "string" || text.trim() === "") {
    return { valid: false, errors: ["Dockerfile is empty"], warnings };
  }

  if (text.includes("```")) {
    return {
      valid: false,
      errors: ["Dockerfile contains markdown code fences"],
      warnings,
    };
  }

  const instructions = toInstructions(text);
  const names = instructions.map((line) => line.split(/\s+/)[0].toUpperCase());

  for (const [index, line] of instructions.entries()) {
    if (!VALID_INSTRUCTIONS.has(names[index])) {
      errors.push(`Unknown instruction: ${line.split(/\s+/)[0]}`);
    }
  }

  const firstReal = names.find((name) => name !== "ARG");
  if (firstReal !== "FROM") {
    errors.push("Dockerfile must start with FROM (only ARG may come before it)");
  }

  const stages = new Set();
  for (const line of instructions) {
    const parts = line.split(/\s+/);
    if (parts[0].toUpperCase() !== "FROM") continue;

    const args = parts.slice(1).filter((part) => !part.startsWith("--"));
    const image = args[0];

    if (!image) {
      errors.push("FROM instruction has no image");
      continue;
    }

    if (image !== "scratch" && !stages.has(image)) {
      const lastSegment = image.split("/").pop();
      if (!lastSegment.includes(":") && !lastSegment.includes("@")) {
        warnings.push(`Base image "${image}" has no version tag`);
      } else if (lastSegment.endsWith(":latest")) {
        warnings.push(`Base image "${image}" uses the latest tag`);
      }
    }

    const asIndex = args.findIndex((part) => part.toUpperCase() === "AS");
    if (asIndex !== -1 && args[asIndex + 1]) stages.add(args[asIndex + 1]);
  }

  if (!names.includes("CMD") && !names.includes("ENTRYPOINT")) {
    warnings.push("No CMD or ENTRYPOINT instruction found");
  }

  if (!names.includes("EXPOSE")) {
    warnings.push("No EXPOSE instruction found");
  }

  if (instructions.some((line) => SECRET_ENV.test(line))) {
    errors.push("Possible hardcoded secret in an ENV instruction");
  }

  return { valid: errors.length === 0, errors, warnings };
}