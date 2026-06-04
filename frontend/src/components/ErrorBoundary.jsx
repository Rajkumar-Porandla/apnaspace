import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-12 p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl text-red-900 dark:text-red-200 shadow-xl">
          <h2 className="text-xl font-black mb-3">⚠️ Something went wrong in the component tree</h2>
          <div className="text-xs font-bold font-mono bg-white dark:bg-slate-900 p-4 rounded-xl border mb-4 whitespace-pre-wrap overflow-x-auto text-red-600">
            {this.state.error?.toString()}
          </div>
          {this.state.errorInfo && (
            <details className="text-xs font-mono whitespace-pre-wrap opacity-80 cursor-pointer">
              <summary className="font-bold mb-2">Click to view component stack trace</summary>
              <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
