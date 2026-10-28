'use client';

import React from 'react';
import Link from 'next/link';
import { Familjen_Grotesk } from 'next/font/google';
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

const grotesk = Familjen_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
const ink = palettes.folio;

function feedColor(type: ActivityItem['type']): string {
  if (type === 'error' || type === 'issue') return ink.hot;
  return ink.ink;
}

export default class FolioPage extends AuditView {
  pageBackground = ink.bg;
  pageColor = ink.ink;
  pageTitle = 'Folio — FixIt';
  colorScheme: 'dark' | 'light' = 'light';

  render() {
    const { url, repo, isAuditing, auditResult, activityItems, urlError, repoError, prResult, prError, isCreatingPR, showDiff, selectedIssue, expandedIssueId, demoMode } = this.state;
    const fixed = this.fixedCount();

    return (
      <div className={`${grotesk.className} min-h-screen`} style={{ background: ink.bg, color: ink.ink }}>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 sm:py-12">
          <header className="flex items-baseline justify-between gap-6 border-b pb-4" style={{ borderColor: ink.ink }}>
            <p className="text-lg">FixIt</p>
            <Link href="/designs" className="text-sm" style={{ color: ink.dim }}>
              All designs
            </Link>
          </header>

          {!auditResult && (
            <div className="mt-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.7fr)]">
              <div>
                <h1 className="max-w-[10ch] text-[clamp(3.4rem,8vw,6.6rem)] leading-[0.88] font-medium tracking-[-0.035em]">
                  The page, measured.
                </h1>
                <form
                  className="mt-10 max-w-xl"
                  onSubmit={(event) => {
                    event.preventDefault();
                    this.startLiveAudit();
                  }}
                >
                  <label className="block text-lg">
                    Address
                    <input
                      value={url}
                      onChange={(event) => this.setUrl(event.target.value)}
                      placeholder="https://example.com"
                      autoComplete="off"
                      className="mt-2 w-full border-0 border-b bg-transparent py-3 text-xl outline-none"
                      style={{ borderColor: urlError ? ink.hot : ink.ink }}
                    />
                  </label>
                  {urlError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{urlError}</p>}
                  <label className="mt-8 block text-lg">
                    Repository
                    <input
                      value={repo}
                      onChange={(event) => this.setRepo(event.target.value)}
                      placeholder="owner/repo"
                      autoComplete="off"
                      className="mt-2 w-full border-0 border-b bg-transparent py-3 text-xl outline-none"
                      style={{ borderColor: repoError ? ink.hot : ink.ink }}
                    />
                  </label>
                  {repoError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{repoError}</p>}
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <button
                      type="submit"
                      disabled={isAuditing}
                      className="bg-[#1a1917] px-5 py-3 text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                      style={{ outlineColor: ink.hot }}
                    >
                      {isAuditing ? 'Auditing' : 'Audit this page'}
                    </button>
                    <button type="button" onClick={this.startSample} disabled={isAuditing} className="text-left underline decoration-1 underline-offset-4 disabled:opacity-50">
                      Play the sample
                    </button>
                    <button type="button" onClick={this.startPdaDemo} disabled={isAuditing} className="text-left underline decoration-1 underline-offset-4 disabled:opacity-50">
                      Play demo 2
                    </button>
                  </div>
                </form>
              </div>
              <aside className="border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" style={{ borderColor: ink.line }}>
                <button
                  type="button"
                  onClick={this.loadExample}
                  className="text-left focus-visible:outline focus-visible:outline-2"
                  style={{ outlineColor: ink.hot }}
                >
                  <span className="block text-sm" style={{ color: ink.dim }}>Try this target</span>
                  <span className="mt-3 block text-lg leading-snug break-all">{EXAMPLE_URL}</span>
                  <span className="mt-2 block">{EXAMPLE_REPO}</span>
                </button>
                <FeedScroller watch={activityItems.length} className="mt-8 max-h-72 space-y-3 overflow-y-auto text-sm leading-6">
                  {activityItems.length === 0 && (
                    <p style={{ color: ink.dim }}>The running notes appear here once the audit starts.</p>
                  )}
                  {activityItems.map((item) => (
                    <p key={item.id} className="d-line" style={{ color: feedColor(item.type) }}>
                      <span style={{ color: ink.dim }}>{formatClock(item.timestamp)} </span>
                      {item.message}
                    </p>
                  ))}
                </FeedScroller>
              </aside>
            </div>
          )}

          {auditResult && (
            <div className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4" style={{ borderColor: ink.ink }}>
                <p className="max-w-xl text-lg leading-snug">
                  {demoMode ? this.demoCaption() : auditResult.url}
                </p>
                <button type="button" onClick={this.reset} className="underline underline-offset-4">
                  Start another
                </button>
              </div>

              <div className="grid gap-10 border-b py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)]" style={{ borderColor: ink.line }}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm" style={{ color: ink.dim }}>Before</p>
                    <CountUp value={auditResult.scoreBefore} className="block text-[clamp(4.5rem,12vw,8rem)] leading-none font-medium tracking-[-0.04em]" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: ink.hot }}>After</p>
                    <CountUp value={auditResult.scoreAfter} className="block text-[clamp(4.5rem,12vw,8rem)] leading-none font-medium tracking-[-0.04em]" />
                  </div>
                </div>
                <FeedScroller watch={activityItems.length} className="max-h-64 space-y-2 overflow-y-auto text-sm leading-6 lg:max-h-none">
                  {activityItems.slice(-8).map((item) => (
                    <p key={item.id} className="d-line">
                      <span style={{ color: ink.dim }}>{formatClock(item.timestamp)} </span>
                      {item.message}
                    </p>
                  ))}
                </FeedScroller>
              </div>

              <p className="py-6 text-lg">
                {auditResult.summary.total} findings. {auditResult.summary.critical} critical, {auditResult.summary.serious} serious, {auditResult.summary.moderate} moderate, {auditResult.summary.minor} minor. {fixed} have a fix.
              </p>

              <div>
                {auditResult.issues.map((issue) => (
                  <FolioIssue
                    key={issue.id}
                    issue={issue}
                    open={expandedIssueId === issue.id}
                    onFocus={this.focusIssue}
                    onShow={this.showChange}
                  />
                ))}
              </div>

              <div className="mt-12">
                <h2 className="mb-4 text-3xl font-medium tracking-[-0.03em]">Before and after</h2>
                <PreviewCompare
                  beforeHtml={this.beforeMarkup()}
                  afterHtml={this.afterMarkup()}
                  highlightSelector={selectedIssue?.selector}
                  beforeColor={ink.hot}
                  afterColor={ink.ink}
                  frameClassName="border"
                  chromeClassName=""
                  handleClassName=""
                  height={440}
                />
              </div>

              <div className="mt-12 border-t pt-8" style={{ borderColor: ink.ink }}>
                {isCreatingPR && <p className="text-2xl">Opening the pull request.</p>}
                {prError && <p className="text-xl" style={{ color: ink.hot }}>{prError}</p>}
                {prResult?.success && (
                  <div className="grid gap-6 md:grid-cols-3">
                    <p className="text-3xl font-medium tracking-[-0.03em] md:col-span-3">The pull request is open.</p>
                    <p>{prResult.branch}</p>
                    <p>{prResult.filesChanged} file changed</p>
                    {prResult.prUrl && (
                      <a href={prResult.prUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                        Read it on GitHub
                      </a>
                    )}
                  </div>
                )}
                {!prResult?.success && !isCreatingPR && fixed > 0 && (
                  <button
                    type="button"
                    onClick={() => void this.createPR()}
                    className="bg-[#d10f1a] px-5 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    Open a pull request with {fixed} fixes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {showDiff && selectedIssue?.fix && (
          <CodeDiff fix={selectedIssue.fix} theme="folio" onClose={this.closeDiff} />
        )}
      </div>
    );
  }
}

class FolioIssue extends React.Component<{
  issue: AccessibilityIssue;
  open: boolean;
  onFocus: (issue: AccessibilityIssue) => void;
  onShow: (issue: AccessibilityIssue) => void;
}> {
  render() {
    const { issue, open, onFocus, onShow } = this.props;
    return (
      <article className="grid gap-3 border-t py-6 md:grid-cols-[9rem_minmax(0,1fr)_8rem]" style={{ borderColor: ink.line }}>
        <button type="button" onClick={() => onFocus(issue)} className="text-left focus-visible:outline focus-visible:outline-2">
          <span style={{ color: issue.severity === 'critical' ? ink.hot : ink.ink }}>{issue.severity}</span>
        </button>
        <div>
          <button type="button" onClick={() => onFocus(issue)} className="text-left text-xl leading-snug focus-visible:outline focus-visible:outline-2">
            {issue.description}
          </button>
          {open && (
            <div className="mt-4 space-y-3 text-base leading-7" style={{ color: ink.dim }}>
              <p className="max-w-[62ch]">{issue.impact}</p>
              <p className="break-all text-sm" style={{ color: ink.ink }}>{issue.selector}</p>
              <pre className="overflow-x-auto p-4 text-sm whitespace-pre-wrap" style={{ background: ink.panel, color: ink.ink }}>
                {issue.element}
              </pre>
              {issue.fix && (
                <button type="button" onClick={() => onShow(issue)} className="underline underline-offset-4" style={{ color: ink.ink }}>
                  Show the change
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm md:text-right" style={{ color: ink.dim }}>{issue.wcagRule || issue.category}</p>
      </article>
    );
  }
}
