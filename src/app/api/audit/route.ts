import { NextRequest } from 'next/server';
import { parseHTML } from 'linkedom';
import { accessibilityRules, generateDeterministicFix, calculateScore } from '@/lib/accessibility-rules';
import { rankAndExplainIssues, generateLLMFixes, generateFixedHTML } from '@/lib/llm';
import { AccessibilityIssue, AuditStreamEvent, CodeFix } from '@/types';

export const runtime = 'nodejs';

function createSSEEncoder() {
  const encoder = new TextEncoder();
  return {
    encode: (event: AuditStreamEvent) => {
      return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const sse = createSSEEncoder();

    const sendEvent = async (event: AuditStreamEvent) => {
      await writer.write(sse.encode(event));
    };

    (async () => {
      try {
        await sendEvent({ type: 'progress', message: 'Fetching webpage...' });

        let html: string;
        try {
          const response = await fetch(targetUrl.href, {
            headers: {
              'User-Agent': 'FixIt-Accessibility-Auditor/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }

          html = await response.text();
        } catch (fetchError) {
          await sendEvent({
            type: 'error',
            message: `Failed to fetch webpage: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
          });
          await writer.close();
          return;
        }

        await sendEvent({ type: 'progress', message: 'Parsing HTML document...' });

        const { document } = parseHTML(html);

        await sendEvent({ type: 'progress', message: 'Running accessibility checks...' });

        const issues: AccessibilityIssue[] = [];

        for (const rule of accessibilityRules) {
          await sendEvent({ type: 'progress', message: `Checking: ${rule.name}` });
          
          try {
            const ruleIssues = rule.check(document);
            for (const issue of ruleIssues) {
              issues.push(issue);
              await sendEvent({ type: 'issue', data: issue });
            }
          } catch (ruleError) {
            console.error(`Rule ${rule.id} failed:`, ruleError);
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        }

        await sendEvent({ type: 'progress', message: `Found ${issues.length} issues. Analyzing severity...` });

        const { rankedIssues, llmAvailable } = await rankAndExplainIssues(issues, html);

        await sendEvent({
          type: 'progress',
          message: llmAvailable
            ? 'AI analysis complete. Generating fixes...'
            : 'Using rule-based analysis. Generating fixes...',
        });

        const scoreBefore = calculateScore(rankedIssues);

        const fixes: CodeFix[] = [];
        
        if (llmAvailable) {
          const { fixes: llmFixes } = await generateLLMFixes(rankedIssues, html);
          fixes.push(...llmFixes);
        }

        for (const issue of rankedIssues) {
          if (!issue.fix) {
            const deterministicFix = generateDeterministicFix(issue, html);
            if (deterministicFix) {
              issue.fix = deterministicFix;
              fixes.push(deterministicFix);
            }
          }
        }

        for (const fix of fixes) {
          await sendEvent({ type: 'fix', data: fix });
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const issuesAfterFixes = rankedIssues.filter(i => !i.fix);
        const scoreAfter = calculateScore(issuesAfterFixes);

        await sendEvent({
          type: 'score',
          data: { before: scoreBefore, after: scoreAfter },
        });

        const { fixedHtml } = await generateFixedHTML(html, rankedIssues, fixes);

        const summary = {
          total: rankedIssues.length,
          critical: rankedIssues.filter(i => i.severity === 'critical').length,
          serious: rankedIssues.filter(i => i.severity === 'serious').length,
          moderate: rankedIssues.filter(i => i.severity === 'moderate').length,
          minor: rankedIssues.filter(i => i.severity === 'minor').length,
          byCategory: {
            accessibility: rankedIssues.filter(i => i.category === 'accessibility').length,
            seo: rankedIssues.filter(i => i.category === 'seo').length,
            performance: rankedIssues.filter(i => i.category === 'performance').length,
            'best-practices': rankedIssues.filter(i => i.category === 'best-practices').length,
          },
        };

        await sendEvent({
          type: 'complete',
          data: {
            url: targetUrl.href,
            timestamp: new Date().toISOString(),
            scoreBefore,
            scoreAfter,
            issues: rankedIssues,
            fixes,
            summary,
            html: fixedHtml,
            sourceHtml: html,
          },
        });
      } catch (error) {
        console.error('Audit error:', error);
        await sendEvent({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Request error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
