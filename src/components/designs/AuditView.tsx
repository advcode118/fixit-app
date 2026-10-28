'use client';

import React from 'react';
import {
  AccessibilityIssue,
  AuditResult,
  AuditStreamEvent,
  CodeFix,
  PRResult,
} from '@/types';
import { demoFixedHTML, demoHTML, getDemoAuditResult } from '@/lib/demo-data';

export const EXAMPLE_URL = 'https://advcode118.github.io/fixit-demo-target/';
export const EXAMPLE_REPO = 'advcode118/fixit-demo-target';

export interface ActivityItem {
  id: string;
  type: 'progress' | 'issue' | 'fix' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export interface AuditViewState {
  url: string;
  repo: string;
  isAuditing: boolean;
  auditResult: AuditResult | null;
  activityItems: ActivityItem[];
  selectedIssue: AccessibilityIssue | null;
  expandedIssueId: string | null;
  showDiff: boolean;
  isCreatingPR: boolean;
  prResult: PRResult | null;
  prError: string | null;
  demoMode: boolean;
  urlError: string | null;
  repoError: string | null;
}

const DEMO_STEPS: Array<{ delay: number; type: ActivityItem['type']; message: string }> = [
  { delay: 280, type: 'progress', message: 'Starting demo audit...' },
  { delay: 420, type: 'progress', message: 'Fetching demo webpage...' },
  { delay: 360, type: 'progress', message: 'Parsing HTML document...' },
  { delay: 280, type: 'progress', message: 'Running accessibility checks...' },
  { delay: 180, type: 'progress', message: 'Checking: Images must have alt text' },
  { delay: 140, type: 'issue', message: 'Found: Hero image is missing alt text' },
  { delay: 180, type: 'progress', message: 'Checking: Form inputs must have labels' },
  { delay: 140, type: 'issue', message: 'Found: Email input field is missing label' },
  { delay: 180, type: 'progress', message: 'Checking: Buttons must have accessible names' },
  { delay: 140, type: 'issue', message: 'Found: Button does not have accessible name' },
  { delay: 180, type: 'progress', message: 'Checking: HTML must have lang attribute' },
  { delay: 140, type: 'issue', message: 'Found: HTML element missing lang attribute' },
  { delay: 180, type: 'progress', message: 'Checking: Links must have descriptive text' },
  { delay: 140, type: 'issue', message: 'Found: Link text "Click here" not descriptive' },
  { delay: 180, type: 'progress', message: 'Checking: Headings must be in order' },
  { delay: 140, type: 'issue', message: 'Found: Heading level skipped from h2 to h4' },
  { delay: 180, type: 'progress', message: 'Checking: Page must have a title' },
  { delay: 140, type: 'issue', message: 'Found: Page title is empty' },
  { delay: 180, type: 'progress', message: 'Checking: Meta description' },
  { delay: 140, type: 'issue', message: 'Found: Page missing meta description' },
  { delay: 180, type: 'progress', message: 'Checking: Open Graph tags' },
  { delay: 140, type: 'issue', message: 'Found: Missing Open Graph tags' },
  { delay: 180, type: 'progress', message: 'Checking: Viewport meta scaling' },
  { delay: 140, type: 'issue', message: 'Found: Viewport disables user scaling' },
  { delay: 280, type: 'progress', message: 'Found 12 issues. Analyzing severity...' },
  { delay: 360, type: 'progress', message: 'Using rule-based analysis. Generating fixes...' },
  { delay: 160, type: 'fix', message: 'Generated fix for: Hero image alt text' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Email input label' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Clickable div to button' },
  { delay: 130, type: 'fix', message: 'Generated fix for: HTML lang attribute' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Link text' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Heading order' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Page title' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Meta description' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Open Graph tags' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Viewport scaling' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Button accessible name' },
  { delay: 280, type: 'success', message: 'Audit complete! Score improved from 38 to 94' },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour12: false });
}

export class AuditView extends React.Component<object, AuditViewState> {
  pageBackground = '#09090b';
  pageColor = '#fafafa';
  pageTitle = 'FixIt';
  colorScheme: 'dark' | 'light' = 'dark';

