'use client';

import React from 'react';
import Link from 'next/link';
import { Geist } from 'next/font/google';
import { AccessibilityIssue } from '@/types';
import {
  AuditView,
  EXAMPLE_REPO,
  EXAMPLE_URL,
  formatClock,
} from '@/components/designs/AuditView';
import { CountUp, FeedScroller } from '@/components/designs/CountUp';
import { CodeDiff } from '@/components/designs/CodeDiff';
import { PreviewCompare } from '@/components/designs/PreviewCompare';
import { palettes } from '@/components/designs/palette';

const geist = Geist({ subsets: ['latin'] });
const ink = palettes.keynote;

export default class KeynotePage extends AuditView {
  pageBackground = ink.bg;
  pageColor = ink.ink;
  pageTitle = 'Keynote — FixIt';
  colorScheme: 'dark' | 'light' = 'dark';

  render() {
    const { url, repo, isAuditing, auditResult, activityItems, urlError, repoError, prResult, prError, isCreatingPR, showDiff, selectedIssue, expandedIssueId, demoMode } = this.state;
    const fixed = this.fixedCount();

    return (
      <div className={`${geist.className} min-h-screen`} style={{ background: ink.bg, color: ink.ink }}>
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <header className="flex items-center justify-between text-sm" style={{ color: ink.dim }}>
            <span>FixIt</span>
            <Link href="/designs">Designs</Link>
          </header>

          {!auditResult && (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <h1 className="text-[clamp(4.5rem,14vw,9.5rem)] leading-none font-light tracking-[-0.055em]">
                FixIt
              </h1>
              <p className="mt-4 max-w-md text-xl font-light" style={{ color: ink.dim }}>
                Audit a page. Leave with a pull request.
              </p>
              <form
                className="mt-12 w-full max-w-xl text-left"
                onSubmit={(event) => {
                  event.preventDefault();
                  this.startLiveAudit();
                }}
              >
                <label className="block text-sm" style={{ color: ink.dim }}>
                  Page URL
                  <input
                    value={url}
                    onChange={(event) => this.setUrl(event.target.value)}
                    placeholder="https://"
                    autoComplete="off"
                    className="mt-2 w-full border-0 border-b bg-transparent py-3 text-lg font-light outline-none"
                    style={{ borderColor: urlError ? '#ff6b6b' : ink.line, color: ink.ink }}
                  />
                </label>
                {urlError && <p className="mt-2 text-sm text-[#ffb4b4]">{urlError}</p>}
                <label className="mt-6 block text-sm" style={{ color: ink.dim }}>
                  Repository
                  <input
                    value={repo}
                    onChange={(event) => this.setRepo(event.target.value)}
                    placeholder="owner/repo"
                    autoComplete="off"
                    className="mt-2 w-full border-0 border-b bg-transparent py-3 text-lg font-light outline-none"
                    style={{ borderColor: repoError ? '#ff6b6b' : ink.line, color: ink.ink }}
                  />
                </label>
                {repoError && <p className="mt-2 text-sm text-[#ffb4b4]">{repoError}</p>}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="submit"
                    disabled={isAuditing}
                    className="rounded-full bg-[#f5f5f7] px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {isAuditing ? 'Auditing' : 'Audit'}
                  </button>
                  <button type="button" onClick={this.startSample} disabled={isAuditing} className="text-sm disabled:opacity-50" style={{ color: ink.dim }}>
                    Play sample
                  </button>
                </div>
              </form>
              <button
                type="button"
                onClick={this.loadExample}
                className="mt-10 max-w-lg text-sm leading-6"
                style={{ color: ink.dim }}
              >
                <span className="block break-all text-[#f5f5f7]">{EXAMPLE_URL}</span>
                <span className="mt-1 block">{EXAMPLE_REPO}</span>
              </button>

              {(isAuditing || activityItems.length > 0) && (
                <FeedScroller watch={activityItems.length} className="mt-10 h-40 w-full max-w-lg overflow-y-auto text-left text-sm">
                  {activityItems.map((item) => (
                    <p key={item.id} className="d-line py-1" style={{ color: ink.dim }}>
                      <span className="mr-3">{formatClock(item.timestamp)}</span>
                      <span style={{ color: ink.ink }}>{item.message}</span>
                    </p>
                  ))}
                </FeedScroller>
              )}
            </div>
          )}

          {auditResult && (
            <div className="d5-in flex-1 py-16">
              <div className="text-center">
                <p className="text-sm" style={{ color: ink.dim }}>
                  {auditResult.scoreBefore} before
                </p>
                <CountUp
                  value={auditResult.scoreAfter}
                  duration={1400}
                  className="mt-3 block text-[clamp(6rem,18vw,11rem)] leading-none font-light tracking-[-0.06em]"
                />
                <p className="mt-4 text-lg font-light" style={{ color: ink.dim }}>
                  after the fixes{demoMode ? ', on the sample page' : ''}
                </p>
                <button type="button" onClick={this.reset} className="mt-6 text-sm" style={{ color: ink.dim }}>
                  Audit another page
                </button>
              </div>

              <p className="mx-auto mt-12 max-w-xl text-center text-base leading-7" style={{ color: ink.dim }}>
                {auditResult.summary.total} findings. {auditResult.summary.critical} critical. {fixed} can be committed.
              </p>

              <FeedScroller watch={activityItems.length} className="mx-auto mt-8 h-28 max-w-xl overflow-y-auto text-sm">
                {activityItems.slice(-6).map((item) => (
                  <p key={item.id} className="py-1" style={{ color: ink.dim }}>{item.message}</p>
                ))}
              </FeedScroller>

              <div className="mx-auto mt-16 max-w-3xl">
                {auditResult.issues.map((issue) => (
                  <KeynoteIssue
                    key={issue.id}
                    issue={issue}
                    open={expandedIssueId === issue.id}
                    onFocus={this.focusIssue}
                    onShow={this.showChange}
                  />
                ))}
              </div>

              <div className="mx-auto mt-20 max-w-4xl">
                <PreviewCompare
                  beforeHtml={this.beforeMarkup()}
                  afterHtml={this.afterMarkup()}
                  highlightSelector={selectedIssue?.selector}
                  beforeColor="#86868b"
                  afterColor="#f5f5f7"
                  frameClassName="overflow-hidden rounded-[20px]"
                  chromeClassName=""
                  handleClassName=""
                  height={460}
                />
              </div>

              <div className="mx-auto mt-20 max-w-xl pb-16 text-center">
                {isCreatingPR && <p className="text-2xl font-light">Opening the pull request.</p>}
                {prError && <p className="text-[#ffb4b4]">{prError}</p>}
                {prResult?.success && (
                  <div>
                    <p className="text-3xl font-light tracking-[-0.03em]">The pull request is ready.</p>
                    <p className="mt-3 text-sm" style={{ color: ink.dim }}>{prResult.branch}</p>
                    {prResult.prUrl && (
                      <a href={prResult.prUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm underline underline-offset-4">
                        View pull request
                      </a>
                    )}
                  </div>
                )}
                {!prResult?.success && !isCreatingPR && fixed > 0 && (
                  <button
                    type="button"
                    onClick={() => void this.createPR()}
                    className="rounded-full bg-[#f5f5f7] px-6 py-3 text-sm font-medium text-black"
                  >
                    Open a pull request with {fixed} fixes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {showDiff && selectedIssue?.fix && (
          <CodeDiff fix={selectedIssue.fix} theme="keynote" onClose={this.closeDiff} />
        )}
      </div>
    );
  }
}

class KeynoteIssue extends React.Component<{
  issue: AccessibilityIssue;
  open: boolean;
  onFocus: (issue: AccessibilityIssue) => void;
  onShow: (issue: AccessibilityIssue) => void;
}> {
  render() {
    const { issue, open, onFocus, onShow } = this.props;
    return (
      <article className="border-t py-7" style={{ borderColor: ink.line }}>
        <button type="button" onClick={() => onFocus(issue)} className="w-full text-left">
          <p className="text-sm" style={{ color: ink.dim }}>
            {issue.severity}
            {issue.wcagRule ? ` · ${issue.wcagRule}` : ` · ${issue.category}`}
          </p>
          <h3 className="mt-2 text-2xl font-light tracking-[-0.03em]">{issue.description}</h3>
        </button>
        {open && (
          <div className="mt-4 space-y-3 text-base leading-7" style={{ color: ink.dim }}>
            <p className="max-w-[62ch]">{issue.impact}</p>
            <p className="break-all text-sm text-[#f5f5f7]">{issue.selector}</p>
            <pre className="overflow-x-auto rounded-2xl p-4 text-sm whitespace-pre-wrap" style={{ background: ink.panel, color: ink.ink }}>
              {issue.element}
            </pre>
            {issue.fix && (
              <button type="button" onClick={() => onShow(issue)} className="text-sm text-[#f5f5f7] underline underline-offset-4">
                Show the change
              </button>
            )}
          </div>
        )}
      </article>
    );
  }
}
