import { AccessibilityIssue, CodeFix } from '@/types';

interface DocumentLike {
  querySelectorAll(selectors: string): NodeListOf<Element>;
  querySelector(selectors: string): Element | null;
  documentElement: Element;
}

export interface RuleCheck {
  id: string;
  name: string;
  category: 'accessibility' | 'seo' | 'performance' | 'best-practices';
  wcagRule?: string;
  check: (doc: DocumentLike) => AccessibilityIssue[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (classes.length > 0) return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
  }
  return element.tagName.toLowerCase();
}

function getOuterHTMLSnippet(element: Element): string {
  const html = element.outerHTML;
  if (html.length > 200) {
    return html.substring(0, 200) + '...';
  }
  return html;
}

export const accessibilityRules: RuleCheck[] = [
  {
    id: 'img-alt',
    name: 'Images must have alt text',
    category: 'accessibility',
    wcagRule: 'WCAG 1.1.1',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const images = doc.querySelectorAll('img');
      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        if (alt === null) {
          issues.push({
            id: generateId(),
            type: 'error',
            category: 'accessibility',
            severity: 'critical',
            wcagRule: 'WCAG 1.1.1',
            element: getOuterHTMLSnippet(img),
            selector: getSelector(img),
            description: 'Image is missing alt attribute',
            impact: 'Screen reader users will not know what this image represents',
          });
        } else if (alt.trim() === '') {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'accessibility',
            severity: 'moderate',
            wcagRule: 'WCAG 1.1.1',
            element: getOuterHTMLSnippet(img),
            selector: getSelector(img),
            description: 'Image has empty alt text - ensure this is decorative',
            impact: 'If not decorative, screen reader users will miss important content',
          });
        }
      });
      return issues;
    },
  },
  {
    id: 'form-labels',
    name: 'Form inputs must have labels',
    category: 'accessibility',
    wcagRule: 'WCAG 1.3.1',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const inputs = doc.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        const type = input.getAttribute('type');
        if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'image') return;
        
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const title = input.getAttribute('title');
        const placeholder = input.getAttribute('placeholder');
        
        let hasLabel = false;
        if (id) {
          const label = doc.querySelector(`label[for="${id}"]`);
          if (label) hasLabel = true;
        }
        
        const parent = input.parentElement;
        if (parent?.tagName === 'LABEL') hasLabel = true;
        
        if (!hasLabel && !ariaLabel && !ariaLabelledBy && !title) {
          issues.push({
            id: generateId(),
            type: 'error',
            category: 'accessibility',
            severity: 'serious',
            wcagRule: 'WCAG 1.3.1',
            element: getOuterHTMLSnippet(input),
            selector: getSelector(input),
            description: `Form ${input.tagName.toLowerCase()} is missing a label`,
            impact: 'Screen reader users will not understand the purpose of this form field',
          });
        } else if (!hasLabel && !ariaLabel && !ariaLabelledBy && placeholder) {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'accessibility',
            severity: 'moderate',
            wcagRule: 'WCAG 1.3.1',
            element: getOuterHTMLSnippet(input),
            selector: getSelector(input),
            description: 'Form field uses placeholder as only label',
            impact: 'Placeholder text disappears when typing, making it harder for users to remember the field purpose',
          });
        }
      });
      return issues;
    },
  },
  {
    id: 'button-names',
    name: 'Buttons must have accessible names',
    category: 'accessibility',
    wcagRule: 'WCAG 4.1.2',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const buttons = doc.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]');
      buttons.forEach((button) => {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');
        const title = button.getAttribute('title');
        const value = button.getAttribute('value');
        
        if (!text && !ariaLabel && !ariaLabelledBy && !title && !value) {
          issues.push({
            id: generateId(),
            type: 'error',
            category: 'accessibility',
            severity: 'serious',
            wcagRule: 'WCAG 4.1.2',
            element: getOuterHTMLSnippet(button),
            selector: getSelector(button),
            description: 'Button does not have an accessible name',
            impact: 'Screen reader users will not know what this button does',
          });
        }
      });
      return issues;
    },
  },
  {
    id: 'link-text',
    name: 'Links must have descriptive text',
    category: 'accessibility',
    wcagRule: 'WCAG 2.4.4',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const links = doc.querySelectorAll('a[href]');
      const genericTexts = ['click here', 'here', 'read more', 'learn more', 'more', 'link'];
      
      links.forEach((link) => {
        const text = link.textContent?.trim().toLowerCase();
        const ariaLabel = link.getAttribute('aria-label');
        
        if (!text && !ariaLabel) {
          const img = link.querySelector('img');
          if (!img || !img.getAttribute('alt')) {
            issues.push({
              id: generateId(),
              type: 'error',
              category: 'accessibility',
              severity: 'serious',
              wcagRule: 'WCAG 2.4.4',
              element: getOuterHTMLSnippet(link),
              selector: getSelector(link),
              description: 'Link has no accessible text',
              impact: 'Screen reader users will not know where this link goes',
            });
          }
        } else if (text && genericTexts.includes(text) && !ariaLabel) {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'accessibility',
            severity: 'moderate',
            wcagRule: 'WCAG 2.4.4',
            element: getOuterHTMLSnippet(link),
            selector: getSelector(link),
            description: `Link text "${text}" is not descriptive`,
            impact: 'Users may not understand the link destination without surrounding context',
          });
        }
      });
      return issues;
    },
  },
  {
    id: 'lang-attribute',
    name: 'HTML must have lang attribute',
    category: 'accessibility',
    wcagRule: 'WCAG 3.1.1',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const html = doc.documentElement;
      const lang = html.getAttribute('lang');
      
      if (!lang) {
        issues.push({
          id: generateId(),
          type: 'error',
          category: 'accessibility',
          severity: 'serious',
          wcagRule: 'WCAG 3.1.1',
          element: '<html>',
          selector: 'html',
          description: 'HTML element is missing lang attribute',
          impact: 'Screen readers may not announce content in the correct language',
        });
      } else if (lang.trim() === '') {
        issues.push({
          id: generateId(),
          type: 'error',
          category: 'accessibility',
          severity: 'serious',
          wcagRule: 'WCAG 3.1.1',
          element: '<html lang="">',
          selector: 'html',
          description: 'HTML lang attribute is empty',
          impact: 'Screen readers may not announce content in the correct language',
        });
      }
      return issues;
    },
  },
  {
    id: 'heading-order',
    name: 'Headings must be in logical order',
    category: 'accessibility',
    wcagRule: 'WCAG 1.3.1',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      let h1Count = 0;
      
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        if (level === 1) h1Count++;
        
        if (lastLevel > 0 && level > lastLevel + 1) {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'accessibility',
            severity: 'moderate',
            wcagRule: 'WCAG 1.3.1',
            element: getOuterHTMLSnippet(heading),
            selector: getSelector(heading),
            description: `Heading level skipped from h${lastLevel} to h${level}`,
            impact: 'Users navigating by headings may be confused by the document structure',
          });
        }
        lastLevel = level;
      });
      
      if (h1Count === 0) {
        issues.push({
          id: generateId(),
          type: 'warning',
          category: 'accessibility',
          severity: 'moderate',
          wcagRule: 'WCAG 1.3.1',
          element: 'document',
          selector: 'html',
          description: 'Page is missing an h1 heading',
          impact: 'The page lacks a main heading for screen reader users to understand page purpose',
        });
      } else if (h1Count > 1) {
        issues.push({
          id: generateId(),
          type: 'notice',
          category: 'accessibility',
          severity: 'minor',
          wcagRule: 'WCAG 1.3.1',
          element: 'document',
          selector: 'html',
          description: `Page has ${h1Count} h1 headings`,
          impact: 'Consider using only one h1 for clearer page structure',
        });
      }
      
      return issues;
    },
  },
  {
    id: 'clickable-divs',
    name: 'Clickable elements should be buttons or links',
    category: 'accessibility',
    wcagRule: 'WCAG 4.1.2',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const clickable = doc.querySelectorAll('[onclick], [onkeypress]');
      
      clickable.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute('role');
        
        if (tag !== 'button' && tag !== 'a' && tag !== 'input' && role !== 'button' && role !== 'link') {
          const hasTabIndex = el.hasAttribute('tabindex');
          
          issues.push({
            id: generateId(),
            type: 'error',
            category: 'accessibility',
            severity: 'serious',
            wcagRule: 'WCAG 4.1.2',
            element: getOuterHTMLSnippet(el),
            selector: getSelector(el),
            description: `Clickable ${tag} should be a button or link element`,
            impact: `Keyboard users ${hasTabIndex ? 'can focus but may not activate' : 'cannot access'} this interactive element`,
          });
        }
      });
      return issues;
    },
  },
  {
    id: 'meta-viewport',
    name: 'Viewport meta must not disable scaling',
    category: 'accessibility',
    wcagRule: 'WCAG 1.4.4',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const viewport = doc.querySelector('meta[name="viewport"]');
      
      if (!viewport) {
        issues.push({
          id: generateId(),
          type: 'warning',
          category: 'accessibility',
          severity: 'moderate',
          wcagRule: 'WCAG 1.4.4',
          element: '<meta name="viewport">',
          selector: 'meta[name="viewport"]',
          description: 'Page is missing viewport meta tag',
          impact: 'Page may not display correctly on mobile devices',
        });
      } else {
        const content = viewport.getAttribute('content') || '';
        if (content.includes('user-scalable=no') || content.includes('user-scalable=0')) {
          issues.push({
            id: generateId(),
            type: 'error',
            category: 'accessibility',
            severity: 'critical',
            wcagRule: 'WCAG 1.4.4',
            element: getOuterHTMLSnippet(viewport),
            selector: 'meta[name="viewport"]',
            description: 'Viewport disables user scaling',
            impact: 'Users with low vision cannot zoom the page',
          });
        }
        const maxScaleMatch = content.match(/maximum-scale=([0-9.]+)/);
        if (maxScaleMatch && parseFloat(maxScaleMatch[1]) < 2) {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'accessibility',
            severity: 'serious',
            wcagRule: 'WCAG 1.4.4',
            element: getOuterHTMLSnippet(viewport),
            selector: 'meta[name="viewport"]',
            description: 'Viewport maximum-scale limits zooming',
            impact: 'Users with low vision may not be able to zoom enough',
          });
        }
      }
      return issues;
    },
  },
  {
    id: 'meta-title',
    name: 'Page must have a title',
    category: 'seo',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const title = doc.querySelector('title');
      
      if (!title || !title.textContent?.trim()) {
        issues.push({
          id: generateId(),
          type: 'error',
          category: 'seo',
          severity: 'critical',
          element: '<title>',
          selector: 'title',
          description: 'Page is missing a title',
          impact: 'Search engines and browsers need a title for proper display',
        });
      } else if (title.textContent.trim().length < 10) {
        issues.push({
          id: generateId(),
          type: 'warning',
          category: 'seo',
          severity: 'moderate',
          element: getOuterHTMLSnippet(title),
          selector: 'title',
          description: 'Page title is too short',
          impact: 'A descriptive title improves SEO and user understanding',
        });
      }
      return issues;
    },
  },
  {
    id: 'meta-description',
    name: 'Page should have meta description',
    category: 'seo',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const description = doc.querySelector('meta[name="description"]');
      
      if (!description) {
        issues.push({
          id: generateId(),
          type: 'warning',
          category: 'seo',
          severity: 'moderate',
          element: '<meta name="description">',
          selector: 'meta[name="description"]',
          description: 'Page is missing meta description',
          impact: 'Search engines use meta descriptions for search result snippets',
        });
      } else {
        const content = description.getAttribute('content')?.trim();
        if (!content) {
          issues.push({
            id: generateId(),
            type: 'warning',
            category: 'seo',
            severity: 'moderate',
            element: getOuterHTMLSnippet(description),
            selector: 'meta[name="description"]',
            description: 'Meta description is empty',
            impact: 'Search engines need a description for search result snippets',
          });
        } else if (content.length < 50) {
          issues.push({
            id: generateId(),
            type: 'notice',
            category: 'seo',
            severity: 'minor',
            element: getOuterHTMLSnippet(description),
            selector: 'meta[name="description"]',
            description: 'Meta description is too short (less than 50 characters)',
            impact: 'Longer descriptions provide more context for search engines',
          });
        }
      }
      return issues;
    },
  },
  {
    id: 'og-tags',
    name: 'Page should have Open Graph tags',
    category: 'seo',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const ogTags = ['og:title', 'og:description', 'og:image'];
      const missing: string[] = [];
      
      ogTags.forEach((tag) => {
        const meta = doc.querySelector(`meta[property="${tag}"]`);
        if (!meta || !meta.getAttribute('content')?.trim()) {
          missing.push(tag);
        }
      });
      
      if (missing.length > 0) {
        issues.push({
          id: generateId(),
          type: 'notice',
          category: 'seo',
          severity: 'minor',
          element: `<meta property="${missing[0]}">`,
          selector: 'head',
          description: `Missing Open Graph tags: ${missing.join(', ')}`,
          impact: 'Social media shares will not display rich previews',
        });
      }
      return issues;
    },
  },
  {
    id: 'color-contrast',
    name: 'Text should have sufficient color contrast',
    category: 'accessibility',
    wcagRule: 'WCAG 1.4.3',
    check: (doc) => {
      const issues: AccessibilityIssue[] = [];
      const potentialLowContrast = doc.querySelectorAll('[style*="color"], [style*="background"]');
      
      potentialLowContrast.forEach((el) => {
        const style = el.getAttribute('style') || '';
        const colorMatch = style.match(/color:\s*([^;]+)/);
        const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/);
        
        if (colorMatch && bgMatch) {
          const color = colorMatch[1].trim().toLowerCase();
          const bg = bgMatch[1].trim().toLowerCase();
          
          const lightColors = ['white', '#fff', '#ffffff', 'rgb(255, 255, 255)', '#f0f0f0', '#fafafa', 'lightgray', '#d3d3d3'];
          const darkColors = ['black', '#000', '#000000', 'rgb(0, 0, 0)', '#333', '#1a1a1a', '#222'];
          
          const isLightOnLight = lightColors.some(c => color.includes(c)) && lightColors.some(c => bg.includes(c));
          const isDarkOnDark = darkColors.some(c => color.includes(c)) && darkColors.some(c => bg.includes(c));
          
          if (isLightOnLight || isDarkOnDark) {
            issues.push({
              id: generateId(),
              type: 'warning',
              category: 'accessibility',
              severity: 'serious',
              wcagRule: 'WCAG 1.4.3',
              element: getOuterHTMLSnippet(el),
              selector: getSelector(el),
              description: 'Potential low color contrast detected',
              impact: 'Users with low vision may have difficulty reading this text',
            });
          }
        }
      });
      return issues;
    },
  },
];

