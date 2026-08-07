import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit2,
  Eye,
  Plus,
  CheckSquare,
  Square,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Tv,
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Gift,
  MoreHorizontal,
  X,
  AlertTriangle
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';
import { exportToCSV, exportToPDF } from '../utils/exportTransactions';
import { TransactionDetailsModal } from '../components/transactions/TransactionDetailsModal';
import { TransactionSkeleton } from '../components/transactions/TransactionSkeleton';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';

const ICON_MAP = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: Zap,
  entertainment: Film,
  healthcare: HeartPulse,
  subscriptions: Tv,
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  business: Building,
  gifts: Gift,
  others: MoreHorizontal,
};

export const TransactionsPage = ({ onOpenAddModal, onEditTransaction }) => {
  const {
    transactions,
    loadingTransactions,
    deleteTransaction,
    bulkDeleteTransactions,
    deleteAllTransactions,
    categories,
  } = useExpenses();
  const { formatMoney } = useCurrency();

  // Local Search, Filter, Sort & Selection States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all-time'); // Default to All Time
  const [sortOption, setSortOption] = useState('latest');
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsTransaction, setDetailsTransaction] = useState(null);

  // Delete All Confirmation State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Filtered & Sorted Transactions Dataset (All Firestore Transactions)
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    return transactions
      .filter((t) => {
        // Search Filter (Title, Category, Notes)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const titleMatch = (t.title || '').toLowerCase().includes(q);
          const catMatch = (t.category || '').toLowerCase().includes(q);
          const noteMatch = (t.notes || t.note || '').toLowerCase().includes(q);
          if (!titleMatch && !catMatch && !noteMatch) return false;
        }

        // Type Filter
        if (typeFilter !== 'all') {
          const tType = String(t.type || '').toLowerCase().trim();
          if (tType !== typeFilter) return false;
        }

        // Category Filter
        if (categoryFilter !== 'all') {
          const tCat = String(t.category || '').toLowerCase().trim();
          if (tCat !== categoryFilter.toLowerCase()) return false;
        }

        // Date Filter
        if (dateFilter !== 'all-time' && dateFilter !== 'all') {
          if (!t.date) return false;
          const txDate = new Date(t.date);
          const now = new Date();
          if (isNaN(txDate.getTime())) return false;

          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          if (dateFilter === 'today') {
            const isToday =
              txDate.getDate() === now.getDate() &&
              txDate.getMonth() === currentMonth &&
              txDate.getFullYear() === currentYear;
            if (!isToday) return false;
          } else if (dateFilter === 'this-week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(now);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            if (txDate < startOfWeek) return false;
          } else if (dateFilter === 'this-month') {
            const isThisMonth =
              txDate.getMonth() === currentMonth &&
              txDate.getFullYear() === currentYear;
            if (!isThisMonth) return false;
          } else if (dateFilter === 'last-month') {
            const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const isLastMonth =
              txDate.getMonth() === targetMonth &&
              txDate.getFullYear() === targetYear;
            if (!isLastMonth) return false;
          } else if (dateFilter === 'this-year') {
            if (txDate.getFullYear() !== currentYear) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting Logic
        if (sortOption === 'latest') {
          return new Date(b.date || 0) - new Date(a.date || 0);
        }
        if (sortOption === 'oldest') {
          return new Date(a.date || 0) - new Date(b.date || 0);
        }
        if (sortOption === 'highest-amount') {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        }
        if (sortOption === 'lowest-amount') {
          return (Number(a.amount) || 0) - (Number(b.amount) || 0);
        }
        if (sortOption === 'title-az') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortOption === 'title-za') {
          return (b.title || '').localeCompare(a.title || '');
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, sortOption]);

  // Paginated Subset
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, pageSize);
  }, [filteredTransactions, pageSize]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let incomeCount = 0;
    let expenseCount = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      const typeStr = String(t.type || '').toLowerCase().trim();
      if (typeStr === 'income') {
        incomeCount++;
        totalIncome += amt;
      } else {
        expenseCount++;
        totalExpense += amt;
      }
    });

    return {
      totalCount: filteredTransactions.length,
      incomeCount,
      expenseCount,
      netBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
    };
  }, [filteredTransactions]);

  // Checkbox Handlers
  const isAllSelected =
    visibleTransactions.length > 0 &&
    visibleTransactions.every((t) => selectedIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleTransactions.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await bulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
  };

  // Confirm Delete All Handler
  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllTransactions();
      setSelectedIds([]);
      setIsDeleteAllModalOpen(false);
    } catch (err) {
      console.error("Delete All Execution Error:", err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (loadingTransactions) {
    return <TransactionSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Financial Ledger & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full history of your transactions stored securely in Firestore.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Delete All Transactions Button */}
          {transactions.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
              title="Delete All Transactions"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => exportToPDF(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 hover:border-rose-500/40 text-slate-200 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            title="Export PDF"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-locked p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Transactions</span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {summaryMetrics.totalCount}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1">Filtered result count</span>
        </div>

        <div className="card-locked p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Net Ledger Balance</span>
          <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${summaryMetrics.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatMoney(summaryMetrics.netBalance)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1">Total Net Savings</span>
        </div>

        <div className="card-locked p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Income Records</span>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {formatMoney(summaryMetrics.totalIncome)}
          </h3>
          <span className="text-[11px] text-emerald-400/80 mt-1">{summaryMetrics.incomeCount} transactions</span>
        </div>

        <div className="card-locked p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Expense Records</span>
          <h3 className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {formatMoney(summaryMetrics.totalExpense)}
          </h3>
          <span className="text-[11px] text-rose-400/80 mt-1">{summaryMetrics.expenseCount} transactions</span>
        </div>
      </div>

      {/* Control Bar: Search + Filters + Sort */}
      <div className="card-locked p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, category, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#171928] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="lg:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all-time">All Time (Default)</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-year">This Year</option>
            </select>
          </div>
        </div>

        {/* Second Row: Sort + Bulk Delete */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-3">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-400">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#171928] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-amount">Highest Amount</option>
              <option value="lowest-amount">Lowest Amount</option>
              <option value="title-az">Title A-Z</option>
              <option value="title-za">Title Z-A</option>
            </select>
          </div>

          {/* Bulk Selection Actions */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-xs font-semibold text-purple-300">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Ledger Table (Desktop) / Touch Cards (Mobile) */}
      <div className="card-locked overflow-hidden">
        {visibleTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 inline-block mb-3">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-bold text-white">No matching transactions found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or date range filters to locate transaction records.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171928] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-4 w-10">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white cursor-pointer">
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4">Transaction / Merchant</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleTransactions.map((tx) => {
                    const IconComponent = ICON_MAP[tx.category] || MoreHorizontal;
                    const isIncome = String(tx.type || '').toLowerCase().trim() === 'income';
                    const isSelected = selectedIds.includes(tx.id);

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <button
                            onClick={() => toggleSelectRow(tx.id)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isIncome
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-white block text-sm">
                                {tx.title}
                              </span>
                              {(tx.notes || tx.note) && (
                                <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                  {tx.notes || tx.note}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 capitalize text-slate-300 font-medium">{tx.category || 'Deleted Category'}</td>

                        <td className="p-4 text-slate-300">{formatDate(tx.date)}</td>

                        <td className="p-4">
                          <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                            {tx.status || 'completed'}
                          </Badge>
                        </td>

                        <td className="p-4 text-right">
                          <span
                            className={`font-bold tracking-tight text-sm ${
                              isIncome ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setDetailsTransaction(tx)}
                              title="View Details"
                              className="p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onEditTransaction && onEditTransaction(tx)}
                              title="Edit"
                              className="p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Card Layout */}
            <div className="md:hidden divide-y divide-white/5">
              {visibleTransactions.map((tx) => {
                const IconComponent = ICON_MAP[tx.category] || MoreHorizontal;
                const isIncome = String(tx.type || '').toLowerCase().trim() === 'income';
                const isSelected = selectedIds.includes(tx.id);

                return (
                  <div key={tx.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleSelectRow(tx.id)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{tx.title}</h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {tx.category || 'Deleted Category'} • {formatDate(tx.date)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-extrabold ${
                            isIncome ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                        </div>
                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                          {tx.status || 'completed'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setDetailsTransaction(tx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      <button
                        onClick={() => onEditTransaction && onEditTransaction(tx)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Load More Pagination Bar */}
        {filteredTransactions.length > pageSize && (
          <div className="p-4 bg-[#171928] border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {pageSize} of {filteredTransactions.length} records
            </span>
            <button
              onClick={() => setPageSize((prev) => prev + 20)}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 text-xs font-bold transition-all cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {detailsTransaction && (
        <TransactionDetailsModal
          transaction={detailsTransaction}
          onClose={() => setDetailsTransaction(null)}
          onEdit={(tx) => {
            if (onEditTransaction) onEditTransaction(tx);
          }}
          onDelete={(id) => deleteTransaction(id)}
        />
      )}

      {/* Delete All Transactions Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        title="Delete All Transactions"
        message="This action will permanently remove all your transactions. This cannot be undone."
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        isDanger={true}
        isLoading={isDeletingAll}
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => {
          if (!isDeletingAll) setIsDeleteAllModalOpen(false);
        }}
      />
    </div>
  );
};
