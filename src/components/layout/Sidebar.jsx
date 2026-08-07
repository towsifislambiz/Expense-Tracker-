import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Grid,
  PieChart,
  BarChart3,
  Target,
  Calendar as CalendarIcon,
  CalendarDays,
  Settings,
  Crown,
  LogOut,
  Wallet,
  X,
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily-tracker', label: 'Daily Expense Tracker', icon: CalendarDays },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle },
  { id: 'categories', label: 'Categories', icon: Grid },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isMobileOpen, setIsMobileOpen, onOpenAddModal }) => {
  const { activeTab, setActiveTab } = useExpenses();
  const { logoutUser, displayName, photoURL, currentUser } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavClick = (id) => {
    if (id === 'add-transaction') {
      if (onOpenAddModal) onOpenAddModal();
    } else {
      setActiveTab(id);
    }
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      if (setActiveTab) setActiveTab('dashboard');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between p-5 bg-[#11131f] text-slate-200 select-none">
      <div>
        {/* Logo Section */}
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Expense </span>
              <span className="text-lg font-bold text-indigo-400 tracking-tight">Tracker</span>
            </div>
          </div>
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        {/* User Profile Summary Badge */}
        <div
          onClick={() => setActiveTab('settings')}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center space-x-3 cursor-pointer group"
          title="Account Settings"
        >
          <UserAvatar name={displayName} src={photoURL} size="sm" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate group-hover:text-indigo-300 transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {currentUser?.email || 'Logged In'}
            </span>
          </div>
        </div>

        {/* Go Premium Card */}
        <div className="p-3.5 rounded-2xl bg-[#171929] border border-[#272b45] relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-1.5">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <h4 className="text-xs font-bold text-white">Go Premium</h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
            Unlock all premium features & reports.
          </p>
          <button className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[11px] font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer">
            Upgrade Now
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#11131f] border-r border-[#1e2235] z-30 flex-shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 max-w-[80vw] h-full bg-[#11131f] border-r border-[#1e2235] z-10 overflow-y-auto"
            >
              {SidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};
