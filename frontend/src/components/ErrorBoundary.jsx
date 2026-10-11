import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CivicVoice ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--theme-bg,#FFF9E8)] text-[var(--theme-text-primary,#29261F)] flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-2xl space-y-6 text-center font-sans">
            <div className="w-16 h-16 rounded-2xl bg-[#8A6418] text-white flex items-center justify-center mx-auto shadow-md font-black text-2xl font-monumental">
              CV
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8A6418] font-bold">
                CivicVoice Platform Status
              </div>
              <h1 className="text-2xl font-bold text-[var(--theme-heading,#29261F)] tracking-tight">
                View Couldn't Be Loaded
              </h1>
              <p className="text-xs text-[var(--theme-text-secondary,#625D52)] leading-relaxed">
                Please try again. Your reports and account have not been changed.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3.5 rounded-xl bg-[var(--theme-surface-secondary,#FDF7E7)] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-secondary,#625D52)] text-left text-[11px] font-mono overflow-x-auto">
                <span className="text-rose-600 font-bold">Notice:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-3 rounded-xl bg-[#8A6418] hover:bg-[#735212] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[var(--theme-surface-secondary,#FDF7E7)] text-[var(--theme-text-primary,#29261F)] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-[var(--theme-card-border,#E7DDC5)]"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
