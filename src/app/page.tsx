'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitPullRequest, RefreshCw } from 'lucide-react';

import Hero from '@/components/Hero';
import ActivityFeed, { ActivityItem } from '@/components/ActivityFeed';
import ScoreGauge from '@/components/ScoreGauge';
import SummaryBar from '@/components/SummaryBar';
import IssueCard from '@/components/IssueCard';
import DiffViewer from '@/components/DiffViewer';
import PreviewSlider from '@/components/PreviewSlider';
import PRCard from '@/components/PRCard';

import { AccessibilityIssue, AuditResult, AuditStreamEvent, PRResult, CodeFix } from '@/types';
import { getDemoAuditResult, demoHTML, demoFixedHTML } from '@/lib/demo-data';

interface HomeState {
  url: string;
  repo: string;
  isAuditing: boolean;
  auditResult: AuditResult | null;
  activityItems: ActivityItem[];
  selectedIssue: AccessibilityIssue | null;
  showDiffViewer: boolean;
  isCreatingPR: boolean;
  prResult: PRResult | null;
  prError: string | null;
  demoMode: boolean;
  showPreview: boolean;
}

class Home extends React.Component<object, HomeState> {
  private abortController: AbortController | null = null;

  constructor(props: object) {
    super(props);
    this.state = {
      url: '',
      repo: '',
      isAuditing: false,
      auditResult: null,
      activityItems: [],
      selectedIssue: null,
      showDiffViewer: false,
      isCreatingPR: false,
      prResult: null,
      prError: null,
      demoMode: false,
      showPreview: false,
    };
  }

