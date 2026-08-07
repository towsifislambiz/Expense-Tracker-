import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, Bell, Sun, Moon, ChevronDown, Menu } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

export const Header = ({ onOpenMobileSidebar }) => {
  const { searchQuery, setSearchQuery, dateRange, setDateRange } = useExpenses();
  const { theme, toggleTheme } = useTheme();
  const { displayName, photoURL } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const DATE_OPTIONS = [
    { id: 'this-month', label: 'This Month' },
    { id: 'this-week', label: 'This Week' },
    { id: 'all-time', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const activeDateLabel = DATE_OPTIONS.find((o) => o.id === dateRange)?.label || 'This Month';

  // Format display name to Title Case (e.g. "Towsif islam" -> "Towsif Islam")
  const formattedName = (displayName || 'User')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-3 border-b border-white/5">
      {/* Left Greeting Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden w-10 h-10 rounded-xl bg-[#171928] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
              Good Morning, {formattedName} <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
              Track your income, manage your expenses and grow your savings.
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls Group (Pixel-Perfect 40px Height Alignment across all elements) */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3">
        {/* Search Box */}
        <div className="relative flex-1 sm:w-56 md:w-64 h-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-[#171928] border border-white/10 rounded-xl pl-9 pr-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Date Selector Dropdown */}
        <div className="relative h-10">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="h-10 flex items-center space-x-2 bg-[#171928] border border-white/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 hover:border-white/20 transition-all cursor-pointer whitespace-nowrap font-medium"
            aria-expanded={isDatePickerOpen}
            aria-label="Select date range"
          >
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span>{activeDateLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDatePickerOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#171928] border border-white/10 rounded-xl shadow-xl z-50 py-1">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDateRange(opt.id);
                    setIsDatePickerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    dateRange === opt.id
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          className="relative w-10 h-10 rounded-xl bg-[#171928] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#171928]" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-[#171928] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
          <UserAvatar
            name={formattedName}
            src={photoURL}
            size="md"
          />
        </div>
      </div>
    </header>
  );
};