  private abortController: AbortController | null = null;
  private runToken = 0;
  private mounted = false;
  private previousBodyBg = '';
  private previousBodyColor = '';
  private previousHtmlBg = '';
  private previousTitle = '';
  private previousScheme = '';

  constructor(props: object) {
    super(props);
    this.state = {
      url: '',
      repo: '',
      isAuditing: false,
      auditResult: null,
      activityItems: [],
      selectedIssue: null,
      expandedIssueId: null,
      showDiff: false,
      isCreatingPR: false,
      prResult: null,
      prError: null,
      demoMode: false,
      urlError: null,
      repoError: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.previousBodyBg = document.body.style.background;
    this.previousBodyColor = document.body.style.color;
    this.previousHtmlBg = document.documentElement.style.background;
    this.previousTitle = document.title;
    this.previousScheme = document.documentElement.style.colorScheme;
    document.body.style.background = this.pageBackground;
    document.body.style.color = this.pageColor;
    document.documentElement.style.background = this.pageBackground;
    document.documentElement.style.colorScheme = this.colorScheme;
    document.title = this.pageTitle;
  }

  componentWillUnmount() {
    this.mounted = false;
    this.runToken += 1;
    if (this.abortController) this.abortController.abort();
    document.body.style.background = this.previousBodyBg;
    document.body.style.color = this.previousBodyColor;
    document.documentElement.style.background = this.previousHtmlBg;
    document.documentElement.style.colorScheme = this.previousScheme;
    document.title = this.previousTitle;
  }

  private commit = (update: Pick<AuditViewState, never> | Partial<AuditViewState>) => {
    if (this.mounted) this.setState(update as AuditViewState);
  };

  setUrl = (url: string) => {
    this.setState({ url, urlError: null });
  };

  setRepo = (repo: string) => {
    this.setState({ repo, repoError: null });
  };

  loadExample = () => {
    this.setState({
      url: EXAMPLE_URL,
      repo: EXAMPLE_REPO,
      urlError: null,
      repoError: null,
    });
  };

  validate = (): boolean => {
    const url = this.state.url.trim();
    const repo = this.state.repo.trim();
    let urlError: string | null = null;
    let repoError: string | null = null;

    if (!url) urlError = 'Enter a full URL, including https://.';
    else {
      try {
        const parsed = new URL(url);
        if (!parsed.protocol.startsWith('http')) urlError = 'Use an http or https URL.';
      } catch {
        urlError = 'That URL needs a scheme and a host.';
      }
    }

    if (!repo) repoError = 'Enter the GitHub repo as owner/repo.';
    else if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) repoError = 'Use the owner/repo form.';

    this.setState({ urlError, repoError });
    return !urlError && !repoError;
  };

  startLiveAudit = () => {
    if (this.state.isAuditing) return;
    if (!this.validate()) return;
    this.setState({ demoMode: false }, () => {
      void this.runAudit();
    });
  };

  startSample = () => {
    if (this.state.isAuditing) return;
    this.setState(
      {
        demoMode: true,
        url: EXAMPLE_URL,
        repo: EXAMPLE_REPO,
        urlError: null,
        repoError: null,
      },
      () => {
        void this.runAudit();
      },
    );
  };

  addActivity = (type: ActivityItem['type'], message: string) => {
    const item: ActivityItem = {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      timestamp: new Date(),
    };
    if (!this.mounted) return;
    this.setState((state) => ({ activityItems: [...state.activityItems, item] }));
  };

  runDemoAudit = async () => {
    const token = ++this.runToken;
    this.commit({
      isAuditing: true,
      auditResult: null,
      activityItems: [],
      prResult: null,
      prError: null,
      showDiff: false,
      selectedIssue: null,
      expandedIssueId: null,
    });

    for (const step of DEMO_STEPS) {
      await wait(step.delay);
      if (!this.mounted || this.runToken !== token) return;
      this.addActivity(step.type, step.message);
    }

    if (!this.mounted || this.runToken !== token) return;
    this.commit({ isAuditing: false, auditResult: getDemoAuditResult() });
  };

