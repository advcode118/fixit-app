'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, ExternalLink, GitBranch, FileCode, Check, Loader2, AlertCircle } from 'lucide-react';
import { PRResult } from '@/types';

interface PRCardProps {
  prResult: PRResult | null;
  isCreating: boolean;
  error: string | null;
}

interface PRCardState {}

export class PRCard extends React.Component<PRCardProps, PRCardState> {
  render() {
    const { prResult, isCreating, error } = this.props;

    if (isCreating) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-white">Creating Pull Request...</h3>
              <p className="text-sm text-zinc-400">Committing fixes and opening PR</p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Failed to Create PR</h3>
              <p className="text-sm text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (!prResult?.success) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="p-3 rounded-xl bg-emerald-500/10"
            >
              <GitPullRequest className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">PR Created</span>
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-white">Pull Request Ready</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Your accessibility fixes have been committed and a PR is ready for review.
              </p>
            </div>
          </div>

          <motion.a
            href={prResult.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition-colors"
          >
            View PR
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-zinc-800"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs text-zinc-500 block">Branch</span>
                <span className="text-sm font-mono text-zinc-300 truncate block max-w-[150px]">
                  {prResult.branch}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
              <FileCode className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs text-zinc-500 block">Files Changed</span>
                <span className="text-sm font-medium text-zinc-300">
                  {prResult.filesChanged} files
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
              <Check className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-zinc-500 block">Status</span>
                <span className="text-sm font-medium text-emerald-400">
                  Open
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {prResult.prUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 p-3 rounded-lg bg-zinc-800/30"
          >
            <span className="text-xs text-zinc-500 block mb-1">PR URL</span>
            <a
              href={prResult.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 break-all"
            >
              {prResult.prUrl}
            </a>
          </motion.div>
        )}
      </motion.div>
    );
  }
}

export default PRCard;
