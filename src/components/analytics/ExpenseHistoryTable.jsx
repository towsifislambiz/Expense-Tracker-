import React, { useState, useMemo } from 'react';
import { Search, Trash2, Edit2, Download, FileSpreadsheet } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { exportToCSV, exportFinancialReportPDF } from '../../utils/exportTransactions';

export const ExpenseHistoryTable = ({ onSelectDateForEdit }) => {
  const { dailyExpenseEntries = [], categories } = useExpenses();
  const { formatMoney } = useCurrency();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ensure history contains ONLY actual Daily Expense records from daily_expenses
  const actualTransactions = useMemo(() => {
    return (dailyExpenseEntries || []).filter((t) => Boolean(t && t.date));
  }, [dailyExpenseEntries]);

  // Available Month/Year Options derived dynamically from current month & daily expense data
  const monthOptions = useMemo(() => {
    const set = new Set();
    const now = new Date();

    // Include current month
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    set.add(curKey);

    // Include all months present in saved daily expense records
    actualTransactions.forEach((t) => {
      if (t.date) {
        const cleanStr = String(t.date).split('T')[0];
        const parts = cleanStr.split('-').map(Number);
        if (parts.length >= 2 && !parts.some(isNaN)) {
          const key = `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
          set.add(key);
        }
      }
    });

    return Array.from(set).sort().reverse();
  }, [actualTransactions]);

  const formatMonthLabel = (mKey) => {
    if (mKey === 'all') return 'All Months & Years';
    try {
      const parts = mKey.split('-').map(Number);
      if (parts.length === 2 && !parts.some(isNaN)) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[parts[1] - 1]} ${parts[0]}`;
      }
      return mKey;
    } catch (e) {
      return mKey;
    }
  };

  // Filtered & Searched Ledger List
  const filteredTransactions = useMemo(() => {
    return actualTransactions.filter((t) => {
      // 1. Keyword Search Filter (Title, Notes, Category, Amount)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const titleMatch = String(t.title || t.description || '').toLowerCase().includes(query);
        const notesMatch = String(t.notes || '').toLowerCase().includes(query);
        const catMatch = String(t.category || '').toLowerCase().includes(query);
        const amtMatch = String(t.amount || '').includes(query);

        if (!titleMatch && !notesMatch && !catMatch && !amtMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (String(t.category || '').toLowerCase().trim() !== selectedCategory.toLowerCase().trim()) {
          return false;
        }
      }

      // 3. Type Filter (income / expense)
      if (selectedType !== 'all') {
        if (String(t.type || '').toLowerCase().trim() !== selectedType.toLowerCase().trim()) {
          return false;
        }
      }

      // 4. Month/Year Filter
      if (selectedMonth !== 'all') {
        if (t.date) {
          const cleanStr = String(t.date).split('T')[0];
          const parts = cleanStr.split('-').map(Number);
          if (parts.length >= 2 && !parts.some(isNaN)) {
            const monthKey = `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
            if (monthKey !== selectedMonth) {
              return false;
            }
          }
        } else {
          return false;
        }
      }

      return true;
    });
  }, [actualTransactions, searchTerm, selectedCategory, selectedType, selectedMonth]);

  // Pagination Math
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const categoryNameMap = useMemo(() => {
    const map = {};
    (categories || []).forEach((c) => {
      map[String(c.id).toLowerCase().trim()] = c.name;
    });
    return map;
  }, [categories]);

  // Edit action: open the Daily Expense Editor for that date with data preloaded
  const handleEditClick = (tx) => {
    if (tx.date && onSelectDateForEdit) {
      const dateStr = String(tx.date).split('T')[0];
      onSelectDateForEdit(dateStr);
    }
  };

  return (
    <div className="card-locked p-6 space-y-5">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Expense History & Ledger Audit</h3>
          <p className="text-xs text-slate-400">Search, filter, edit, and export complete transaction history</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportFinancialReportPDF(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Breakfast, Uber, Pizza..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171928] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Selector */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {(categories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="all">All Months & Years</option>
            {monthOptions.map((mKey) => (
              <option key={mKey} value={mKey}>
                {formatMonthLabel(mKey)} ({mKey})
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="all">All Types (Expense Items)</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Title / Items</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  {selectedMonth !== 'all'
                    ? `No daily expenses recorded for ${formatMonthLabel(selectedMonth)}.`
                    : 'No daily expenses recorded. Try adjusting your search filters.'}
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const catKey = String(tx.category || '').toLowerCase().trim();
                const displayCatName = categoryNameMap[catKey] || tx.category || 'General';

                let formattedDate = 'N/A';
                if (tx.date) {
                  const cleanStr = String(tx.date).split('T')[0];
                  const parts = cleanStr.split('-').map(Number);
                  if (parts.length === 3 && !parts.some(isNaN)) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    formattedDate = `${months[parts[1] - 1]} ${parts[2]}, ${parts[0]}`;
                  }
                }

                return (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-300 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <span className="font-bold text-white block truncate">{tx.title || tx.description || 'Expense Item'}</span>
                      {tx.notes && <span className="text-[11px] text-slate-400 block truncate">{tx.notes}</span>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 capitalize">
                        {displayCatName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold whitespace-nowrap text-rose-400">
                      -{formatMoney(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                          title="Edit in Daily Expense Editor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction && deleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredTransactions.length} items)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
