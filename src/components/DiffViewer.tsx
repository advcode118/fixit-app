'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeFix } from '@/types';
import { X, Copy, Check, ArrowRight, SplitSquareHorizontal, AlignJustify } from 'lucide-react';

interface DiffViewerProps {
  fix: CodeFix | null;
  onClose: () => void;
}

interface DiffViewerState {
  viewMode: 'split' | 'unified';
  copied: 'before' | 'after' | null;
}

export class DiffViewer extends React.Component<DiffViewerProps, DiffViewerState> {
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: DiffViewerProps) {
    super(props);
    this.state = { viewMode: 'split', copied: null };
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }

  copyToClipboard(text: string, type: 'before' | 'after') {
    navigator.clipboard.writeText(text);
    this.setState({ copied: type });
    
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    
    this.copyTimeout = setTimeout(() => {
      this.setState({ copied: null });
    }, 2000);
  }

  renderUnifiedDiff(original: string, fixed: string): React.ReactNode {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');

    return (
      <div className="font-mono text-sm">
        {originalLines.map((line, i) => (
          <div
            key={`old-${i}`}
            className="flex items-center bg-red-500/10 border-l-2 border-red-500"
          >
            <span className="w-8 text-right pr-2 text-zinc-600 select-none text-xs">
              {i + 1}
            </span>
            <span className="text-red-400 px-2 select-none">-</span>
            <span className="text-red-300 flex-1 pr-4 whitespace-pre">{line || ' '}</span>
          </div>
        ))}
        {fixedLines.map((line, i) => (
          <div
            key={`new-${i}`}
            className="flex items-center bg-emerald-500/10 border-l-2 border-emerald-500"
          >
            <span className="w-8 text-right pr-2 text-zinc-600 select-none text-xs">
              {i + 1}
            </span>
            <span className="text-emerald-400 px-2 select-none">+</span>
            <span className="text-emerald-300 flex-1 pr-4 whitespace-pre">{line || ' '}</span>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { fix, onClose } = this.props;
    const { viewMode, copied } = this.state;

    if (!fix) return null;

    const customStyle = {
      ...vscDarkPlus,
      'pre[class*="language-"]': {
        ...vscDarkPlus['pre[class*="language-"]'],
        background: 'transparent',
        margin: 0,
        padding: '1rem',
        fontSize: '0.8125rem',
      },
      'code[class*="language-"]': {
        ...vscDarkPlus['code[class*="language-"]'],
        background: 'transparent',
      },
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl max-h-[85vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-white">Code Changes</h3>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-sm font-mono">
                  {fix.file}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-zinc-800/50 p-0.5">
                  <button
                    onClick={() => this.setState({ viewMode: 'split' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      viewMode === 'split' 
                        ? 'bg-zinc-700 text-white' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <SplitSquareHorizontal className="w-4 h-4" />
                    Split
                  </button>
                  <button
                    onClick={() => this.setState({ viewMode: 'unified' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      viewMode === 'unified' 
                        ? 'bg-zinc-700 text-white' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <AlignJustify className="w-4 h-4" />
                    Unified
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <p className="text-sm text-zinc-300">{fix.explanation}</p>
              </div>

              {viewMode === 'split' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-red-500/10 border-b border-zinc-800">
                      <span className="text-sm font-medium text-red-400">Before</span>
                      <button
                        onClick={() => this.copyToClipboard(fix.originalCode, 'before')}
                        className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
                      >
                        {copied === 'before' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-950 overflow-auto max-h-80">
                      <SyntaxHighlighter
                        language="html"
                        style={customStyle}
                        showLineNumbers
                        lineNumberStyle={{ color: '#52525b', fontSize: '0.75rem' }}
                      >
                        {fix.originalCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 border-b border-zinc-800">
                      <span className="text-sm font-medium text-emerald-400">After</span>
                      <button
                        onClick={() => this.copyToClipboard(fix.fixedCode, 'after')}
                        className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
                      >
                        {copied === 'after' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-950 overflow-auto max-h-80">
                      <SyntaxHighlighter
                        language="html"
                        style={customStyle}
                        showLineNumbers
                        lineNumberStyle={{ color: '#52525b', fontSize: '0.75rem' }}
                      >
                        {fix.fixedCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
                  {this.renderUnifiedDiff(fix.originalCode, fix.fixedCode)}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>
                    <span className="text-red-400 font-mono">-{fix.originalCode.split('\n').length}</span> lines removed
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    <span className="text-emerald-400 font-mono">+{fix.fixedCode.split('\n').length}</span> lines added
                  </span>
                </div>
                <button
                  onClick={() => this.copyToClipboard(fix.fixedCode, 'after')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Fixed Code
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
}

export default DiffViewer;
