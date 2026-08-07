import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No data available',
  description = 'Add your first record to populate this view.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="card-locked p-12 text-center text-slate-400">
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 inline-block mb-3 text-indigo-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
