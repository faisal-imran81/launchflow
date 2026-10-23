import { useState, useEffect } from "react";
import OutputTabs from "./OutputTabs";
import ErrorAlert from "./ErrorAlert";

function CopyButton({ text }) {
  const [status, setStatus] = useState("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      {status === "copied" ? "✅ Copied!" : status === "failed" ? "❌ Copy failed" : "Copy"}
    </button>
  );
}

function DownloadButton({ text, filename }) {
  function handleDownload() {
    const blob = new Blob([text], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      Download
    </button>
  );
}

function OutputPanel({ title, text, colorClass, filename }) {
  const lineCount = text ? text.split("\n").length : 0;

  return (
    <div className="rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-gray-300 truncate">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 whitespace-nowrap">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton text={text} filename={filename} />
          <CopyButton text={text} />
        </div>
      </div>
      <pre className={`p-4 text-xs sm:text-sm ${colorClass} overflow-x-auto whitespace-pre-wrap`}>
        {text}
      </pre>
    </div>
  );
}

function SetupNote() {
  return (
    <div className="rounded-lg bg-yellow-900/20 border border-yellow-700 px-4 py-3 text-xs text-yellow-300 space-y-1">
      <p className="font-medium">Before using this workflow:</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Save the Dockerfile in your repo root (the workflow builds from it)</li>
        <li>Save the workflow as .github/workflows/ci.yml</li>
        <li>Add DOCKER_USERNAME and DOCKER_PASSWORD in GitHub repo Settings, Secrets and variables, Actions</li>
      </ul>
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
      {detected.startCommand && (
        <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
          start: {detected.startCommand}
        </span>
      )}
    </div>
  );
}

function buildAutoTabs(autoResult, autoWorkflow) {
  const tabs = [];

  if (autoResult) {
    tabs.push({
      id: "dockerfile",
      label: "🐳 Dockerfile",
      title: "🐳 Dockerfile (auto-detected)",
      text: autoResult.dockerfile,
      colorClass: "text-green-400",
      filename: "Dockerfile",
    });
    tabs.push({
      id: "dockerignore",
      label: "🚫 .dockerignore",
      title: "🚫 .dockerignore",
      text: autoResult.dockerignore,
      colorClass: "text-yellow-400",
      filename: ".dockerignore",
    });
  }

  if (autoWorkflow) {
    tabs.push({
      id: "workflow",
      label: "⚙️ Workflow",
      title: "⚙️ GitHub Actions workflow (auto-detected)",
      text: autoWorkflow.yaml,
      colorClass: "text-blue-400",
      filename: "ci.yml",
    });
  }

  return tabs;
}

function EmptyHint() {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-gray-600 px-4 py-6 text-center space-y-1">
      <p className="text-sm text-gray-300">Nothing generated yet</p>
      <p className="text-xs text-gray-500">
        Enter an owner/repo above to get a Dockerfile, .dockerignore and GitHub Actions
        workflow in one click, or fill in the details manually.
      </p>
      <p className="text-xs text-gray-600">Node.js repos with a package.json in the root only, for now.</p>
    </div>
  );
}

function LoadingBanner({ hasPrevious }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">
          {hasPrevious
            ? "AI is generating... previous results shown below"
            : "AI is generating..."}
        </span>
      </div>
    </div>
  );
}

export default function AIOutput({
  dockerfile,
  githubActionsYaml,
  autoResult,
  autoWorkflow,
  loading,
  error,
  onRegenerate,
  onRetry,
  onDismissError,
}) {
  const tabs = buildAutoTabs(autoResult, autoWorkflow);
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id ?? "dockerfile");

  useEffect(() => {
    if (tabs.length > 0) setActiveTab(tabs[0].id);
  }, [autoResult, autoWorkflow]);

  const hasResults = Boolean(
    dockerfile || githubActionsYaml || autoResult || autoWorkflow
  );

  const errorAlert = error ? (
    <ErrorAlert message={error} onDismiss={onDismissError} onRetry={onRetry} />
  ) : null;

  if (!hasResults) {
    if (loading) {
      return (
        <div className="mt-6">
          <LoadingBanner hasPrevious={false} />
        </div>
      );
    }
    if (error) {
      return <div className="mt-6">{errorAlert}</div>;
    }
    return <EmptyHint />;
  }

  const detected = autoResult?.detected || autoWorkflow?.detected;
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="mt-6 space-y-6">
      {errorAlert}

      {loading && <LoadingBanner hasPrevious />}

      <div
        className={`space-y-6 transition-opacity ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {tabs.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DetectedBadges detected={detected} />
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={loading}
                  className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 transition-colors"
                >
                  🔄 Regenerate
                </button>
              )}
            </div>

            <OutputTabs
              tabs={tabs}
              activeId={currentTab?.id}
              onChange={setActiveTab}
            />

            {currentTab && (
              <OutputPanel
                key={currentTab.id}
                title={currentTab.title}
                text={currentTab.text}
                colorClass={currentTab.colorClass}
                filename={currentTab.filename}
              />
            )}

            {currentTab?.id === "workflow" && <SetupNote />}
          </div>
        )}

        {dockerfile && (
          <OutputPanel
            title="🐳 Dockerfile"
            text={dockerfile}
            colorClass="text-green-400"
            filename="Dockerfile"
          />
        )}

        {githubActionsYaml && (
          <OutputPanel
            title="⚙️ GitHub Actions YAML"
            text={githubActionsYaml}
            colorClass="text-blue-400"
            filename="ci.yml"
          />
        )}
      </div>
    </div>
  );
}
