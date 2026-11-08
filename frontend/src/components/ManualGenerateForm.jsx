import { useState } from 'react'

const LIMITS = { repoName: 100, language: 50, framework: 50, description: 500, domain: 253 }

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '13px',
  color: '#f2f2f2',
  outline: 'none',
  transition: 'all 0.15s ease',
}

const warnStyle = {
  ...inputStyle,
  border: '1px solid rgba(245,158,11,0.6)',
}

function LimitedInput({ field, value, onChange, placeholder }) {
  const max = LIMITS[field]
  const over = value.length > max
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        maxLength={max + 20}
        style={{ ...(over ? warnStyle : inputStyle), width: '100%' }}
      />
      {over && (
        <p style={{ color: '#fbbf24', fontSize: '11px' }}>
          Max {max} characters ({value.length - max} over)
        </p>
      )}
    </div>
  )
}

const primaryButton = {
  padding: '9px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  border: '1px solid rgba(82,183,136,0.2)',
  background: 'rgba(82,183,136,0.08)',
  color: '#52b788',
  transition: 'all 0.15s ease',
}

const secondaryButton = {
  padding: '9px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: '#a0a0a8',
  transition: 'all 0.15s ease',
}

export default function ManualGenerateForm({
  onGenerateDockerfile,
  onGenerateActions,
  onGenerateNginx,
  onReset,
  showReset,
  loading,
  busyKind,
}) {
  const [repoInfo, setRepoInfo] = useState({
    repoName: '',
    language: '',
    framework: '',
    description: '',
  })

  const [nginxInfo, setNginxInfo] = useState({
    domain: '',
    port: '',
    type: 'backend',
  })

  const updateField = (field, value) =>
    setRepoInfo((prev) => ({ ...prev, [field]: value }))

  const updateNginxField = (field, value) =>
    setNginxInfo((prev) => ({ ...prev, [field]: value }))

  const hasOverLimit = Object.entries(LIMITS)
    .filter(([key]) => key !== 'domain')
    .some(([key, max]) => (repoInfo[key] || '').length > max)

  const domainOver = (nginxInfo.domain || '').length > LIMITS.domain

  const canGenerate = !loading && repoInfo.repoName.trim() !== '' && !hasOverLimit

  const canGenerateNginx =
    !loading &&
    repoInfo.repoName.trim() !== '' &&
    nginxInfo.domain.trim() !== '' &&
    nginxInfo.port !== '' &&
    !hasOverLimit &&
    !domainOver

  const handleNginxSubmit = () => {
    onGenerateNginx({
      ...repoInfo,
      domain: nginxInfo.domain.trim(),
      port: Number(nginxInfo.port),
      type: nginxInfo.type,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ color: '#a0a0a8', fontSize: '13px', fontWeight: 600 }}>
        ✍️ Or enter details manually
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
        <LimitedInput
          field="repoName"
          value={repoInfo.repoName}
          onChange={updateField}
          placeholder="Repo name *"
        />
        <LimitedInput
          field="language"
          value={repoInfo.language}
          onChange={updateField}
          placeholder="Language (e.g. JavaScript)"
        />
        <LimitedInput
          field="framework"
          value={repoInfo.framework}
          onChange={updateField}
          placeholder="Framework (e.g. React)"
        />
      </div>

      <LimitedInput
        field="description"
        value={repoInfo.description}
        onChange={updateField}
        placeholder="Description (optional — helps the AI generate a better Dockerfile)"
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onGenerateDockerfile(repoInfo)}
          disabled={!canGenerate}
          style={{
            ...primaryButton,
            cursor: !canGenerate ? 'not-allowed' : 'pointer',
            opacity: !canGenerate ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            if (canGenerate) {
              e.currentTarget.style.background = 'rgba(82,183,136,0.14)'
              e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)'
          }}
        >
          {busyKind === 'dockerfile' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            '🐳 Generate Dockerfile'
          )}
        </button>
        <button
          onClick={() => onGenerateActions(repoInfo)}
          disabled={!canGenerate}
          style={{
            ...primaryButton,
            cursor: !canGenerate ? 'not-allowed' : 'pointer',
            opacity: !canGenerate ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            if (canGenerate) {
              e.currentTarget.style.background = 'rgba(82,183,136,0.14)'
              e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)'
          }}
        >
          {busyKind === 'actions' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            '⚙️ Generate GitHub Actions'
          )}
        </button>
        {showReset && (
          <button
            onClick={onReset}
            style={{ ...secondaryButton, cursor: 'pointer' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#f2f2f2'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#a0a0a8'
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4 style={{ color: '#5a5a62', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          🌐 Nginx Config (optional)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <LimitedInput
            field="domain"
            value={nginxInfo.domain}
            onChange={updateNginxField}
            placeholder="Domain (e.g. example.com)"
          />
          <input
            type="number"
            min="1"
            max="65535"
            placeholder="Port (e.g. 3000)"
            value={nginxInfo.port}
            onChange={(e) => updateNginxField('port', e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
          <select
            value={nginxInfo.type}
            onChange={(e) => updateNginxField('type', e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          >
            <option value="backend">Backend</option>
            <option value="frontend">Frontend (static)</option>
            <option value="fullstack">Fullstack</option>
          </select>
        </div>
        <button
          onClick={handleNginxSubmit}
          disabled={!canGenerateNginx}
          style={{
            ...primaryButton,
            alignSelf: 'flex-start',
            cursor: !canGenerateNginx ? 'not-allowed' : 'pointer',
            opacity: !canGenerateNginx ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            if (canGenerateNginx) {
              e.currentTarget.style.background = 'rgba(82,183,136,0.14)'
              e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)'
          }}
        >
          {busyKind === 'nginx' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            '🌐 Generate Nginx Config'
          )}
        </button>
      </div>
    </div>
  )
}
