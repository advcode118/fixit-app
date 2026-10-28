'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { diffLines } from 'diff';
import { CodeFix } from '@/types';

export type DiffThemeName = 'phosphor' | 'folio' | 'orbit' | 'stamp' | 'keynote';

interface CodeDiffProps {
  fix: CodeFix;
  theme: DiffThemeName;
  onClose: () => void;
}

interface CodeDiffState {
  mode: 'split' | 'unified';
  copied: boolean;
}

interface Chrome {
  overlay: string;
  panel: string;
  text: string;
  muted: string;
  line: string;
  removed: string;
  removedBg: string;
  added: string;
  addedBg: string;
  mark: string;
  radius: string;
  syntax: 'dark' | 'light';
  placement: 'center' | 'sheet';
}

const chrome: Record<DiffThemeName, Chrome> = {
  phosphor: {
    overlay: 'rgba(0, 0, 0, 0.72)',
    panel: '#0c120d',
    text: '#dfffc4',
    muted: '#86a37b',
    line: '#234628',
    removed: '#ff8d78',
    removedBg: 'rgba(255, 77, 46, 0.16)',
    added: '#d6ff8a',
    addedBg: 'rgba(198, 255, 85, 0.12)',
    mark: '#c6ff55',
    radius: '0px',
    syntax: 'dark',
    placement: 'center',
  },
  folio: {
    overlay: 'rgba(26, 25, 23, 0.28)',
    panel: '#f7f4ee',
    text: '#1a1917',
    muted: '#5e5a53',
    line: '#d5d0c6',
    removed: '#d10f1a',
    removedBg: 'rgba(209, 15, 26, 0.08)',
    added: '#1a1917',
    addedBg: 'rgba(26, 25, 23, 0.06)',
    mark: '#d10f1a',
    radius: '0px',
    syntax: 'light',
    placement: 'center',
  },
  orbit: {
    overlay: 'rgba(2, 4, 12, 0.72)',
    panel: 'rgba(10, 16, 34, 0.92)',
    text: '#e7f4ff',
    muted: '#8aa0b8',
    line: 'rgba(139, 233, 255, 0.28)',
    removed: '#ff8aa0',
    removedBg: 'rgba(255, 93, 122, 0.16)',
    added: '#9dffc4',
    addedBg: 'rgba(125, 255, 168, 0.12)',
    mark: '#8be9ff',
    radius: '18px',
    syntax: 'dark',
    placement: 'center',
  },
  stamp: {
    overlay: 'rgba(22, 22, 22, 0.45)',
    panel: '#fffdf6',
    text: '#161616',
    muted: '#3f3a32',
    line: '#161616',
    removed: '#ff4d2e',
    removedBg: '#ffd7cf',
    added: '#14301a',
    addedBg: '#e4ffb8',
    mark: '#6846ff',
    radius: '16px',
    syntax: 'light',
    placement: 'center',
  },
  keynote: {
    overlay: 'rgba(0, 0, 0, 0.55)',
    panel: '#0a0a0c',
    text: '#f5f5f7',
    muted: '#86868b',
    line: 'rgba(255, 255, 255, 0.14)',
    removed: '#ffb4b4',
    removedBg: 'rgba(255, 80, 80, 0.12)',
    added: '#f5f5f7',
    addedBg: 'rgba(255, 255, 255, 0.06)',
    mark: '#f5f5f7',
    radius: '22px',
    syntax: 'dark',
    placement: 'sheet',
  },
};

function linesOf(value: string): string[] {
  const parts = value.split('\n');
  if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts.length ? parts : [''];
}

function changedLineNumbers(source: string, other: string, start: number): Set<number> {
  const left = linesOf(source);
  const right = linesOf(other);
  const marks = new Set<number>();
  left.forEach((line, index) => {
    if (line !== right[index]) marks.add(start + index);
  });
  return marks;
}

