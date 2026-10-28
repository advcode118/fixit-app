'use client';

import React from 'react';
import Link from 'next/link';
import { Bricolage_Grotesque } from 'next/font/google';
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

const face = Bricolage_Grotesque({ weight: ['500', '700', '800'], subsets: ['latin'] });
const ink = palettes.stamp;
const noteColors = [ink.yellow, ink.mint, ink.sky, '#ffb3c7', '#ffffff'];

function feedColor(type: ActivityItem['type']): string {
  if (type === 'error' || type === 'issue') return ink.hot;
  if (type === 'fix' || type === 'success') return ink.ok;
  return ink.ink;
}

export default class StampPage extends AuditView {
  pageBackground = ink.bg;
  pageColor = ink.ink;
  pageTitle = 'Stamp — FixIt';
  colorScheme: 'dark' | 'light' = 'light';

  render() {
    const { url, repo, isAuditing, auditResult, activityItems, urlError, repoError, prResult, prError, isCreatingPR, showDiff, selectedIssue, expandedIssueId, demoMode } = this.state;
    const fixed = this.fixedCount();
    const press = 'border-[3px] border-[#161616] shadow-[6px_6px_0_#161616] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#161616] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none';

    return (
      <div className={`${face.className} min-h-screen`} style={{ background: ink.bg, color: ink.ink }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div
              className="inline-block -rotate-2 border-[3px] border-[#161616] px-4 py-2 shadow-[6px_6px_0_#161616]"
              style={{ background: ink.yellow }}
            >
              <p className="text-3xl font-extrabold tracking-[-0.04em]">FixIt</p>
            </div>
            <Link
              href="/designs"
              className="border-[3px] border-[#161616] bg-white px-3 py-2 font-bold shadow-[4px_4px_0_#161616]"
            >
              All designs
            </Link>
          </header>

          <h1 className="mt-8 max-w-[12ch] text-[clamp(3rem,7vw,5.4rem)] leading-[0.9] font-extrabold tracking-[-0.045em]">
            Stamp the bugs.
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <form
              className={`p-4 sm:p-5 ${press}`}
              style={{ background: ink.panel }}
              onSubmit={(event) => {
                event.preventDefault();
                this.startLiveAudit();
              }}
            >
              <label className="block font-bold">
                Page URL
                <input
                  value={url}
                  onChange={(event) => this.setUrl(event.target.value)}
                  placeholder="https://"
                  autoComplete="off"
                  className="mt-2 w-full border-[3px] border-[#161616] bg-white px-3 py-3 text-base font-medium outline-none"
                />
              </label>
              {urlError && <p className="mt-2 font-bold" style={{ color: ink.hot }}>{urlError}</p>}
              <label className="mt-4 block font-bold">
                Repository
                <input
                  value={repo}
                  onChange={(event) => this.setRepo(event.target.value)}
                  placeholder="owner/repo"
                  autoComplete="off"
                  className="mt-2 w-full border-[3px] border-[#161616] bg-white px-3 py-3 text-base font-medium outline-none"
                />
              </label>
              {repoError && <p className="mt-2 font-bold" style={{ color: ink.hot }}>{repoError}</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="submit" disabled={isAuditing} className={`px-4 py-3 font-extrabold disabled:opacity-50 ${press}`} style={{ background: ink.hot, color: 'white' }}>
                  {isAuditing ? 'Auditing' : 'Audit it'}
                </button>
                <button type="button" onClick={this.startSample} disabled={isAuditing} className={`px-4 py-3 font-extrabold disabled:opacity-50 ${press}`} style={{ background: ink.violet, color: 'white' }}>
                  Play sample
                </button>
              </div>
              <button
                type="button"
                onClick={this.loadExample}
                className="mt-5 block w-full rotate-[-1deg] border-[3px] border-[#161616] px-3 py-3 text-left font-bold shadow-[4px_4px_0_#161616]"
                style={{ background: ink.mint }}
              >
                <span className="block text-sm">Example target</span>
                <span className="mt-1 block break-all font-medium">{EXAMPLE_URL}</span>
                <span className="mt-1 block">{EXAMPLE_REPO}</span>
              </button>
            </form>

            <section>
              <h2 className="mb-3 text-2xl font-extrabold">Agent notes</h2>
              <FeedScroller watch={activityItems.length} className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-2">
                {activityItems.length === 0 && (
                  <p className="border-[3px] border-dashed border-[#161616] bg-white p-4 font-medium">
                    Notes land here while the audit runs.
                  </p>
                )}
                {activityItems.map((item, index) => (
                  <p
                    key={item.id}
                    className="d4-note border-[3px] border-[#161616] px-3 py-2 text-sm font-medium shadow-[4px_4px_0_#161616]"
                    style={{
                      background: noteColors[index % noteColors.length],
                      color: feedColor(item.type),
                      ['--tilt' as string]: `${(index % 5) - 2}deg`,
                      transform: `rotate(${(index % 5) - 2}deg)`,
                    }}
                  >
                    <span className="mr-2 font-extrabold">{formatClock(item.timestamp)}</span>
                    {item.message}
                  </p>
                ))}
              </FeedScroller>
            </section>
          </div>

          {auditResult && (
            <div className="mt-12 space-y-10">
              <section className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap gap-6">
                  <StampScore label="Before" value={auditResult.scoreBefore} color={ink.hot} />
                  <StampScore label="After" value={auditResult.scoreAfter} color={ink.ok} />
                </div>
                <div className="max-w-xs">
                  <p className="text-lg font-bold">
                    {auditResult.summary.total} findings, {fixed} ready to ship.
                    {demoMode ? ' Sample data.' : ''}
                  </p>
                  <button type="button" onClick={this.reset} className="mt-3 font-extrabold underline">
                    Start over
                  </button>
                </div>
              </section>

              <div className="flex flex-wrap gap-2 font-extrabold">
                <span className="border-[3px] border-[#161616] px-3 py-1" style={{ background: ink.hot, color: 'white' }}>{auditResult.summary.critical} critical</span>
                <span className="border-[3px] border-[#161616] px-3 py-1" style={{ background: ink.yellow }}>{auditResult.summary.serious} serious</span>
                <span className="border-[3px] border-[#161616] px-3 py-1" style={{ background: ink.sky }}>{auditResult.summary.moderate} moderate</span>
                <span className="border-[3px] border-[#161616] px-3 py-1 bg-white">{auditResult.summary.minor} minor</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {auditResult.issues.map((issue, index) => (
                  <StampIssue
                    key={issue.id}
                    issue={issue}
                    index={index}
                    open={expandedIssueId === issue.id}
                    onFocus={this.focusIssue}
                    onShow={this.showChange}
                  />
                ))}
              </div>

              <section>
                <h2 className="mb-3 text-3xl font-extrabold tracking-[-0.04em]">Slide to compare</h2>
                <PreviewCompare
                  beforeHtml={this.beforeMarkup()}
                  afterHtml={this.afterMarkup()}
                  highlightSelector={selectedIssue?.selector}
                  beforeColor={ink.hot}
                  afterColor={ink.ok}
                  frameClassName={`overflow-hidden ${press}`}
                  chromeClassName="font-extrabold"
                  handleClassName=""
                  height={400}
                />
              </section>

              <section
                className="border-[3px] border-dashed border-[#161616] bg-white p-5 shadow-[6px_6px_0_#161616]"
              >
                {isCreatingPR && <p className="text-2xl font-extrabold">Stamping the pull request.</p>}
                {prError && <p className="text-xl font-bold" style={{ color: ink.hot }}>{prError}</p>}
                {prResult?.success && (
                  <div>
                    <p className="text-3xl font-extrabold tracking-[-0.04em]">Pull request is up.</p>
                    <p className="mt-2 font-medium">{prResult.branch} · {prResult.filesChanged} file</p>
                    {prResult.prUrl && (
                      <a href={prResult.prUrl} target="_blank" rel="noreferrer" className={`mt-4 inline-block px-4 py-3 font-extrabold ${press}`} style={{ background: ink.mint }}>
                        View the pull request
                      </a>
                    )}
                  </div>
                )}
                {!prResult?.success && !isCreatingPR && fixed > 0 && (
                  <button type="button" onClick={() => void this.createPR()} className={`px-5 py-3 text-lg font-extrabold ${press}`} style={{ background: ink.yellow }}>
                    Open a pull request with {fixed} fixes
                  </button>
                )}
              </section>
            </div>
          )}
        </div>

        {showDiff && selectedIssue?.fix && (
          <CodeDiff fix={selectedIssue.fix} theme="stamp" onClose={this.closeDiff} />
        )}
      </div>
    );
  }
}

class StampScore extends React.Component<{ label: string; value: number; color: string }> {
  render() {
    return (
      <div
        className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[6px] bg-white"
        style={{ borderColor: this.props.color, color: this.props.color }}
      >
        <span className="text-sm font-extrabold">{this.props.label}</span>
        <CountUp value={this.props.value} className="text-5xl font-extrabold leading-none" />
      </div>
    );
  }
}

class StampIssue extends React.Component<{
  issue: AccessibilityIssue;
  index: number;
  open: boolean;
  onFocus: (issue: AccessibilityIssue) => void;
  onShow: (issue: AccessibilityIssue) => void;
}> {
  render() {
    const { issue, index, open, onFocus, onShow } = this.props;
    const wash = [ink.panel, ink.yellow, ink.sky, ink.mint][index % 4];
    return (
      <article className="border-[3px] border-[#161616] p-4 shadow-[5px_5px_0_#161616]" style={{ background: wash }}>
        <button type="button" onClick={() => onFocus(issue)} className="w-full text-left">
          <span className="inline-block border-[3px] border-[#161616] bg-white px-2 py-0.5 text-sm font-extrabold">
            {issue.severity}
          </span>
          <span className="ml-2 text-sm font-bold">{issue.wcagRule || issue.category}</span>
          <h3 className="mt-3 text-xl leading-tight font-extrabold tracking-[-0.03em]">{issue.description}</h3>
        </button>
        {open && (
          <div className="mt-3 space-y-3 text-sm font-medium">
            <p>{issue.impact}</p>
            <p className="break-all">{issue.selector}</p>
            <pre className="overflow-x-auto border-[3px] border-[#161616] bg-white p-3 whitespace-pre-wrap">{issue.element}</pre>
            {issue.fix && (
              <button type="button" onClick={() => onShow(issue)} className="border-[3px] border-[#161616] bg-[#6846ff] px-3 py-2 font-extrabold text-white">
                Show the change
              </button>
            )}
          </div>
        )}
      </article>
    );
  }
}
