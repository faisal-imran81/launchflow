import { useState } from 'react';

function RepoCard({ repo, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(repo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        border: isSelected
          ? '1px solid rgba(82,183,136,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        background: isSelected
          ? 'rgba(82,183,136,0.07)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {/* Repo icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ color: isSelected ? '#52b788' : '#5a5a62', flexShrink: 0 }}
        >
          <path
            d="M2 2.5C2 1.67 2.67 1 3.5 1h9C13.33 1 14 1.67 14 2.5v11a.5.5 0 01-.777.416L8 10.101l-5.223 3.815A.5.5 0 012 13.5v-11z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: isSelected ? '#74c69d' : '#f2f2f2',
              fontSize: '13px',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {repo.name}
          </p>
          {repo.description && (
            <p
              style={{
                color: '#5a5a62',
                fontSize: '11px',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {repo.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Language pill */}
        {repo.language && (
          <span
            style={{
              color: '#5a5a62',
              fontSize: '11px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1px 7px',
              borderRadius: '999px',
              fontWeight: 500,
            }}
          >
            {repo.language}
          </span>
        )}

        {/* Private badge */}
        {repo.private && (
          <span
            style={{
              color: '#f59e0b',
              fontSize: '10px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.15)',
              padding: '1px 7px',
              borderRadius: '999px',
              fontWeight: 600,
            }}
          >
            Private
          </span>
        )}

        {/* Selected check */}
        {isSelected && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" fill="rgba(82,183,136,0.2)" stroke="#52b788" strokeWidth="1.2"/>
            <path d="M4 7 L6.5 9.5 L10 5" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

export default function RepoList({ repos, selected, onSelect }) {
  const [filter, setFilter] = useState('');

  if (!repos?.length) return null;

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Filter input — only show if more than 5 repos */}
      {repos.length > 5 && (
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter repositories..."
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '7px',
            padding: '7px 11px',
            fontSize: '12px',
            color: '#f2f2f2',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(82,183,136,0.35)';
            e.target.style.boxShadow   = '0 0 0 3px rgba(82,183,136,0.07)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.07)';
            e.target.style.boxShadow   = 'none';
          }}
        />
      )}

      {/* List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxHeight: '260px',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {filtered.length === 0 ? (
          <p style={{ color: '#5a5a62', fontSize: '13px', padding: '8px 4px' }}>
            No repositories match your filter.
          </p>
        ) : (
          filtered.map(repo => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={selected?.id === repo.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      {/* Count */}
      <p style={{ color: '#5a5a62', fontSize: '11px', textAlign: 'right' }}>
        {filtered.length} of {repos.length} repositories
      </p>
    </div>
  );
}
