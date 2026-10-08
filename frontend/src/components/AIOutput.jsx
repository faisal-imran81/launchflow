import { useState } from "react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      {copied ? "✅ Copied!" : "Copy"}
    </button>
  );
}

export default function AIOutput({ dockerfile, githubActionsYaml, loading, error }) {
  if (loading) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">AI is generating...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-700">
        <p className="text-red-400 text-sm">❌ {error}</p>
      </div>
    );
  }

  if (!dockerfile && !githubActionsYaml) return null;

  return (
    <div className="mt-6 space-y-6">
      {dockerfile && (
        <div className="rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">🐳 Dockerfile</span>
            <CopyButton text={dockerfile} />
          </div>
          <pre className="p-4 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
            {dockerfile}
          </pre>
        </div>
      )}

      {githubActionsYaml && (
        <div className="rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">⚙️ GitHub Actions YAML</span>
            <CopyButton text={githubActionsYaml} />
          </div>
          <pre className="p-4 text-sm text-blue-400 overflow-x-auto whitespace-pre-wrap">
            {githubActionsYaml}
          </pre>
        </div>
      )}
    </div>
  );
}
