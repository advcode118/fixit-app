'use client';

import React from 'react';
import Link from 'next/link';
import { Chakra_Petch, Sora } from 'next/font/google';
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

const display = Chakra_Petch({ weight: ['500', '600'], subsets: ['latin'] });
const sans = Sora({ weight: ['400', '500', '600'], subsets: ['latin'] });
const ink = palettes.orbit;

function feedColor(type: ActivityItem['type']): string {
  if (type === 'error' || type === 'issue') return ink.hot;
  if (type === 'fix' || type === 'success') return ink.ok;
  if (type === 'progress') return ink.cyan;
  return ink.dim;
}

class MissionClock extends React.Component<object, { label: string }> {
  private timer = 0;

  constructor(props: object) {
    super(props);
    this.state = { label: '--:--:--' };
  }

  componentDidMount() {
    const read = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
    this.setState({ label: read() });
    this.timer = window.setInterval(() => this.setState({ label: read() }), 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  render() {
    return <span className="tabular-nums">{this.state.label}</span>;
  }
}

class IntegrityRing extends React.Component<{ value: number; color: string; label: string }> {
  render() {
    const radius = 58;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (circ * this.props.value) / 100;
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(139,233,255,0.15)" strokeWidth="7" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={this.props.color}
              strokeWidth="7"
              className="d3-draw"
              style={{ ['--circ' as string]: circ, ['--offset' as string]: offset }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <CountUp value={this.props.value} className={`${display.className} text-4xl`} />
          </div>
        </div>
        <span className="text-xs tracking-[0.14em]" style={{ color: ink.dim }}>{this.props.label}</span>
      </div>
    );
  }
}

export default class OrbitPage extends AuditView {
  pageBackground = ink.bg;
  pageColor = ink.ink;
  pageTitle = 'Orbit — FixIt';
  colorScheme: 'dark' | 'light' = 'dark';

  render() {
    const { url, repo, isAuditing, auditResult, activityItems, urlError, repoError, prResult, prError, isCreatingPR, showDiff, selectedIssue, expandedIssueId, demoMode } = this.state;
    const fixed = this.fixedCount();
    const glass = {
      background: ink.panel,
      border: `1px solid ${ink.line}`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    } as const;

    return (
      <div className={`${sans.className} d3-grid min-h-screen`} style={{ color: ink.ink }}>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`${display.className} text-3xl tracking-wide`} style={{ color: ink.cyan }}>Orbit</p>
              <p className="text-sm" style={{ color: ink.dim }}>Accessibility scan</p>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: ink.dim }}>
              <span className="inline-flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${isAuditing ? 'd3-pulse' : ''}`} style={{ background: isAuditing ? ink.cyan : ink.ok }} />
                {isAuditing ? 'Scanning' : 'Link ready'}
              </span>
              <MissionClock />
              <Link href="/designs" style={{ color: ink.cyan }}>Designs</Link>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-3">
            <form
              className="rounded-[18px] p-4 lg:col-span-1"
              style={glass}
              onSubmit={(event) => {
                event.preventDefault();
                this.startLiveAudit();
              }}
            >
              <h2 className={`${display.className} text-lg`} style={{ color: ink.cyan }}>Target lock</h2>
              <label className="mt-4 block text-sm" style={{ color: ink.dim }}>
                Page URL
                <input
                  value={url}
                  onChange={(event) => this.setUrl(event.target.value)}
                  placeholder="https://"
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border bg-black/30 px-3 py-2 outline-none focus-visible:border-[#8be9ff]"
                  style={{ borderColor: urlError ? ink.hot : ink.line, color: ink.ink }}
                />
              </label>
              {urlError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{urlError}</p>}
              <label className="mt-4 block text-sm" style={{ color: ink.dim }}>
                Repository
                <input
                  value={repo}
                  onChange={(event) => this.setRepo(event.target.value)}
                  placeholder="owner/repo"
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border bg-black/30 px-3 py-2 outline-none focus-visible:border-[#8be9ff]"
                  style={{ borderColor: repoError ? ink.hot : ink.line, color: ink.ink }}
                />
              </label>
              {repoError && <p className="mt-2 text-sm" style={{ color: ink.hot }}>{repoError}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isAuditing}
                  className="rounded-full border px-4 py-2 text-sm disabled:opacity-50"
                  style={{ borderColor: ink.cyan, color: ink.cyan }}
                >
                  {isAuditing ? 'Scanning' : 'Scan target'}
                </button>
                <button type="button" onClick={this.startSample} disabled={isAuditing} className="rounded-full px-4 py-2 text-sm disabled:opacity-50" style={{ color: ink.dim }}>
                  Sample
                </button>
              </div>
              <button
                type="button"
                onClick={this.loadExample}
                className="mt-4 w-full rounded-xl border px-3 py-3 text-left text-sm"
                style={{ borderColor: ink.line, color: ink.ink }}
              >
                <span className="block text-xs" style={{ color: ink.violet }}>Known target</span>
                <span className="mt-1 block break-all">{EXAMPLE_URL}</span>
                <span className="mt-1 block" style={{ color: ink.cyan }}>{EXAMPLE_REPO}</span>
              </button>
            </form>

            <section className="rounded-[18px] lg:col-span-1" style={glass}>
              <header className="flex items-center justify-between px-4 py-3" style={{ color: ink.cyan }}>
                <h2 className={`${display.className} text-lg`}>Telemetry</h2>
                <span className="text-xs" style={{ color: ink.dim }}>{activityItems.length}</span>
              </header>
              <FeedScroller watch={activityItems.length} className="h-72 overflow-y-auto px-4 pb-4 text-sm">
                {activityItems.length === 0 && <p style={{ color: ink.dim }}>Awaiting a target.</p>}
                {activityItems.map((item) => (
                  <p key={item.id} className="d-line grid grid-cols-[4.8rem_1fr] gap-2 py-1.5">
                    <span style={{ color: ink.dim }}>{formatClock(item.timestamp)}</span>
                    <span style={{ color: feedColor(item.type) }}>{item.message}</span>
                  </p>
                ))}
              </FeedScroller>
            </section>

            <section className="flex flex-col items-center justify-center rounded-[18px] px-4 py-6" style={glass}>
              <h2 className={`${display.className} mb-4 text-lg`} style={{ color: ink.cyan }}>Integrity</h2>
              {auditResult ? (
                <div className="flex flex-wrap justify-center gap-6">
                  <IntegrityRing value={auditResult.scoreBefore} color={ink.hot} label="Before" />
                  <IntegrityRing value={auditResult.scoreAfter} color={ink.ok} label="After" />
                </div>
              ) : (
                <p className="max-w-[16rem] text-center text-sm leading-6" style={{ color: ink.dim }}>
                  The score rings fill when the scan finishes.
                </p>
              )}
            </section>
          </div>

          {auditResult && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm" style={{ color: ink.dim }}>
                <p>
                  {auditResult.summary.critical} critical · {auditResult.summary.serious} serious · {auditResult.summary.moderate} moderate · {auditResult.summary.minor} minor · {fixed} patched
                  {demoMode ? ' · sample' : ''}
                </p>
                <button type="button" onClick={this.reset} style={{ color: ink.cyan }}>Reset board</button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {auditResult.issues.map((issue) => (
                  <OrbitIssue
                    key={issue.id}
                    issue={issue}
                    open={expandedIssueId === issue.id}
                    glass={glass}
                    onFocus={this.focusIssue}
                    onShow={this.showChange}
                  />
                ))}
              </div>

              <section className="overflow-hidden rounded-[18px]" style={glass}>
                <h2 className={`${display.className} px-4 pt-4 text-lg`} style={{ color: ink.cyan }}>Visual confirmation</h2>
                <div className="p-3">
                  <PreviewCompare
                    beforeHtml={this.beforeMarkup()}
                    afterHtml={this.afterMarkup()}
                    highlightSelector={selectedIssue?.selector}
                    beforeColor={ink.hot}
                    afterColor={ink.ok}
                    frameClassName="overflow-hidden rounded-xl"
                    chromeClassName=""
                    handleClassName=""
                    height={400}
                  />
                </div>
              </section>

              <section className="rounded-[18px] p-5" style={{ ...glass, borderColor: prError ? ink.hot : ink.line }}>
                {isCreatingPR && <p>Committing the patch and opening the pull request.</p>}
                {prError && <p style={{ color: ink.hot }}>{prError}</p>}
                {prResult?.success && (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className={`${display.className} text-2xl`} style={{ color: ink.ok }}>Pull request open</p>
                      <p className="mt-1 text-sm" style={{ color: ink.dim }}>{prResult.branch} · {prResult.filesChanged} file</p>
                    </div>
                    {prResult.prUrl && (
                      <a href={prResult.prUrl} target="_blank" rel="noreferrer" className="rounded-full px-4 py-2" style={{ background: ink.cyan, color: '#061018' }}>
                        Open on GitHub
                      </a>
                    )}
                  </div>
                )}
                {!prResult?.success && !isCreatingPR && fixed > 0 && (
                  <button
                    type="button"
                    onClick={() => void this.createPR()}
                    className="rounded-full px-5 py-3"
                    style={{ background: ink.cyan, color: '#061018' }}
                  >
                    Open a pull request with {fixed} fixes
                  </button>
                )}
              </section>
            </div>
          )}
        </div>

        {showDiff && selectedIssue?.fix && (
          <CodeDiff fix={selectedIssue.fix} theme="orbit" onClose={this.closeDiff} />
        )}
      </div>
    );
  }
}