export class CodeDiff extends React.Component<CodeDiffProps, CodeDiffState> {
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: CodeDiffProps) {
    super(props);
    this.state = { mode: 'split', copied: false };
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', this.onKey);
  }

  componentWillUnmount() {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', this.onKey);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }

  onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.props.onClose();
  };

  copyFixed = () => {
    void navigator.clipboard.writeText(this.props.fix.fixedCode);
    this.setState({ copied: true });
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => this.setState({ copied: false }), 1600);
  };

  renderHighlighted(code: string, other: string, start: number) {
    const look = chrome[this.props.theme];
    const base = look.syntax === 'dark' ? vscDarkPlus : oneLight;
    const changed = changedLineNumbers(code, other, start);
    const issueLine = this.props.fix.lineNumber;

    const style = {
      ...base,
      'pre[class*="language-"]': {
        ...(base['pre[class*="language-"]'] as object),
        background: 'transparent',
        margin: 0,
        padding: '0.75rem 0',
        fontSize: '0.8125rem',
        lineHeight: '1.55',
      },
      'code[class*="language-"]': {
        ...(base['code[class*="language-"]'] as object),
        background: 'transparent',
      },
    };

    return (
      <SyntaxHighlighter
        language="html"
        style={style}
        showLineNumbers
        startingLineNumber={start}
        wrapLines
        wrapLongLines
        lineNumberStyle={{ color: look.muted, fontSize: '0.72rem', minWidth: '2.5rem' }}
        lineProps={(lineNumber: number) => {
          const isIssue = issueLine != null && lineNumber === issueLine;
          const isChange = changed.has(lineNumber);
          return {
            style: {
              display: 'block',
              background: isIssue ? look.addedBg : isChange ? look.removedBg : 'transparent',
              boxShadow: isIssue ? `inset 3px 0 0 ${look.mark}` : undefined,
            },
          };
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  renderUnified(look: Chrome, start: number) {
    const { fix } = this.props;
    const parts = diffLines(fix.originalCode, fix.fixedCode);
    let oldNo = start;
    let newNo = start;
    const rows: React.ReactNode[] = [];

    parts.forEach((part, partIndex) => {
      linesOf(part.value).forEach((line, lineIndex) => {
        const removed = Boolean(part.removed);
        const added = Boolean(part.added);
        const number = removed ? oldNo : newNo;
        const isIssue = fix.lineNumber != null && number === fix.lineNumber && !removed;
        rows.push(
          <div
            key={`${partIndex}-${lineIndex}`}
            className="grid grid-cols-[2.5rem_1.25rem_1fr] gap-2 px-3"
            style={{
              background: removed ? look.removedBg : added ? look.addedBg : 'transparent',
              boxShadow: isIssue ? `inset 3px 0 0 ${look.mark}` : undefined,
              color: removed ? look.removed : added ? look.added : look.text,
            }}
          >
            <span style={{ color: look.muted }}>{number}</span>
            <span>{removed ? '−' : added ? '+' : ' '}</span>
            <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
          </div>,
        );
        if (removed) oldNo += 1;
        else newNo += 1;
      });
    });

    return <div className="font-mono text-[13px] leading-6">{rows}</div>;
  }

  render() {
    const { fix, onClose, theme } = this.props;
    const look = chrome[theme];
    const start = fix.lineNumber ?? 1;
    const sheet = look.placement === 'sheet';

    return (
      <div
        className={`fixed inset-0 z-[80] flex p-3 sm:p-6 ${sheet ? 'items-end justify-center' : 'items-center justify-center'}`}
        style={{ background: look.overlay }}
        onClick={onClose}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Code change"
          className={`flex max-h-[88vh] w-full flex-col overflow-hidden ${sheet ? 'max-w-5xl' : 'max-w-6xl'}`}
          style={{
            background: look.panel,
            color: look.text,
            borderRadius: look.radius,
            border: `1px solid ${look.line}`,
            boxShadow: theme === 'stamp' ? '8px 8px 0 #161616' : 'none',
            backdropFilter: theme === 'orbit' ? 'blur(18px)' : undefined,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
            style={{ borderBottom: `1px solid ${look.line}` }}
          >
            <div className="min-w-0">
              <p className="text-sm" style={{ color: look.muted }}>
                {fix.file}
                {fix.lineNumber ? ` · line ${fix.lineNumber}` : ''}
              </p>
              <h2 className="mt-1 text-lg leading-snug">The change</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex" style={{ border: `1px solid ${look.line}`, borderRadius: look.radius }}>
                {(['split', 'unified'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => this.setState({ mode })}
                    className="px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: this.state.mode === mode ? look.mark : 'transparent',
                      color: this.state.mode === mode ? '#101408' : look.text,
                    }}
                  >
                    {mode === 'split' ? 'Split' : 'Unified'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2"
                style={{ color: look.muted }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-5">
            <p className="mb-4 max-w-3xl text-sm leading-6" style={{ color: look.muted }}>
              {fix.explanation}
            </p>
            {fix.lineNumber != null && (
              <p className="mb-3 text-xs" style={{ color: look.mark }}>
                Highlighted line {fix.lineNumber} is the finding. Other tinted lines differ.
              </p>
            )}

            {this.state.mode === 'split' ? (
              <div className="grid gap-3 lg:grid-cols-2">
                <section style={{ border: `1px solid ${look.line}`, borderRadius: look.radius }} className="min-w-0 overflow-auto">
                  <header className="px-3 py-2 text-sm" style={{ color: look.removed, background: look.removedBg }}>
                    Before
                  </header>
                  {this.renderHighlighted(fix.originalCode, fix.fixedCode, start)}
                </section>
                <section style={{ border: `1px solid ${look.line}`, borderRadius: look.radius }} className="min-w-0 overflow-auto">
                  <header className="px-3 py-2 text-sm" style={{ color: look.added, background: look.addedBg }}>
                    After
                  </header>
                  {this.renderHighlighted(fix.fixedCode, fix.originalCode, start)}
                </section>
              </div>
            ) : (
              <div style={{ border: `1px solid ${look.line}`, borderRadius: look.radius }} className="overflow-auto py-2">
                {this.renderUnified(look, start)}
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
            style={{ borderTop: `1px solid ${look.line}` }}
          >
            <p className="text-sm" style={{ color: look.muted }}>
              {linesOf(fix.originalCode).length} lines before · {linesOf(fix.fixedCode).length} lines after
            </p>
            <button
              type="button"
              onClick={this.copyFixed}
              className="px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2"
              style={{
                background: look.mark,
                color: theme === 'folio' ? '#f7f4ee' : '#101408',
                borderRadius: look.radius,
              }}
            >
              {this.state.copied ? 'Copied' : 'Copy fixed code'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
