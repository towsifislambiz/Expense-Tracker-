import React, { useState } from 'react';
import { Target, Plus, Sparkles } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

export const FinancialGoalsWidget = () => {
  const { goals = [], addGoal, updateGoalProgress } = useExpenses();
  const { formatMoney } = useCurrency();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const safeGoals = Array.isArray(goals) ? goals : [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;
    if (addGoal) {
      addGoal({
        title: newTitle,
        targetAmount: parseFloat(newTarget),
        category: 'Savings',
        color: '#8B5CF6',
      });
    }
    setNewTitle('');
    setNewTarget('');
    setShowAddGoal(false);
  };

  return (
    <div className="card-locked rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Financial Goals</h3>
            <p className="text-xs text-slate-400">Wealth milestone targets</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Create New Goal"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddGoal && (
        <form onSubmit={handleCreate} className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2.5">
          <input
            type="text"
            placeholder="Goal Title (e.g. New Macbook)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg glass-input text-white focus:outline-none focus:border-purple-500"
            required
          />
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Target Amount ($)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input text-white focus:outline-none focus:border-purple-500"
              required
            />
            <Button variant="primary" size="sm" type="submit">
              Save
            </Button>
          </div>
        </form>
      )}

      {safeGoals.length === 0 ? (
        <div className="py-8 text-center text-slate-400 my-auto">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 inline-block mb-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm font-bold text-white">No Financial Goals Yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Start your first savings goal.</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {safeGoals.map((goal) => {
            const targetAmt = Number(goal.targetAmount) || 1;
            const currentAmt = Number(goal.currentAmount) || 0;
            const pct = Math.min(100, (currentAmt / targetAmt) * 100);
            return (
              <div key={goal.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{goal.title}</span>
                  <span className="text-purple-300 font-bold">
                    {formatMoney(currentAmt)} / {formatMoney(targetAmt)}
                  </span>
                </div>
                <ProgressBar progress={pct} color={goal.color || '#8B5CF6'} height="h-2" />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{pct.toFixed(0)}% Achieved</span>
                  <button
                    onClick={() => updateGoalProgress && updateGoalProgress(goal.id, 250)}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                  >
                    + Deposit $250
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
