import React from 'react';
import { Wallet, ArrowDown, ArrowUp, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';

const WAVE_PATHS = {
  blue: "M 0 45 C 40 25, 80 55, 120 35 C 160 15, 200 50, 240 35 C 280 20, 320 45, 360 30 L 360 60 L 0 60 Z",
  green: "M 0 48 C 30 25, 70 50, 110 30 C 150 15, 190 45, 230 25 C 270 15, 310 40, 360 25 L 360 60 L 0 60 Z",
  rose: "M 0 35 C 40 55, 80 25, 120 45 C 160 55, 200 25, 240 45 C 280 50, 320 25, 360 40 L 360 60 L 0 60 Z",
  gold: "M 0 40 C 50 20, 90 48, 130 30 C 170 20, 210 50, 250 35 C 290 20, 330 45, 360 25 L 360 60 L 0 60 Z",
};

export const StatCardsGroup = () => {
  const { stats, transactions } = useExpenses();
  const { formatMoney } = useCurrency();

  const isNewUser = !transactions || transactions.length === 0;

  const cardsData = [
    {
      id: 'balance',
      title: 'Current Balance',
      value: formatMoney(stats.totalBalance),
      trend: isNewUser ? 'No financial data' : 'Income − Spent This Month',
      icon: Wallet,
      colorScheme: {
        badgeBg: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
        trendText: 'text-sky-300 font-semibold',
        waveStroke: '#3b82f6',
        glow: 'shadow-blue-500/10',
      },
      waveKey: 'blue',
    },
    {
      id: 'income',
      title: 'Monthly Income',
      value: formatMoney(stats.monthlyIncome),
      trend: isNewUser ? 'No income recorded' : 'Permanent monthly income',
      icon: ArrowDown,
      colorScheme: {
        badgeBg: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
        trendText: 'text-emerald-300 font-semibold',
        waveStroke: '#10b981',
        glow: 'shadow-emerald-500/10',
      },
      waveKey: 'green',
    },
    {
      id: 'expense',
      title: 'Spent This Month',
      value: formatMoney(stats.monthlyExpenses),
      trend: isNewUser ? 'No expenses recorded' : 'Sum of Daily Expenses',
      icon: ArrowUp,
      colorScheme: {
        badgeBg: 'bg-rose-600/20 text-rose-400 border border-rose-500/30',
        trendText: 'text-rose-300 font-semibold',
        waveStroke: '#f43f5e',
        glow: 'shadow-rose-500/10',
      },
      waveKey: 'rose',
    },
    {
      id: 'savings',
      title: 'Net Savings',
      value: formatMoney(stats.netSavings),
      trend: stats.monthlyIncome > 0 ? `↑ ${stats.savingsRate.toFixed(1)}% savings margin` : '0% savings margin',
      icon: PieChart,
      colorScheme: {
        badgeBg: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
        trendText: 'text-amber-300 font-semibold',
        waveStroke: '#f59e0b',
        glow: 'shadow-amber-500/10',
      },
      waveKey: 'gold',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardsData.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
            className={`card-locked relative overflow-hidden p-5 flex flex-col justify-between h-[155px] cursor-pointer ${card.colorScheme.glow}`}
          >
            {/* Top Row: Icon + Title & Value */}
            <div className="flex items-start space-x-3.5 z-20">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.colorScheme.badgeBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  {card.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Subtext Row */}
            <div className="z-20 mt-1 mb-1">
              <span className={`text-xs drop-shadow-md ${card.colorScheme.trendText}`}>
                {card.trend}
              </span>
            </div>

            {/* Bottom Subtle Background Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none overflow-hidden rounded-b-2xl opacity-40">
              <svg className="w-full h-full" viewBox="0 0 360 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={card.colorScheme.waveStroke} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={card.colorScheme.waveStroke} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={WAVE_PATHS[card.waveKey]}
                  fill={`url(#grad-${card.id})`}
                />
                <path
                  d={WAVE_PATHS[card.waveKey].split(" L ")[0]}
                  fill="none"
                  stroke={card.colorScheme.waveStroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
