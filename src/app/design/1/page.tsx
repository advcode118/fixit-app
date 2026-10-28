'use client';

import React from 'react';
import Link from 'next/link';
import { IBM_Plex_Mono, Share_Tech_Mono } from 'next/font/google';
import { AccessibilityIssue } from '@/types';
import {
  ActivityItem,
  AuditView,
  EXAMPLE_REPO,
  EXAMPLE_URL,
  formatClock,
} from '@/components/designs/AuditView';
import { CountUp, FeedScroller } from '@/components/designs/CountUp';
import { CodeDiff } from '@/components/designs/CodeDiff';
import { PreviewCompare } from '@/components/designs/PreviewCompare';
import { palettes } from '@/components/designs/palette';

const display = Share_Tech_Mono({ weight: '400', subsets: ['latin'] });
const mono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'] });
const ink = palettes.phosphor;

function tone(type: ActivityItem['type']): string {
  if (type === 'issue' || type === 'error') return ink.hot;
  if (type === 'fix' || type === 'success') return ink.ok;
  if (type === 'progress') return ink.warn;
  return ink.dim;
}

export default class PhosphorPage extends AuditView {
  pageBackground = ink.bg;
  pageColor = ink.ink;
  pageTitle = 'Phosphor — FixIt';
  colorScheme: 'dark' | 'light' = 'dark';

  renderIssue(issue: AccessibilityIssue) {
    const open = this.state.expandedIssueId === issue.id;
    const selected = this.state.selectedIssue?.id === issue.id;
    return (
      <article
        key={issue.id}
        className="border-b"
        style={{ borderColor: ink.line, background: selected ? '#122015' : 'transparent' }}
      >
        <button
          type="button"
          onClick={() => this.focusIssue(issue)}
          className="grid w-full gap-2 px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 sm:grid-cols-[7rem_8rem_1fr] sm:items-baseline"
          style={{ outlineColor: ink.ok }}
        >
          <span style={{ color: issue.severity === 'critical' || issue.severity === 'serious' ? ink.hot : ink.warn }}>
            {issue.severity}
          </span>
          <span style={{ color: ink.dim }}>{issue.wcagRule || issue.category}</span>
          <span>{issue.description}</span>
        </button>
        {open && (
          <div className="space-y-3 px-3 pb-4 text-sm" style={{ color: ink.dim }}>
            <p className="max-w-3xl leading-6">{issue.impact}</p>
            <p className="break-all" style={{ color: ink.ink }}>{issue.selector}</p>
            <pre className="overflow-x-auto whitespace-pre-wrap p-3" style={{ background: '#070a08', color: ink.ink }}>
              {issue.element}
            </pre>
            {issue.fix && (
              <button
                type="button"
                onClick={() => this.showChange(issue)}
                className="border px-3 py-1.5 focus-visible:outline focus-visible:outline-2"
                style={{ borderColor: ink.ok, color: ink.ok, outlineColor: ink.ok }}
              >
                Show the change
              </button>
            )}
          </div>
        )}
      </article>
    );
  }

  render() {
    const { url, repo, isAuditing, auditResult, activityItems, urlError, repoError, prResult, prError, isCreatingPR, showDiff, selectedIssue, demoMode } = this.state;
    const fixed = this.fixedCount();

    return (
      <div className={`${mono.className} min-h-screen`} style={{ background: ink.bg, color: ink.ink }}>
        <div className="d1-scan" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: ink.line }}>
            <div>
              <p className={`${display.className} text-3xl sm:text-4xl`}>
                fixit@audit
                <span className="d1-cursor" aria-hidden="true" />
              </p>
              <p className="mt-2 text-sm" style={{ color: ink.dim }}>
                tty session for one url and one repo
              </p>
            </div>
            <Link href="/designs" className="text-sm underline-offset-4 hover:underline" style={{ color: ink.ok }}>
              all designs
            </Link>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form
              className="border p-4"
              style={{ borderColor: ink.line, background: ink.panel }}
              onSubmit={(event) => {
                event.preventDefault();
                this.startLiveAudit();
              }}
            >
              <label className="block text-sm" style={{ color: ink.dim }}>
                url
                <input
                  value={url}
                  onChange={(event) => this.setUrl(event.target.value)}
                  placeholder="https://"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-1 w-full border-0 border-b bg-transparent px-0 py-2 text-base outline-none focus-visible:border-b-2"
                  style={{ borderColor: urlError ? ink.hot : ink.line, color: ink.ink }}
                />
              </label>
              {urlError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{urlError}</p>}

