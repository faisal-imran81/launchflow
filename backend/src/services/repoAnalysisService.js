import { fetchPackageJson } from "./repoFilesService.js";
import { detectStack } from "../utils/detectStack.js";

export async function analyzeRepo(owner, repo) {
  const packageJson = await fetchPackageJson(owner, repo);
  const stack = detectStack(packageJson);

  return {
    repoName: repo,
    description: packageJson?.description || "",
    hasPackageJson: Boolean(packageJson),
    ...stack,
  };
}
