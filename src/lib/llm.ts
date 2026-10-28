import { AccessibilityIssue, CodeFix } from '@/types';

type LLMProvider = 'anthropic' | 'xai' | 'openai';

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getLLMConfig(): LLMConfig | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const xaiKey = process.env.XAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    return {
      provider: 'anthropic',
      apiKey: anthropicKey,
      baseUrl: 'https://api.anthropic.com/v1',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250514',
    };
  }

  if (xaiKey) {
    return {
      provider: 'xai',
      apiKey: xaiKey,
      baseUrl: 'https://api.x.ai/v1',
      model: 'grok-beta',
    };
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }

  return null;
}

async function callLLM(
  messages: Array<{ role: string; content: string }>,
  config: LLMConfig
): Promise<string> {
  if (config.provider === 'anthropic') {
    return callAnthropic(messages, config);
  }
  return callOpenAICompatible(messages, config);
}

async function callAnthropic(
  messages: Array<{ role: string; content: string }>,
  config: LLMConfig
): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${config.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 8192,
      system: systemMessage?.content || 'You are an expert accessibility and SEO consultant.',
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text');
  return textBlock?.text || '';
}

async function callOpenAICompatible(
  messages: Array<{ role: string; content: string }>,
  config: LLMConfig
): Promise<string> {
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
      element: issue.element.substring(0, 150),
    }));

    const systemPrompt = `You are an expert web accessibility consultant. Your task is to analyze accessibility and SEO issues, rank them by real-world impact, and provide clear explanations that non-technical stakeholders can understand.`;

    const userPrompt = `Analyze these accessibility/SEO issues found on a webpage:

${JSON.stringify(issuesSummary, null, 2)}

Rank them by:
1. Actual impact on users with disabilities
2. SEO importance
3. Ease of fix (quick wins first among equal severity)

For each issue, provide:
- A clearer, jargon-free explanation
- The real-world impact on users

Respond with a JSON array where each object has:
- "index": original issue index (number)
- "enhancedDescription": clearer explanation (string)
- "enhancedImpact": why this matters to real users (string)

Return ONLY valid JSON, no markdown code fences or explanations.`;

    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], config);

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

    const systemPrompt = `You are an expert web accessibility engineer. Generate precise, context-aware fixes for accessibility issues.

CRITICAL RULES:
1. NEVER use placeholder text like "[Field label]", "[Description]", "[Alt text]", etc.
2. ALWAYS infer meaningful text from context: surrounding text, placeholder attributes, nearby headings, form context, image filename/URL, page content
3. For images: Describe what the image likely shows based on its filename, URL path, or surrounding content
4. For form fields: Use the placeholder text, nearby labels, or field purpose as the label
5. For buttons: Infer purpose from surrounding text, form context, or icon meaning
6. For links: Make link text describe the destination based on href and context
7. Keep fixes minimal - only change what's necessary to fix the issue`;

    const userPrompt = `Fix these accessibility issues. The HTML context is provided to help you infer appropriate labels, alt text, and descriptions.

PAGE HTML (for context):
${html.substring(0, 6000)}

ISSUES TO FIX:
${JSON.stringify(fixableIssues.map(i => ({
  id: i.id,
  description: i.description,
  element: i.element,
  selector: i.selector,
  wcagRule: i.wcagRule,
})), null, 2)}

Generate fixes with REAL, CONTEXTUAL text - no placeholders. Respond with a JSON array where each object has:
- "issueId": the issue id
- "file": "index.html"
- "originalCode": the exact code that needs changing
- "fixedCode": the corrected code with real, meaningful text inferred from context
- "explanation": brief explanation of what you changed and why

Return ONLY valid JSON, no markdown code fences.`;

    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], config);

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
  if (fixes.length === 0) {
    return { fixedHtml: html, llmAvailable: false };
  }

  let fixedHtml = html;
  for (const fix of fixes) {
    if (fix.originalCode && fix.fixedCode) {
      fixedHtml = fixedHtml.replace(fix.originalCode, fix.fixedCode);
    }
  }
  return { fixedHtml, llmAvailable: true };
}
