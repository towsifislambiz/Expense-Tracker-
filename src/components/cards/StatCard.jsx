import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Clock, PiggyBank } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { Badge } from '../common/Badge';

export const StatCard = ({
  title,
  amount,
  change,
  isPositive = true,
  icon: Icon,
  gradient = 'from-purple-500 to-indigo-600',
  glowColor = 'rgba(139, 92, 246, 0.2)',
  sparklineData = [10, 25, 18, 30, 45, 38, 55],
  badgeText,
}) => {
  const { formatMoney } = useCurrency();

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group"
    >
      {/* Background Radial Glow on Hover */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowColor }}
      />

      <div>
        {/* Top Header: Title & Icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Amount */}
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {formatMoney(amount)}
        </div>
      </div>

      {/* Bottom Section: Trend & Mini Sparkline */}
      <div className="flex items-end justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center space-x-1.5">
          {badgeText ? (
            <Badge variant="warning">{badgeText}</Badge>
          ) : (
            <Badge variant={isPositive ? 'success' : 'danger'}>
              <span className="flex items-center space-x-0.5">
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{change}</span>
              </span>
            </Badge>
          )}
          <span className="text-[11px] text-slate-400 font-medium">vs last period</span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`spark-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.5" />
                <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Smooth Curve Path */}
            <path
              d={`M 0 35 Q 15 20, 30 25 T 60 15 T 100 ${isPositive ? 5 : 35}`}
              fill="none"
              stroke={isPositive ? '#10B981' : '#F43F5E'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
