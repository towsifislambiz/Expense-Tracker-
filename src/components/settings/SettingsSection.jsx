import React from 'react';

export const SettingsSection = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <div className="card-locked p-6 space-y-4">
      {title && (
        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
          {Icon && (
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