  handleStreamEvent = (event: AuditStreamEvent) => {
    switch (event.type) {
      case 'progress':
        this.addActivity('progress', event.message || 'Processing...');
        break;
      case 'issue':
        this.addActivity('issue', `Found: ${(event.data as AccessibilityIssue).description}`);
        break;
      case 'fix':
        this.addActivity('fix', `Generated fix: ${(event.data as CodeFix).explanation}`);
        break;
      case 'score': {
        const scores = event.data as { before: number; after: number };
        this.addActivity('success', `Score improved from ${scores.before} to ${scores.after}`);
        break;
      }
      case 'complete':
        this.commit({ auditResult: event.data as AuditResult });
        this.addActivity('success', 'Audit complete.');
        break;
      case 'error':
        this.addActivity('error', event.message || 'The audit stopped.');
        break;
      default:
        break;
    }
  };

  runAudit = async () => {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.state.demoMode) {
      await this.runDemoAudit();
      return;
    }

    const token = ++this.runToken;
    const controller = new AbortController();
    this.abortController = controller;

    this.commit({
      isAuditing: true,
      auditResult: null,
      activityItems: [],
      prResult: null,
      prError: null,
      showDiff: false,
      selectedIssue: null,
      expandedIssueId: null,
    });

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: this.state.url.trim() }),
        signal: controller.signal,
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
        if (!this.mounted || this.runToken !== token) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            this.handleStreamEvent(JSON.parse(line.slice(6)) as AuditStreamEvent);
          } catch (error) {
            console.error('Failed to parse SSE event:', error);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      if (!this.mounted || this.runToken !== token) return;
      this.addActivity('error', `Audit failed: ${(error as Error).message}`);
    } finally {
      if (this.mounted && this.runToken === token) this.commit({ isAuditing: false });
    }
  };

  createPR = async () => {
    const { demoMode, auditResult, repo, isCreatingPR } = this.state;
    if (isCreatingPR) return;

    if (demoMode) {
      this.commit({ isCreatingPR: true, prError: null });
      await wait(1400);
      if (!this.mounted) return;
      this.commit({
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

    if (!auditResult) return;
    if (!repo.trim()) {
      this.commit({ prError: 'Enter the GitHub repo as owner/repo.' });
      return;
    }

    this.commit({ isCreatingPR: true, prError: null });

    try {
      const response = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: repo.trim(),
          files: [{ path: 'index.html', content: auditResult.html || '' }],
          summary: `Fixed ${auditResult.fixes.length} accessibility and SEO issues, improving score from ${auditResult.scoreBefore} to ${auditResult.scoreAfter}.`,
          issues: auditResult.issues,
        }),
      });

      const data = (await response.json()) as PRResult & { error?: string };
      if (!response.ok) throw new Error(data.error || 'The pull request was not created.');
      if (!this.mounted) return;
      this.commit({ isCreatingPR: false, prResult: data });
    } catch (error) {
      if (!this.mounted) return;
      this.commit({
        isCreatingPR: false,
        prError: error instanceof Error ? error.message : 'The pull request was not created.',
      });
    }
  };

  focusIssue = (issue: AccessibilityIssue) => {
    this.setState((state) => ({
      selectedIssue: state.selectedIssue?.id === issue.id ? null : issue,
      expandedIssueId: state.expandedIssueId === issue.id ? null : issue.id,
    }));
  };

  showChange = (issue: AccessibilityIssue) => {
    if (!issue.fix) return;
    this.setState({ selectedIssue: issue, expandedIssueId: issue.id, showDiff: true });
  };

  closeDiff = () => {
    this.setState({ showDiff: false });
  };

  reset = () => {
    this.runToken += 1;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.setState({
      isAuditing: false,
      auditResult: null,
      activityItems: [],
      selectedIssue: null,
      expandedIssueId: null,
      showDiff: false,
      isCreatingPR: false,
      prResult: null,
      prError: null,
    });
  };

  fixedCount(): number {
    return this.state.auditResult?.issues.filter((issue) => issue.fix).length ?? 0;
  }

  beforeMarkup(): string {
    if (this.state.demoMode) return demoHTML;
    return this.state.auditResult?.sourceHtml || '';
  }

  afterMarkup(): string {
    if (this.state.demoMode) return demoFixedHTML;
    return this.state.auditResult?.html || '';
  }

  render(): React.ReactNode {
    return null;
  }
}
