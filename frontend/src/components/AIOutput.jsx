import { useState } from "react";
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

  const isCopied = status === "copied";

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        border: isCopied
          ? "1px solid rgba(82,183,136,0.3)"
          : "1px solid rgba(255,255,255,0.08)",
        background: isCopied
          ? "rgba(82,183,136,0.1)"
          : "rgba(255,255,255,0.04)",
        color: isCopied ? "#74c69d" : "#5a5a62",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => {
        if (!isCopied) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = "#a0a0a8";
        }
      }}
      onMouseLeave={e => {
        if (!isCopied) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#5a5a62";
        }
      }}
    >
      {isCopied ? "Copied!" : status === "failed" ? "Copy failed" : "Copy"}
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
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        color: "#5a5a62",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.color = "#a0a0a8";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.color = "#5a5a62";
      }}
    >
      Download
    </button>
  );
}

function OutputPanel({ title, text, colorClass, filename }) {
  const lineCount = text ? text.split("\n").length : 0;

  return (
    <div
      style={{
        background: "#0c0c0c",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <span style={{ color: "#a0a0a8", fontSize: "12px", fontWeight: 500 }}>{title}</span>
          <span
            style={{
              color: "#5a5a62",
              fontSize: "10px",
              padding: "1px 8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DownloadButton text={text} filename={filename} />
          <CopyButton text={text} />
        </div>
      </div>
      <pre
        className={colorClass}
        style={{
          margin: 0,
          padding: "16px",
          fontSize: "12px",
          lineHeight: "1.7",
          fontFamily: "JetBrains Mono, Fira Code, monospace",
          overflowX: "auto",
          maxHeight: "320px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </pre>
    </div>
  );
}

function SetupNote() {
  return (
    <div
      style={{
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "8px",
        padding: "12px 14px",
        fontSize: "12px",
        color: "#fbbf24",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <p style={{ fontWeight: 600 }}>Before using this workflow:</p>
      <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
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
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#5a5a62", fontSize: "11px" }}>Detected:</span>
      <span
        style={{
          fontSize: "11px",
          padding: "2px 10px",
          borderRadius: "999px",
          background: "rgba(82,183,136,0.1)",
          border: "1px solid rgba(82,183,136,0.2)",
          color: "#74c69d",
        }}
      >
        {detected.framework}
      </span>
      <span
        style={{
          fontSize: "11px",
          padding: "2px 10px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#a0a0a8",
        }}
      >
        {detected.type}
      </span>
      {detected.buildOutput && (
        <span
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#a0a0a8",
          }}
        >
          build: {detected.buildOutput}
        </span>
      )}
      {detected.port && (
        <span
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#a0a0a8",
          }}
        >
          port: {detected.port}
        </span>
      )}
      {detected.startCommand && (
        <span
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#a0a0a8",
          }}
        >
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
      label: "Dockerfile",
      title: "Dockerfile (auto-detected)",
      text: autoResult.dockerfile,
      colorClass: "text-green-400",
      filename: "Dockerfile",
    });
    tabs.push({
      id: "dockerignore",
      label: ".dockerignore",
      title: ".dockerignore",
      text: autoResult.dockerignore,
      colorClass: "text-yellow-400",
      filename: ".dockerignore",
    });
  }

  if (autoWorkflow) {
    tabs.push({
      id: "workflow",
      label: "Workflow",
      title: "GitHub Actions workflow (auto-detected)",
      text: autoWorkflow.yaml,
      colorClass: "text-blue-400",
      filename: "ci.yml",
    });
  }

  return tabs;
}

function EmptyHint() {
  return (
    <div
      style={{
        marginTop: "24px",
        borderRadius: "8px",
        border: "1px dashed rgba(255,255,255,0.12)",
        padding: "24px 16px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <p style={{ color: "#a0a0a8", fontSize: "13px" }}>Nothing generated yet</p>
      <p style={{ color: "#5a5a62", fontSize: "12px" }}>
        Enter an owner/repo above to get a Dockerfile, .dockerignore and GitHub Actions
        workflow in one click, or fill in the details manually.
      </p>
    </div>
  );
}

function LoadingBanner({ hasPrevious }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#a0a0a8" }}>
        <div className="w-4 h-4 border-2 border-[#52b788] border-t-transparent rounded-full animate-spin" />
        <span style={{ fontSize: "13px" }}>
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
  nginxConfig,
  autoResult,
  autoWorkflow,
  loading,
  error,
  onRegenerate,
  onRetry,
  onDismissError,
}) {
  const tabs = buildAutoTabs(autoResult, autoWorkflow);
  const tabsKey = tabs.map((tab) => tab.id).join("|");
  const [selected, setSelected] = useState(() => ({
    key: tabsKey,
    id: tabs[0]?.id ?? "dockerfile",
  }));

  const activeTab =
    selected.key === tabsKey ? selected.id : tabs[0]?.id ?? "dockerfile";
  const handleTabChange = (id) => setSelected({ key: tabsKey, id });

  const hasResults = Boolean(
    dockerfile || githubActionsYaml || nginxConfig || autoResult || autoWorkflow
  );

  const errorAlert = error ? (
    <ErrorAlert message={error} onDismiss={onDismissError} onRetry={onRetry} />
  ) : null;

  if (!hasResults) {
    if (loading) {
      return (
        <div style={{ marginTop: "24px" }}>
          <LoadingBanner hasPrevious={false} />
        </div>
      );
    }
    if (error) {
      return <div style={{ marginTop: "24px" }}>{errorAlert}</div>;
    }
    return <EmptyHint />;
  }

  const detected = autoResult?.detected || autoWorkflow?.detected;
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {errorAlert}

      {loading && <LoadingBanner hasPrevious />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        {tabs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <DetectedBadges detected={detected} />
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={loading}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#a0a0a8",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  Regenerate
                </button>
              )}
            </div>

            <OutputTabs
              tabs={tabs}
              activeId={currentTab?.id}
              onChange={handleTabChange}
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
            title="Dockerfile"
            text={dockerfile}
            colorClass="text-green-400"
            filename="Dockerfile"
          />
        )}

        {githubActionsYaml && (
          <OutputPanel
            title="GitHub Actions YAML"
            text={githubActionsYaml}
            colorClass="text-blue-400"
            filename="ci.yml"
          />
        )}

        {nginxConfig && (
          <OutputPanel
            title="Nginx Config"
            text={nginxConfig}
            colorClass="text-teal-400"
            filename="nginx.conf"
          />
        )}
      </div>
    </div>
  );
}
