import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { parseAuthError } from '../../utils/firebaseErrors';
import { AlertCircle } from 'lucide-react';

const getTodayLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionModal = ({ isOpen, onClose, editData = null }) => {
  const { addTransaction, editTransaction } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(getTodayLocalDateString());
  const [status, setStatus] = useState('completed');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('food');
    setDate(getTodayLocalDateString());
    setStatus('completed');
    setIsRecurring(false);
    setNotes('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setTitle(editData.title || '');
        setAmount(editData.amount !== undefined && editData.amount !== null ? String(editData.amount) : '');
        setType(editData.type || 'expense');
        setCategory(editData.category || (editData.type === 'income' ? 'salary' : 'food'));
        setDate(editData.date || getTodayLocalDateString());
        setStatus(editData.status || 'completed');
        setIsRecurring(!!editData.isRecurring);
        setNotes(editData.notes || editData.note || '');
        setError(null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please enter a transaction title / merchant.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than $0.00.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    const payload = {
      title: cleanTitle,
      amount: numAmount,
      type,
      category,
      date,
      status,
      isRecurring,
      notes: notes.trim(),
    };

    setIsSaving(true);

    try {
      if (editData) {
        await editTransaction(editData.id, payload);
      } else {
        await addTransaction(payload);
      }

      // Successful Firestore write: reset form state and close modal
      resetForm();
      if (onClose) onClose();
    } catch (err) {
      console.error("TransactionModal Submission Error:", err);
      setError(parseAuthError(err));
      // Keep modal open and preserve form inputs on failure
    } finally {
      setIsSaving(false);
    }
  };

  const categoriesList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Modal isOpen={isOpen} onClose={isSaving ? undefined : onClose} title={editData ? 'Edit Transaction' : 'Add New Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-white/10">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setType('expense');
              setCategory('food');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setType('income');
              setCategory('salary');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Merchant</label>
          <input
            type="text"
            required
            disabled={isSaving}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Apple Store, Uber, Salary"
            className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              disabled={isSaving}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              placeholder="0.00"
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              disabled={isSaving}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900 text-white cursor-pointer focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              required
              disabled={isSaving}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={status}
              disabled={isSaving}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900 text-white cursor-pointer focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Recurring Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            disabled={isSaving}
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500/50 cursor-pointer disabled:opacity-50"
          />
          <label htmlFor="isRecurring" className="text-xs text-slate-300 font-medium cursor-pointer">
            Mark as Recurring (Monthly)
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
          <textarea
            rows="2"
            disabled={isSaving}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add memo or receipt tags..."
            className="w-full px-3.5 py-2 text-sm rounded-xl glass-input placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="glass" size="md" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : editData ? (
              'Update Record'
            ) : (
              'Save Transaction'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
