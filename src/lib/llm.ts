import { AccessibilityIssue, CodeFix } from '@/types';

interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getLLMConfig(): LLMConfig | null {
  const xaiKey = process.env.XAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (xaiKey) {
    return {
      apiKey: xaiKey,
      baseUrl: 'https://api.x.ai/v1',
      model: 'grok-beta',
    };
  }

  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }

  return null;
}

async function callLLM(messages: Array<{ role: string; content: string }>, config: LLMConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function rankAndExplainIssues(
  issues: AccessibilityIssue[],
  html: string
): Promise<{ rankedIssues: AccessibilityIssue[]; llmAvailable: boolean }> {
  const config = getLLMConfig();

  if (!config) {
    const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    const sorted = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return { rankedIssues: sorted, llmAvailable: false };
  }

  try {
    const issuesSummary = issues.map((issue, i) => ({
      index: i,
      type: issue.type,
      severity: issue.severity,
      wcagRule: issue.wcagRule,
      description: issue.description,
      element: issue.element.substring(0, 100),
    }));

    const prompt = `You are an accessibility expert. Analyze these accessibility/SEO issues found on a webpage and:
1. Rank them by actual impact and ease of fix (most important first)
2. Provide a clearer, user-friendly explanation for each

Issues found:
${JSON.stringify(issuesSummary, null, 2)}

Respond with a JSON array where each object has:
- "index": original issue index
- "enhancedDescription": clearer explanation of the issue
- "enhancedImpact": why this matters to users

Only return valid JSON, no markdown.`;

    const response = await callLLM([{ role: 'user', content: prompt }], config);
    
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const enhanced = JSON.parse(cleaned) as Array<{
      index: number;
      enhancedDescription?: string;
      enhancedImpact?: string;
    }>;

    const rankedIssues = enhanced.map(e => {
      const original = issues[e.index];
      return {
        ...original,
        description: e.enhancedDescription || original.description,
        impact: e.enhancedImpact || original.impact,
      };
    });

    const includedIndices = new Set(enhanced.map(e => e.index));
    issues.forEach((issue, i) => {
      if (!includedIndices.has(i)) {
        rankedIssues.push(issue);
      }
    });

    return { rankedIssues, llmAvailable: true };
  } catch (error) {
    console.error('LLM ranking failed, using default sort:', error);
    const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    const sorted = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return { rankedIssues: sorted, llmAvailable: false };
  }
}

export async function generateLLMFixes(
  issues: AccessibilityIssue[],
  html: string
): Promise<{ fixes: CodeFix[]; llmAvailable: boolean }> {
  const config = getLLMConfig();

  if (!config) {
    return { fixes: [], llmAvailable: false };
  }

  try {
    const fixableIssues = issues.filter(i => 
      i.severity === 'critical' || i.severity === 'serious'
    ).slice(0, 10);

    if (fixableIssues.length === 0) {
      return { fixes: [], llmAvailable: true };
    }

    const prompt = `You are an accessibility expert. Generate code fixes for these accessibility issues.

HTML snippet (truncated):
${html.substring(0, 3000)}

Issues to fix:
${JSON.stringify(fixableIssues.map(i => ({
  id: i.id,
  description: i.description,
  element: i.element,
  selector: i.selector,
  wcagRule: i.wcagRule,
})), null, 2)}

For each issue, provide a fix. Respond with a JSON array where each object has:
- "issueId": the issue id
- "file": "index.html"
- "originalCode": the exact code that needs changing (from the element field)
- "fixedCode": the corrected code
- "explanation": brief explanation of the fix

Only return valid JSON, no markdown. Focus on practical, minimal fixes.`;

    const response = await callLLM([{ role: 'user', content: prompt }], config);
    
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const llmFixes = JSON.parse(cleaned) as Array<{
      issueId: string;
      file: string;
      originalCode: string;
      fixedCode: string;
      explanation: string;
    }>;

    const fixes: CodeFix[] = llmFixes.map(f => ({
      file: f.file || 'index.html',
      originalCode: f.originalCode,
      fixedCode: f.fixedCode,
      explanation: f.explanation,
    }));

    fixableIssues.forEach((issue, i) => {
      if (fixes[i]) {
        issue.fix = fixes[i];
      }
    });

    return { fixes, llmAvailable: true };
  } catch (error) {
    console.error('LLM fix generation failed:', error);
    return { fixes: [], llmAvailable: false };
  }
}

export async function generateFixedHTML(
  html: string,
  issues: AccessibilityIssue[],
  fixes: CodeFix[]
): Promise<{ fixedHtml: string; llmAvailable: boolean }> {
  const config = getLLMConfig();

  if (!config || fixes.length === 0) {
    let fixedHtml = html;
    for (const fix of fixes) {
      if (fix.originalCode && fix.fixedCode) {
        fixedHtml = fixedHtml.replace(fix.originalCode, fix.fixedCode);
      }
    }
    return { fixedHtml, llmAvailable: false };
  }

  try {
    const prompt = `You are an accessibility expert. Apply these fixes to the HTML:

Original HTML:
${html}

Fixes to apply:
${JSON.stringify(fixes, null, 2)}

Return ONLY the complete fixed HTML with all fixes applied. No explanations, just the HTML.`;

    const response = await callLLM([{ role: 'user', content: prompt }], config);
    
    const fixedHtml = response.replace(/```html\n?|\n?```/g, '').trim();
    
    if (fixedHtml.includes('<html') || fixedHtml.includes('<!DOCTYPE')) {
      return { fixedHtml, llmAvailable: true };
    }

    let manualFixedHtml = html;
    for (const fix of fixes) {
      if (fix.originalCode && fix.fixedCode) {
        manualFixedHtml = manualFixedHtml.replace(fix.originalCode, fix.fixedCode);
      }
    }
    return { fixedHtml: manualFixedHtml, llmAvailable: true };
  } catch (error) {
    console.error('LLM HTML generation failed:', error);
    let fixedHtml = html;
    for (const fix of fixes) {
      if (fix.originalCode && fix.fixedCode) {
        fixedHtml = fixedHtml.replace(fix.originalCode, fix.fixedCode);
      }
    }
    return { fixedHtml, llmAvailable: false };
  }
}
