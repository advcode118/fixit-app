'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, Code } from 'lucide-react';
import { AccessibilityIssue } from '@/types';

interface IssueCardProps {
  issue: AccessibilityIssue;
  index: number;
  isSelected: boolean;
  onSelect: (issue: AccessibilityIssue) => void;
}

interface IssueCardState {
  isExpanded: boolean;
}

export class IssueCard extends React.Component<IssueCardProps, IssueCardState> {
  constructor(props: IssueCardProps) {
    super(props);
    this.state = { isExpanded: false };
  }

  getSeverityConfig(severity: AccessibilityIssue['severity']) {
    const configs = {
      critical: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'Critical',
      },
      serious: {
        icon: AlertCircle,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        label: 'Serious',
      },
      moderate: {
        icon: Info,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        label: 'Moderate',
      },
      minor: {
        icon: Info,
        color: 'text-zinc-400',
        bg: 'bg-zinc-500/10',
        border: 'border-zinc-500/30',
        label: 'Minor',
      },
    };
    return configs[severity];
  }

  getCategoryColor(category: AccessibilityIssue['category']): string {
    const colors = {
      accessibility: 'text-blue-400 bg-blue-500/10',
      seo: 'text-purple-400 bg-purple-500/10',
      performance: 'text-amber-400 bg-amber-500/10',
      'best-practices': 'text-emerald-400 bg-emerald-500/10',
    };
    return colors[category];
  }

  render() {
    const { issue, index, isSelected, onSelect } = this.props;
    const { isExpanded } = this.state;
    const sevConfig = this.getSeverityConfig(issue.severity);
    const SeverityIcon = sevConfig.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          rounded-xl border transition-all duration-200 cursor-pointer
          ${isSelected 
            ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20' 
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
          }
        `}
        onClick={() => onSelect(issue)}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${sevConfig.bg}`}>
              <SeverityIcon className={`w-4 h-4 ${sevConfig.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${sevConfig.bg} ${sevConfig.color}`}>
                  {sevConfig.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${this.getCategoryColor(issue.category)}`}>
                  {issue.category}
                </span>
                {issue.wcagRule && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-400">
                    {issue.wcagRule}
                  </span>
                )}
                {issue.fix && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Fixed
                  </span>
                )}
              </div>

              <h3 className="text-sm font-medium text-white mb-1">
                {issue.description}
              </h3>
              
              <p className="text-xs text-zinc-500 line-clamp-2">
                {issue.impact}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Code className="w-3 h-3 text-zinc-600" />
                <code className="text-xs text-zinc-500 font-mono truncate max-w-[300px]">
                  {issue.selector}
                </code>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                this.setState(s => ({ isExpanded: !s.isExpanded }));
              }}
              className="p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </motion.div>
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-zinc-800">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Element
                  </span>
                  <pre className="mt-1 p-3 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-300">
                    {issue.element}
                  </pre>
                </div>

                {issue.fix && (
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Fix Applied
                    </span>
                    <p className="mt-1 text-sm text-zinc-400">
                      {issue.fix.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
}

export default IssueCard;
