import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'A network or server error occurred while fetching information.',
  onRetry,
}) => {
  return (
    <div className="card-locked p-6 bg-rose-500/10 border-rose-500/20 text-center space-y-3">
      <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 inline-block">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-rose-300">{title}</h4>
        <p className="text-xs text-slate-300 mt-0.5">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
