const GITHUB_API = "https://api.github.com";

function buildHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "launchflow",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchPackageJson(owner, repo) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`;
  const response = await fetch(url, { headers: buildHeaders() });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 403 || response.status === 429) {
    const err = new Error("GitHub API rate limit reached. Please try again later.");
    err.status = 429;
    throw err;
  }

  if (!response.ok) {
    const err = new Error("Failed to fetch package.json from GitHub.");
    err.status = 502;
    throw err;
  }

  const data = await response.json();
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");

  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
