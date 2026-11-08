// frontend/src/components/LogStreamErrorBoundary.jsx

import { Component } from 'react';

/**
 * Error boundary that wraps LogStreamPanel and DeploymentTimeline.
 * Catches any render-time errors and shows a fallback UI
 * instead of crashing the entire Deploy page.
 */
export default class LogStreamErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, info) {
    // Log error details for debugging without crashing the page
    console.error('[LogStreamErrorBoundary] Caught render error:', error, info);
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: '' });
  }

  render() {
    if (this.state.hasError) {
      return (
      <div
        style={{
          background: 'rgba(229,62,62,0.06)',
          border: '1px solid rgba(229,62,62,0.18)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(229,62,62,0.1)',
            border: '1px solid rgba(229,62,62,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 3 L9 10"
              stroke="#e53e3e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="13.5" r="1.2" fill="#e53e3e"/>
            <circle
              cx="9"
              cy="9"
              r="7.5"
              stroke="#e53e3e"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div>
          <p
            style={{
              color: '#fc8181',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Log stream encountered an error
          </p>
          <p style={{ color: '#5a5a62', fontSize: '12px', lineHeight: '1.5' }}>
            Something went wrong while streaming logs.
          </p>
        </div>

        <button
          onClick={() => this.setState({ hasError: false })}
          style={{
            padding: '7px 18px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid rgba(229,62,62,0.2)',
            background: 'rgba(229,62,62,0.08)',
            color: '#fc8181',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(229,62,62,0.14)';
            e.currentTarget.style.borderColor = 'rgba(229,62,62,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(229,62,62,0.08)';
            e.currentTarget.style.borderColor = 'rgba(229,62,62,0.2)';
          }}
        >
          ↺ Try again
        </button>
      </div>
      );
    }

    return this.props.children;
  }
}
