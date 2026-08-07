import React, { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0d14] text-white flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="card-locked max-w-md w-full p-8 text-center space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 inline-block">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unhandled application exception occurred. Don't worry, your data is safely saved in Firestore.
            </p>
            <div className="text-left py-2">
              <details className="bg-slate-900/80 p-3 rounded-xl border border-white/10 text-[11px] text-rose-300 overflow-x-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-300 mb-1">View Error Details</summary>
                <p className="font-mono text-rose-400 font-semibold">{this.state.error?.toString()}</p>
                <pre className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">{this.state.error?.stack}</pre>
              </details>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