export function generateDeterministicFix(issue: AccessibilityIssue, html: string): CodeFix | null {
  const fixes: Record<string, (issue: AccessibilityIssue, html: string) => CodeFix | null> = {
    'img-alt': (issue, html) => {
      if (issue.description.includes('missing alt')) {
        const imgMatch = html.match(new RegExp(`<img[^>]*${escapeRegex(issue.selector.replace('#', 'id="').replace('.', 'class="'))}[^>]*>`, 'i'));
        if (imgMatch) {
          const original = imgMatch[0];
          const fixed = original.replace(/<img/, '<img alt="[Descriptive image text]"');
          return {
            file: 'index.html',
            originalCode: original,
            fixedCode: fixed,
            explanation: 'Added alt attribute to image for screen reader accessibility',
          };
        }
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: issue.element.replace(/<img/, '<img alt="[Descriptive image text]"'),
          explanation: 'Added alt attribute to image for screen reader accessibility',
        };
      }
      return null;
    },
    'form-labels': (issue) => {
      const inputMatch = issue.element.match(/<(input|select|textarea)[^>]*>/i);
      if (inputMatch) {
        const original = inputMatch[0];
        const inputId = `input-${Math.random().toString(36).substring(2, 8)}`;
        const fixed = original.replace(/<(input|select|textarea)/, `<$1 id="${inputId}" aria-label="[Field description]"`);
        return {
          file: 'index.html',
          originalCode: original,
          fixedCode: `<label for="${inputId}">[Field label]</label>\n${fixed}`,
          explanation: 'Added associated label element for form field accessibility',
        };
      }
      return null;
    },
    'button-names': (issue) => {
      return {
        file: 'index.html',
        originalCode: issue.element,
        fixedCode: issue.element.replace(/<button/, '<button aria-label="[Button description]"'),
        explanation: 'Added aria-label to button for screen reader accessibility',
      };
    },
    'link-text': (issue) => {
      if (issue.description.includes('no accessible text')) {
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: issue.element.replace(/<a/, '<a aria-label="[Link destination description]"'),
          explanation: 'Added aria-label to link for screen reader accessibility',
        };
      }
      return null;
    },
    'lang-attribute': (issue) => {
      if (issue.description.includes('missing lang')) {
        return {
          file: 'index.html',
          originalCode: '<html>',
          fixedCode: '<html lang="en">',
          explanation: 'Added lang attribute to HTML element for screen reader language detection',
        };
      }
      if (issue.description.includes('empty')) {
        return {
          file: 'index.html',
          originalCode: '<html lang="">',
          fixedCode: '<html lang="en">',
          explanation: 'Set lang attribute value for screen reader language detection',
        };
      }
      return null;
    },
    'meta-viewport': (issue) => {
      if (issue.description.includes('missing viewport')) {
        return {
          file: 'index.html',
          originalCode: '<head>',
          fixedCode: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">',
          explanation: 'Added viewport meta tag for responsive design',
        };
      }
      if (issue.description.includes('disables')) {
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          explanation: 'Removed user-scalable=no to allow zooming for accessibility',
        };
      }
      return null;
    },
    'meta-title': (issue) => {
      if (issue.description.includes('missing')) {
        return {
          file: 'index.html',
          originalCode: '<head>',
          fixedCode: '<head>\n  <title>[Page Title - Site Name]</title>',
          explanation: 'Added title element for SEO and accessibility',
        };
      }
      return null;
    },
    'meta-description': (issue) => {
      if (issue.description.includes('missing')) {
        return {
          file: 'index.html',
          originalCode: '<head>',
          fixedCode: '<head>\n  <meta name="description" content="[A descriptive summary of this page content for search engines]">',
          explanation: 'Added meta description for SEO',
        };
      }
      return null;
    },
    'og-tags': (issue) => {
      const missing = issue.description.match(/Missing Open Graph tags: (.+)/)?.[1] || '';
      const tags = missing.split(', ').map(tag => {
        const defaults: Record<string, string> = {
          'og:title': '[Page Title]',
          'og:description': '[Page description for social sharing]',
          'og:image': '[https://example.com/image.jpg]',
        };
        return `<meta property="${tag}" content="${defaults[tag] || '[value]'}">`;
      }).join('\n  ');
      
      return {
        file: 'index.html',
        originalCode: '<head>',
        fixedCode: `<head>\n  ${tags}`,
        explanation: 'Added Open Graph meta tags for rich social media previews',
      };
    },
    'clickable-divs': (issue) => {
      return {
        file: 'index.html',
        originalCode: issue.element,
        fixedCode: issue.element.replace(/<div/, '<button type="button"').replace(/<\/div>/, '</button>'),
        explanation: 'Changed clickable div to button element for keyboard accessibility',
      };
    },
  };

  const ruleId = Object.keys(fixes).find(key => issue.id.startsWith(key) || issue.description.toLowerCase().includes(key.replace('-', ' ')));
  
  for (const [key, fixFn] of Object.entries(fixes)) {
    if (issue.wcagRule?.includes(key) || issue.description.toLowerCase().includes(key.replace(/-/g, ' ')) || 
        issue.selector.includes(key) || key === getRuleIdFromIssue(issue)) {
      const fix = fixFn(issue, html);
      if (fix) return fix;
    }
  }
  
  return null;
}

function getRuleIdFromIssue(issue: AccessibilityIssue): string {
  if (issue.selector.includes('img') || issue.description.includes('alt')) return 'img-alt';
  if (issue.selector.includes('input') || issue.selector.includes('select') || issue.description.includes('label')) return 'form-labels';
  if (issue.selector.includes('button') || issue.description.includes('button')) return 'button-names';
  if (issue.selector.includes('a[href]') || issue.description.includes('link')) return 'link-text';
  if (issue.selector === 'html' && issue.description.includes('lang')) return 'lang-attribute';
  if (issue.selector.includes('viewport')) return 'meta-viewport';
  if (issue.selector === 'title' || issue.description.includes('title')) return 'meta-title';
  if (issue.selector.includes('description')) return 'meta-description';
  if (issue.description.includes('Open Graph')) return 'og-tags';
  if (issue.description.includes('div') && issue.description.includes('button')) return 'clickable-divs';
  return '';
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function calculateScore(issues: AccessibilityIssue[]): number {
  const weights = { critical: 25, serious: 15, moderate: 8, minor: 3 };
  const deductions = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 5), 0);
  return Math.max(0, Math.min(100, 100 - deductions));
}
