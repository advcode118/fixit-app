'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Zap, Star, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SummaryBarProps {
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    byCategory: {
      accessibility: number;
      seo: number;
      performance: number;
      'best-practices': number;
    };
  };
  fixedCount: number;
}

interface SummaryBarState {}

export class SummaryBar extends React.Component<SummaryBarProps, SummaryBarState> {
  render() {
    const { summary, fixedCount } = this.props;

    const categories = [
      { 
        key: 'accessibility' as const, 
        label: 'Accessibility', 
        icon: Shield, 
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
      },
      { 
        key: 'seo' as const, 
        label: 'SEO', 
        icon: Search, 
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
      },
      { 
        key: 'performance' as const, 
        label: 'Performance', 
        icon: Zap, 
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
      },
      { 
        key: 'best-practices' as const, 
        label: 'Best Practices', 
        icon: Star, 
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
      },
    ];

    const severities = [
      { key: 'critical' as const, label: 'Critical', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
      { key: 'serious' as const, label: 'Serious', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      { key: 'moderate' as const, label: 'Moderate', icon: Info, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      { key: 'minor' as const, label: 'Minor', icon: Info, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border border-zinc-800 ${cat.bgColor} p-4`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-5`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                  <span className="text-xs font-medium text-zinc-400">{cat.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${cat.textColor}`}>
                    {summary.byCategory[cat.key]}
                  </span>
                  <span className="text-zinc-500 text-sm mb-1">issues</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-4 py-2">
            <span className="text-zinc-400 text-sm">Total:</span>
            <span className="text-white font-semibold">{summary.total}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">
            <span className="text-emerald-400 text-sm">Fixed:</span>
            <span className="text-emerald-400 font-semibold">{fixedCount}</span>
          </div>

          <div className="h-6 w-px bg-zinc-700 mx-2" />

          {severities.map((sev, index) => (
            <motion.div
              key={sev.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-center gap-2 rounded-full ${sev.bg} px-3 py-1.5`}
            >
              <sev.icon className={`w-3 h-3 ${sev.color}`} />
              <span className={`${sev.color} text-xs font-medium`}>
                {summary[sev.key]} {sev.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
}

export default SummaryBar;