  addActivity = (type: ActivityItem['type'], message: string) => {
    const item: ActivityItem = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
    };
    this.setState(state => ({
      activityItems: [...state.activityItems, item],
    }));
  };

  runDemoAudit = async () => {
    this.setState({
      isAuditing: true,
      auditResult: null,
      activityItems: [],
      prResult: null,
      prError: null,
    });

    const steps = [
      { delay: 300, type: 'progress' as const, message: 'Starting demo audit...' },
      { delay: 500, type: 'progress' as const, message: 'Fetching demo webpage...' },
      { delay: 400, type: 'progress' as const, message: 'Parsing HTML document...' },
      { delay: 300, type: 'progress' as const, message: 'Running accessibility checks...' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Images must have alt text' },
      { delay: 150, type: 'issue' as const, message: 'Found: Hero image is missing alt text' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Form inputs must have labels' },
      { delay: 150, type: 'issue' as const, message: 'Found: Email input field is missing label' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Buttons must have accessible names' },
      { delay: 150, type: 'issue' as const, message: 'Found: Button does not have accessible name' },
      { delay: 200, type: 'progress' as const, message: 'Checking: HTML must have lang attribute' },
      { delay: 150, type: 'issue' as const, message: 'Found: HTML element missing lang attribute' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Links must have descriptive text' },
      { delay: 150, type: 'issue' as const, message: 'Found: Link text "Click here" not descriptive' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Headings must be in order' },
      { delay: 150, type: 'issue' as const, message: 'Found: Heading level skipped from h2 to h4' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Page must have a title' },
      { delay: 150, type: 'issue' as const, message: 'Found: Page title is empty' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Meta description' },
      { delay: 150, type: 'issue' as const, message: 'Found: Page missing meta description' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Open Graph tags' },
      { delay: 150, type: 'issue' as const, message: 'Found: Missing Open Graph tags' },
      { delay: 200, type: 'progress' as const, message: 'Checking: Viewport meta scaling' },
      { delay: 150, type: 'issue' as const, message: 'Found: Viewport disables user scaling' },
      { delay: 300, type: 'progress' as const, message: 'Found 12 issues. Analyzing severity...' },
      { delay: 400, type: 'progress' as const, message: 'Using rule-based analysis. Generating fixes...' },
      { delay: 200, type: 'fix' as const, message: 'Generated fix for: Hero image alt text' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Email input label' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Clickable div to button' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: HTML lang attribute' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Link text' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Heading order' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Page title' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Meta description' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Open Graph tags' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Viewport scaling' },
      { delay: 150, type: 'fix' as const, message: 'Generated fix for: Button accessible name' },
      { delay: 300, type: 'success' as const, message: 'Audit complete! Score improved from 38 to 94' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      this.addActivity(step.type, step.message);
    }

    const demoResult = getDemoAuditResult();
    this.setState({
      isAuditing: false,
      auditResult: demoResult,
    });
  };

  runAudit = async () => {
    const { url, demoMode } = this.state;

    if (demoMode) {
      await this.runDemoAudit();
      return;
    }

    this.abortController = new AbortController();

    this.setState({
      isAuditing: true,
      auditResult: null,
      activityItems: [],
      prResult: null,
      prError: null,
    });

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Audit failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: AuditStreamEvent = JSON.parse(line.slice(6));
              this.handleStreamEvent(event);
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      
      this.addActivity('error', `Audit failed: ${(error as Error).message}`);
      console.error('Audit error:', error);
    } finally {
      this.setState({ isAuditing: false });
    }
  };

  handleStreamEvent = (event: AuditStreamEvent) => {
    switch (event.type) {
      case 'progress':
        this.addActivity('progress', event.message || 'Processing...');
        break;
      case 'issue':
        const issue = event.data as AccessibilityIssue;
        this.addActivity('issue', `Found: ${issue.description}`);
        break;
      case 'fix':
        const fix = event.data as CodeFix;
        this.addActivity('fix', `Generated fix: ${fix.explanation}`);
        break;
      case 'score':
        const scores = event.data as { before: number; after: number };
        this.addActivity('success', `Score improved from ${scores.before} to ${scores.after}`);
        break;
      case 'complete':
        const result = event.data as AuditResult;
        this.setState({ auditResult: result });
        this.addActivity('success', 'Audit complete!');
        break;
      case 'error':
        this.addActivity('error', event.message || 'Unknown error');
        break;
    }
  };

  createPR = async () => {
    const { repo, auditResult, demoMode } = this.state;

    if (demoMode) {
      this.setState({ isCreatingPR: true, prError: null });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.setState({
        isCreatingPR: false,
        prResult: {
          success: true,
          prUrl: 'https://github.com/advcode118/fixit-demo-target/pull/1',
          branch: 'fixit/auto-fixes-demo',
          filesChanged: 1,
        },
      });
      return;
    }

    if (!auditResult || !repo) return;

    this.setState({ isCreatingPR: true, prError: null });

    try {
      const files = [{
        path: 'index.html',
        content: auditResult.html || '',
      }];

      const response = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          files,
          summary: `Fixed ${auditResult.fixes.length} accessibility and SEO issues, improving score from ${auditResult.scoreBefore} to ${auditResult.scoreAfter}.`,
          issues: auditResult.issues,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PR');
      }

      this.setState({ prResult: data });
    } catch (error) {
      this.setState({ prError: (error as Error).message });
    } finally {
      this.setState({ isCreatingPR: false });
    }
  };

  handleIssueSelect = (issue: AccessibilityIssue) => {
    this.setState(state => ({
      selectedIssue: state.selectedIssue?.id === issue.id ? null : issue,
      showDiffViewer: issue.fix ? true : false,
    }));
  };

  reset = () => {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.setState({
      auditResult: null,
      activityItems: [],
      selectedIssue: null,
      showDiffViewer: false,
      prResult: null,
      prError: null,
    });
  };

  render() {
    const {
      url,
      repo,
      isAuditing,
      auditResult,
      activityItems,
      selectedIssue,
      showDiffViewer,
      isCreatingPR,
      prResult,
      prError,
      demoMode,
      showPreview,
    } = this.state;

    const fixedCount = auditResult?.issues.filter(i => i.fix).length || 0;

    return (
      <div className="min-h-screen bg-zinc-950">
        <Hero
          url={url}
          repo={repo}
          onUrlChange={(v) => this.setState({ url: v })}
          onRepoChange={(v) => this.setState({ repo: v })}
          onAudit={this.runAudit}
          isLoading={isAuditing}
          demoMode={demoMode}
          onDemoToggle={() => this.setState(s => ({ demoMode: !s.demoMode }))}
        />

        <div className="max-w-6xl mx-auto px-6 pb-20">
          <AnimatePresence>
            {(isAuditing || activityItems.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <ActivityFeed items={activityItems} isLoading={isAuditing} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {auditResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-white"
                  >
                    Audit Results
                  </motion.h2>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={this.reset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Audit
                  </motion.button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                >
                  <ScoreGauge
                    scoreBefore={auditResult.scoreBefore}
                    scoreAfter={auditResult.scoreAfter}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SummaryBar summary={auditResult.summary} fixedCount={fixedCount} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={() => this.setState(s => ({ showPreview: !s.showPreview }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </motion.div>

                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PreviewSlider
                        beforeHtml={demoMode ? demoHTML : (auditResult.html || '')}
                        afterHtml={demoMode ? demoFixedHTML : (auditResult.html || '')}
                        highlightSelector={selectedIssue?.selector}
                        onClose={() => this.setState({ showPreview: false })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Issues ({auditResult.issues.length})
                  </h3>
                  <div className="space-y-3">
                    {auditResult.issues.map((issue, index) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        index={index}
                        isSelected={selectedIssue?.id === issue.id}
                        onSelect={this.handleIssueSelect}
                      />
                    ))}
                  </div>
                </motion.div>

                {fixedCount > 0 && !prResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={this.createPR}
                      disabled={isCreatingPR}
                      className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <GitPullRequest className="w-5 h-5" />
                      Open Pull Request with {fixedCount} Fixes
                    </motion.button>
                  </motion.div>
                )}

                <PRCard
                  prResult={prResult}
                  isCreating={isCreatingPR}
                  error={prError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showDiffViewer && selectedIssue?.fix && (
            <DiffViewer
              fix={selectedIssue.fix}
              onClose={() => this.setState({ showDiffViewer: false })}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
}

export default Home;