              <label className="mt-5 block text-sm" style={{ color: ink.dim }}>
                repo
                <input
                  value={repo}
                  onChange={(event) => this.setRepo(event.target.value)}
                  placeholder="owner/repo"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-1 w-full border-0 border-b bg-transparent px-0 py-2 text-base outline-none focus-visible:border-b-2"
                  style={{ borderColor: repoError ? ink.hot : ink.line, color: ink.ink }}
                />
              </label>
              {repoError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{repoError}</p>}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isAuditing}
                  className="border px-4 py-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2"
                  style={{ borderColor: ink.ok, color: ink.ok, outlineColor: ink.ok }}
                >
                  {isAuditing ? 'auditing' : 'run audit'}
                </button>
                <button
                  type="button"
                  onClick={this.startSample}
                  disabled={isAuditing}
                  className="border px-4 py-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2"
                  style={{ borderColor: ink.line, color: ink.dim, outlineColor: ink.ok }}
                >
                  play sample
                </button>
              </div>

              <button
                type="button"
                onClick={this.loadExample}
                className="mt-5 block w-full border px-3 py-3 text-left text-sm focus-visible:outline focus-visible:outline-2"
                style={{ borderColor: ink.line, color: ink.ink, outlineColor: ink.ok }}
              >
                <span className="block" style={{ color: ink.dim }}>example</span>
                <span className="mt-1 block break-all">{EXAMPLE_URL}</span>
                <span className="mt-1 block" style={{ color: ink.ok }}>{EXAMPLE_REPO}</span>
              </button>
              {demoMode && auditResult && (
                <p className="mt-3 text-xs" style={{ color: ink.warn }}>Sample stream. No live request was sent.</p>
              )}
            </form>

            <section className="border" style={{ borderColor: ink.line, background: '#090c09' }}>
              <header className="flex items-center justify-between border-b px-3 py-2 text-sm" style={{ borderColor: ink.line, color: ink.dim }}>
                <span>agent.log</span>
                <span>{isAuditing ? 'live' : activityItems.length ? 'idle' : 'waiting'}</span>
              </header>
              <FeedScroller watch={activityItems.length} className="h-80 overflow-y-auto px-3 py-2 text-sm">
                {activityItems.length === 0 && (
                  <p style={{ color: ink.dim }}>log attaches when the audit starts.</p>
                )}
                {activityItems.map((item) => (
                  <p key={item.id} className="d-line grid grid-cols-[5.5rem_1fr] gap-3 py-1">
                    <span style={{ color: ink.dim }}>{formatClock(item.timestamp)}</span>
                    <span style={{ color: tone(item.type) }}>{item.message}</span>
                  </p>
                ))}
              </FeedScroller>
            </section>
          </div>

          {auditResult && (
            <div className="mt-8 space-y-8">
              <section className="border p-4 sm:p-6" style={{ borderColor: ink.line }}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm" style={{ color: ink.dim }}>
                  <span>
                    {auditResult.summary.total} findings · {auditResult.summary.critical} critical · {fixed} fixes
                  </span>
                  <button type="button" onClick={this.reset} className="underline-offset-4 hover:underline" style={{ color: ink.ok }}>
                    clear session
                  </button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {[{ label: 'before', value: auditResult.scoreBefore, color: ink.hot }, { label: 'after', value: auditResult.scoreAfter, color: ink.ok }].map((score) => (
                    <div key={score.label}>
                      <p className="text-sm" style={{ color: ink.dim }}>{score.label}</p>
                      <CountUp value={score.value} className={`${display.className} text-6xl sm:text-7xl`} />
                      <div className="mt-3 h-3" style={{ background: '#142016' }}>
                        <div className="d-line h-full" style={{ width: `${score.value}%`, background: score.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className={`${display.className} mb-3 text-2xl`}>findings</h2>
                <div className="border" style={{ borderColor: ink.line }}>
                  {auditResult.issues.map((issue) => this.renderIssue(issue))}
                </div>
              </section>

              <section>
                <h2 className={`${display.className} mb-3 text-2xl`}>viewport</h2>
                <PreviewCompare
                  beforeHtml={this.beforeMarkup()}
                  afterHtml={this.afterMarkup()}
                  highlightSelector={selectedIssue?.selector}
                  beforeColor={ink.hot}
                  afterColor={ink.ok}
                  frameClassName="border"
                  chromeClassName="font-mono"
                  handleClassName=""
                  height={380}
                />
              </section>

              <section className="border p-4" style={{ borderColor: prError ? ink.hot : ink.ok, background: ink.panel }}>
                {isCreatingPR && <p>opening pull request...</p>}
                {prError && <p style={{ color: ink.hot }}>{prError}</p>}
                {prResult?.success && (
                  <div className="space-y-2">
                    <p style={{ color: ink.ok }}>pull request ready</p>
                    <p className="text-sm" style={{ color: ink.dim }}>
                      {prResult.branch} · {prResult.filesChanged} file
                    </p>
                    {prResult.prUrl && (
                      <a href={prResult.prUrl} target="_blank" rel="noreferrer" className="inline-block underline" style={{ color: ink.ok }}>
                        {prResult.prUrl}
                      </a>
                    )}
                  </div>
                )}
                {!prResult?.success && !isCreatingPR && fixed > 0 && (
                  <button
                    type="button"
                    onClick={() => void this.createPR()}
                    className="border px-4 py-2 focus-visible:outline focus-visible:outline-2"
                    style={{ borderColor: ink.ok, color: ink.ok, outlineColor: ink.ok }}
                  >
                    open a pull request with {fixed} fixes
                  </button>
                )}
              </section>
            </div>
          )}
        </div>

        {showDiff && selectedIssue?.fix && (
          <CodeDiff fix={selectedIssue.fix} theme="phosphor" onClose={this.closeDiff} />
        )}
      </div>
    );
  }
}
