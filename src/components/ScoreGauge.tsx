'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreGaugeProps {
  scoreBefore: number;
  scoreAfter: number;
  isAnimating?: boolean;
}

export class ScoreGauge extends React.Component<ScoreGaugeProps> {
  getScoreColor(score: number): string {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#84cc16';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  }

  render() {
    const { scoreBefore, scoreAfter, isAnimating } = this.props;
    const beforeColor = this.getScoreColor(scoreBefore);
    const afterColor = this.getScoreColor(scoreAfter);

    return (
      <div className="flex items-center justify-center gap-8 p-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Before</span>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#27272a"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={beforeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={339.292}
                initial={{ strokeDashoffset: 339.292 }}
                animate={{ strokeDashoffset: 339.292 - (339.292 * scoreBefore) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold"
                style={{ color: beforeColor }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {scoreBefore}
              </motion.span>
              <span className="text-xs text-zinc-500">{this.getScoreLabel(scoreBefore)}</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-2xl text-zinc-500"
              >
                →
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {scoreAfter !== scoreBefore && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-zinc-500"
            >
              →
            </motion.div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">After</span>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={afterColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={339.292}
                    initial={{ strokeDashoffset: 339.292 }}
                    animate={{ strokeDashoffset: 339.292 - (339.292 * scoreAfter) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-bold"
                    style={{ color: afterColor }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {scoreAfter}
                  </motion.span>
                  <span className="text-xs text-zinc-500">{this.getScoreLabel(scoreAfter)}</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="ml-4 flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2"
            >
              <span className="text-emerald-400 font-semibold text-lg">
                +{scoreAfter - scoreBefore}
              </span>
              <span className="text-emerald-400/70 text-sm">points</span>
            </motion.div>
          </>
        )}
      </div>
    );
  }
}

export default ScoreGauge;
