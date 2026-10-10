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

function OutputPanel({ title, text, colorClass }) {
  return (
    <div className="rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">{title}</span>
        <CopyButton text={text} />
      </div>
      <pre className={`p-4 text-sm ${colorClass} overflow-x-auto whitespace-pre-wrap`}>
        {text}
      </pre>
    </div>
  );
}

function DetectedBadges({ detected }) {
  if (!detected) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Detected:</span>
      <span className="text-xs px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700 text-blue-300">
        {detected.framework}
      </span>
      <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
        {detected.type}
      </span>
      {detected.buildOutput && (
        <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
          build: {detected.buildOutput}
        </span>
      )}
      {detected.port && (
        <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
          port: {detected.port}
        </span>
      )}
    </div>
  );
}

export default function AIOutput({
  dockerfile,
  githubActionsYaml,
  autoResult,
  loading,
  error,
}) {
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

  if (!dockerfile && !githubActionsYaml && !autoResult) return null;

  return (
    <div className="mt-6 space-y-6">
      {autoResult && (
        <div className="space-y-4">
          <DetectedBadges detected={autoResult.detected} />
          <OutputPanel
            title="🐳 Dockerfile (auto-detected)"
            text={autoResult.dockerfile}
            colorClass="text-green-400"
          />
          <OutputPanel
            title="🚫 .dockerignore"
            text={autoResult.dockerignore}
            colorClass="text-yellow-400"
          />
        </div>
      )}

      {dockerfile && (
        <OutputPanel
          title="🐳 Dockerfile"
          text={dockerfile}
          colorClass="text-green-400"
        />
      )}

      {githubActionsYaml && (
        <OutputPanel
          title="⚙️ GitHub Actions YAML"
          text={githubActionsYaml}
          colorClass="text-blue-400"
        />
      )}
    </div>
  );
}
