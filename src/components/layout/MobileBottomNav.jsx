import React from 'react';
import { LayoutDashboard, Receipt, BarChart3, Target, Settings } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab } = useExpenses();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f111a]/95 border-t border-white/10 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center space-y-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
