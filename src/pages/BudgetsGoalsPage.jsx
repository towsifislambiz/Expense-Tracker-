import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Copy,
  PieChart,
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
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useBudgets } from '../context/BudgetContext';
import { useCurrency } from '../context/CurrencyContext';
import { BudgetModal } from '../components/modals/BudgetModal';
import { BudgetComparisonChart } from '../components/budgets/BudgetComparisonChart';
import { BudgetInsightCard } from '../components/budgets/BudgetInsightCard';
import { BudgetSkeleton } from '../components/budgets/BudgetSkeleton';
import { FinancialGoalsWidget } from '../components/widgets/FinancialGoalsWidget';
import { UpcomingBillsWidget } from '../components/widgets/UpcomingBillsWidget';
import { Badge } from '../components/common/Badge';

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

export const BudgetsGoalsPage = () => {
  const { categoryBreakdown = [], stats = {} } = useExpenses();
  const { budgets = [], loadingBudgets, deleteBudget, duplicateBudget } = useBudgets();
  const { formatMoney } = useCurrency();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeCategoryBreakdown = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  if (loadingBudgets) {
    return <BudgetSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner & Action Button */}
      <div className="card-locked p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
            <Target className="w-6 h-6 text-indigo-400" />
            <span>Budget Management Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track spending thresholds, control limits, and manage monthly budget targets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Budget</span>
          </button>
        </div>
      </div>

      {/* Row 1: Smart Alert Card & Budget Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <BudgetInsightCard budgets={safeBudgets} />
        </div>
        <div className="lg:col-span-7">
          <BudgetComparisonChart budgets={safeBudgets} />
        </div>
      </div>

      {/* Active Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Active Budget Targets ({safeBudgets.length})</h3>
        </div>

        {safeBudgets.length === 0 ? (
          <div className="card-locked p-12 text-center text-slate-400">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 inline-block mb-3">
              <PieChart className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-base font-bold text-white">No Budgets Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first monthly budget to start tracking spending.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safeBudgets.map((b) => {
              let spent = 0;
              let IconComponent = MoreHorizontal;

              if (b.type === 'category') {
                const matchedCat = safeCategoryBreakdown.find(
                  (c) => String(c.id || '').toLowerCase().trim() === String(b.category || '').toLowerCase().trim()
                );
                spent = matchedCat ? Number(matchedCat.spent) || 0 : 0;
                IconComponent = ICON_MAP[b.category] || MoreHorizontal;
              } else {
                spent = Number(stats?.monthlyExpenses) || 0;
                IconComponent = Target;
              }

              const target = Number(b.amount) || 0;
              const remaining = target - spent;
              const actualPct = target > 0 ? (spent / target) * 100 : 0;
              const barPct = Math.min(100, actualPct);

              let statusBadge = { label: 'Normal', variant: 'success' };
              let barGrad = 'from-emerald-500 to-teal-500';

              if (actualPct >= 100) {
                statusBadge = { label: 'Exceeded', variant: 'danger' };
                barGrad = 'from-rose-500 to-pink-500';
              } else if (actualPct >= 85) {
                statusBadge = { label: 'Warning 85%', variant: 'warning' };
                barGrad = 'from-orange-500 to-amber-500';
              } else if (actualPct >= 60) {
                statusBadge = { label: 'Warning 60%', variant: 'warning' };
                barGrad = 'from-amber-500 to-yellow-500';
              }

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-locked p-5 flex flex-col justify-between h-full relative overflow-hidden"
                >
                  <div>
                    {/* Top Row: Icon + Name & Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white truncate max-w-36">{b.name}</h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {b.type === 'category' ? b.category : 'Overall Budget'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </div>

                    {/* Amount Metrics */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-900/50 border border-white/5">
                      <div>
                        <span className="text-slate-400 text-[11px]">Spent This Month / Budget</span>
                        <div className="font-bold text-white mt-0.5">
                          {formatMoney(spent)} / <span className="text-slate-400">{formatMoney(target)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Remaining Budget</span>
                        <div className={`font-bold mt-0.5 ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatMoney(remaining)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400 text-[11px]">Budget Progress</span>
                        <span className="text-white text-[11px]">{actualPct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#171928] rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className={`bg-gradient-to-r ${barGrad} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs">
                    <button
                      onClick={() => duplicateBudget && duplicateBudget(b)}
                      className="text-slate-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Duplicate for next month"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                        title="Edit Budget"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteBudget && deleteBudget(b.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 3: Wealth Goals & Bills Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <FinancialGoalsWidget />
        <UpcomingBillsWidget />
      </div>

      {/* Budget Modal */}
      {isModalOpen && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editData={editingBudget}
        />
      )}
    </div>
  );
};