class OrbitIssue extends React.Component<{
  issue: AccessibilityIssue;
  open: boolean;
  glass: React.CSSProperties;
  onFocus: (issue: AccessibilityIssue) => void;
  onShow: (issue: AccessibilityIssue) => void;
}> {
  render() {
    const { issue, open, glass, onFocus, onShow } = this.props;
    const pip = issue.severity === 'critical' || issue.severity === 'serious' ? ink.hot : issue.severity === 'moderate' ? ink.warn : ink.violet;
    return (
      <article className="rounded-2xl p-4" style={glass}>
        <button type="button" onClick={() => onFocus(issue)} className="w-full text-left">
          <span className="inline-flex items-center gap-2 text-xs" style={{ color: pip }}>
            <span className="h-2 w-2 rounded-full" style={{ background: pip }} />
            {issue.severity}
            <span style={{ color: ink.dim }}>{issue.wcagRule || issue.category}</span>
          </span>
          <h3 className="mt-2 text-base leading-snug">{issue.description}</h3>
        </button>
        {open && (
          <div className="mt-3 space-y-3 text-sm leading-6" style={{ color: ink.dim }}>
            <p>{issue.impact}</p>
            <p className="break-all" style={{ color: ink.cyan }}>{issue.selector}</p>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 whitespace-pre-wrap" style={{ color: ink.ink }}>{issue.element}</pre>
            {issue.fix && (
              <button type="button" onClick={() => onShow(issue)} className="rounded-full border px-3 py-1.5" style={{ borderColor: ink.cyan, color: ink.cyan }}>
                Show the change
              </button>
            )}
          </div>
        )}
      </article>
    );
  }
}
