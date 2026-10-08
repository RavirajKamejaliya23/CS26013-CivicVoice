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
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-6 text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-lg font-black text-2xl font-monumental">
              CV
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold">
                POSTAL TELEGRAPH SYSTEM RECOVERY
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Temporary Dispatch Fault
              </h1>
              <p className="text-xs text-stone-400 leading-relaxed">
                The interface encountered an unexpected render interruption. You can reload the dispatch system or clear the local cache.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-left text-[11px] overflow-x-auto">
                <span className="text-rose-400 font-bold">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Dispatcher</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-stone-700"
              >
                <Home className="w-4 h-4" />
                <span>Clear & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
