export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'notice';
  category: 'accessibility' | 'seo' | 'performance' | 'best-practices';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagRule?: string;
  element: string;
  selector: string;
  description: string;
  impact: string;
  fix?: CodeFix;
}

export interface CodeFix {
  file: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  lineNumber?: number;
}

export interface AuditResult {
  url: string;
  timestamp: string;
  scoreBefore: number;
  scoreAfter: number;
  issues: AccessibilityIssue[];
  fixes: CodeFix[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    byCategory: {
      accessibility: number;
      seo: number;
      performance: number;
      'best-practices': number;
    };
  };
  html?: string;
  sourceHtml?: string;
}

export interface AuditStreamEvent {
  type: 'progress' | 'issue' | 'fix' | 'score' | 'complete' | 'error';
  message?: string;
  data?: AccessibilityIssue | CodeFix | AuditResult | { before: number; after: number };
}

export interface PRResult {
  success: boolean;
  prUrl?: string;
  branch?: string;
  filesChanged?: number;
  error?: string;
}

export interface CreatePRRequest {
  repo: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  summary: string;
  issues: AccessibilityIssue[];
}
