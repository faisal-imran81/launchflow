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
        <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-6 flex flex-col items-center gap-3">
          <span className="text-3xl select-none">⚠️</span>
          <p className="text-sm font-semibold text-red-300">
            Log stream encountered an error
          </p>
          <p className="text-xs text-red-400 text-center max-w-sm">
            {this.state.errorMessage}
          </p>
          <button
            onClick={() => this.handleReset()}
            className="mt-2 px-4 py-1.5 text-xs rounded-md bg-red-800 hover:bg-red-700 text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
