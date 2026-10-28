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

function inferAltText(element: string, html: string): string {
  const srcMatch = element.match(/src=["']([^"']+)["']/i);
  if (srcMatch) {
    const src = srcMatch[1];

    const seedMatch = src.match(/seed\/([a-zA-Z][a-zA-Z0-9_-]*)/i);
    if (seedMatch) {
      const seed = seedMatch[1].replace(/[-_]/g, ' ').replace(/\d+$/, '').trim();
      if (seed.length > 1) {
        const formatted = seed.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        return formatted + ' image';
      }
    }

    const picsumMatch = src.match(/picsum\.photos/i);
    if (picsumMatch && !seedMatch) {
      return 'Stock photo';
    }

    const pathParts = src.split('/').filter(p => p && !p.match(/^\d+$/) && !p.includes('.'));
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i];
      if (part && part.length > 2 && !part.match(/^(http|https|www|images?|img|assets?|static|uploads?|media|seed|\d+x\d+)$/i)) {
        const readable = part.replace(/[-_]/g, ' ').replace(/\d+$/g, '').trim();
        if (readable.length > 2) {
          const formatted = readable.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          return formatted + ' image';
        }
      }
    }

    const filename = src.split('/').pop()?.split('?')[0] || '';
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\d+/g, ' ').trim();
    
    if (nameWithoutExt && nameWithoutExt.length > 2 && !nameWithoutExt.match(/^(img|image|photo|pic)$/i)) {
      const formatted = nameWithoutExt.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      return formatted + ' image';
    }
  }

  const classMatch = element.match(/class=["']([^"']+)["']/i);
  if (classMatch) {
    const classes = classMatch[1].split(/\s+/);
    for (const cls of classes) {
      if (cls.includes('hero') || cls.includes('banner')) return 'Hero banner image';
      if (cls.includes('logo')) return 'Company logo';
      if (cls.includes('avatar') || cls.includes('profile')) return 'User profile picture';
      if (cls.includes('icon')) return 'Decorative icon';
      if (cls.includes('product')) return 'Product image';
      if (cls.includes('thumbnail') || cls.includes('thumb')) return 'Thumbnail image';
      if (cls.includes('card')) return 'Card image';
      if (cls.includes('cover')) return 'Cover image';
      if (cls.includes('background') || cls.includes('bg')) return 'Background image';
    }
  }

  return 'Decorative image';
}

function inferFormLabel(element: string): string {
  const placeholderMatch = element.match(/placeholder=["']([^"']+)["']/i);
  if (placeholderMatch) {
    const placeholder = placeholderMatch[1];
    return placeholder.charAt(0).toUpperCase() + placeholder.slice(1);
  }

  const nameMatch = element.match(/name=["']([^"']+)["']/i);
  if (nameMatch) {
    const name = nameMatch[1].replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  const typeMatch = element.match(/type=["']([^"']+)["']/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase();
    const typeLabels: Record<string, string> = {
      'email': 'Email address',
      'password': 'Password',
      'tel': 'Phone number',
      'url': 'Website URL',
      'search': 'Search',
      'number': 'Number',
      'date': 'Date',
      'time': 'Time',
      'file': 'File upload',
      'text': 'Text input',
    };
    if (typeLabels[type]) return typeLabels[type];
  }

  const idMatch = element.match(/id=["']([^"']+)["']/i);
  if (idMatch) {
    const id = idMatch[1].replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  return 'Input field';
}

function inferButtonLabel(element: string, html: string): string {
  const innerMatch = element.match(/>([^<]*)</);
  if (innerMatch && innerMatch[1].trim()) {
    const text = innerMatch[1].trim();
    if (text && !text.match(/^[\s☰×✕✖✗]+$/)) {
      return text;
    }
  }

  if (element.includes('☰') || element.toLowerCase().includes('menu') || element.toLowerCase().includes('hamburger')) {
    return 'Open navigation menu';
  }
  if (element.includes('×') || element.includes('✕') || element.includes('✖') || element.includes('close')) {
    return 'Close';
  }
  if (element.toLowerCase().includes('submit')) return 'Submit form';
  if (element.toLowerCase().includes('search')) return 'Search';
  if (element.toLowerCase().includes('cart') || element.toLowerCase().includes('bag')) return 'Shopping cart';
  if (element.toLowerCase().includes('add')) return 'Add item';
  if (element.toLowerCase().includes('delete') || element.toLowerCase().includes('remove')) return 'Remove item';

  const classMatch = element.match(/class=["']([^"']+)["']/i);
  if (classMatch) {
    const classes = classMatch[1].toLowerCase();
    if (classes.includes('close')) return 'Close';
    if (classes.includes('submit')) return 'Submit';
    if (classes.includes('cancel')) return 'Cancel';
    if (classes.includes('save')) return 'Save';
    if (classes.includes('edit')) return 'Edit';
    if (classes.includes('delete')) return 'Delete';
    if (classes.includes('next')) return 'Next';
    if (classes.includes('prev')) return 'Previous';
    if (classes.includes('play')) return 'Play';
    if (classes.includes('pause')) return 'Pause';
  }

  return 'Interactive button';
}

function inferLinkDestination(element: string): string {
  const hrefMatch = element.match(/href=["']([^"']+)["']/i);
  if (hrefMatch) {
    const href = hrefMatch[1];
    if (href === '#' || href === '') return 'Navigate to section';
    if (href.startsWith('mailto:')) return 'Send email';
    if (href.startsWith('tel:')) return 'Call phone number';
    if (href.includes('facebook')) return 'Visit Facebook page';
    if (href.includes('twitter') || href.includes('x.com')) return 'Visit Twitter/X profile';
    if (href.includes('linkedin')) return 'Visit LinkedIn profile';
    if (href.includes('instagram')) return 'Visit Instagram profile';
    if (href.includes('github')) return 'Visit GitHub repository';

    const path = href.split('?')[0].split('#')[0];
    const lastSegment = path.split('/').filter(Boolean).pop();
    if (lastSegment) {
      const readable = lastSegment.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
      if (readable.length > 1) {
        return 'Go to ' + readable.charAt(0).toUpperCase() + readable.slice(1);
      }
    }
  }

  return 'Navigate to page';
}

function inferPageTitle(html: string): string {
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }

  const brandMatch = html.match(/class=["'][^"']*(?:brand|logo|site-name)[^"']*["'][^>]*>([^<]+)</i);
  if (brandMatch) {
    return brandMatch[1].trim();
  }

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    return ogTitleMatch[1];
  }

  return 'Website';
}

function inferMetaDescription(html: string): string {
  const firstPMatch = html.match(/<p[^>]*>([^<]{20,150})/i);
  if (firstPMatch) {
    let text = firstPMatch[1].trim();
    if (text.length > 155) {
      text = text.substring(0, 152) + '...';
    }
    return text;
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim() + ' - Official website';
  }

  return 'Welcome to our website. Explore our products and services.';
}

export function generateDeterministicFix(issue: AccessibilityIssue, html: string): CodeFix | null {
  const fixes: Record<string, (issue: AccessibilityIssue, html: string) => CodeFix | null> = {
    'img-alt': (issue, html) => {
      if (issue.description.includes('missing alt')) {
        const altText = inferAltText(issue.element, html);
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: issue.element.replace(/<img/, `<img alt="${altText}"`),
          explanation: `Added descriptive alt text: "${altText}"`,
        };
      }
      return null;
    },
    'form-labels': (issue) => {
      const inputMatch = issue.element.match(/<(input|select|textarea)[^>]*>/i);
      if (inputMatch) {
        const original = inputMatch[0];
        const typeMatch = original.match(/type=["']([^"']+)["']/i);
        const inputType = typeMatch?.[1]?.toLowerCase() || 'text';

        if (inputType === 'submit') {
          const valueMatch = original.match(/value=["']([^"']*)["']/i);
          const hasValue = valueMatch && valueMatch[1].trim().length > 0;
          if (!hasValue) {
            const fixed = original.replace(/value=["'][^"']*["']/, 'value="Submit"')
              || original.replace(/<input/, '<input value="Submit"');
            return {
              file: 'index.html',
              originalCode: original,
              fixedCode: fixed.includes('value="Submit"') ? fixed : original.replace(/<input/, '<input value="Submit"'),
              explanation: 'Added "Submit" as button text for accessibility',
            };
          }
        }

        const label = inferFormLabel(original);
        const inputId = `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20)}`;

        let fixed = original;
        if (!original.includes(' id=')) {
          fixed = fixed.replace(/<(input|select|textarea)/, `<$1 id="${inputId}"`);
        }
        if (!original.includes('aria-label')) {
          fixed = fixed.replace(/<(input|select|textarea)/, `<$1 aria-label="${label}"`);
        }

        return {
          file: 'index.html',
          originalCode: original,
          fixedCode: fixed,
          explanation: `Added aria-label "${label}" for screen reader accessibility`,
        };
      }
      return null;
    },
    'button-names': (issue, html) => {
      const label = inferButtonLabel(issue.element, html);
      
      if (issue.element.includes('<input') && issue.element.includes('type="submit"')) {
        const hasEmptyValue = issue.element.match(/value=["']\s*["']/);
        if (hasEmptyValue) {
          return {
            file: 'index.html',
            originalCode: issue.element,
            fixedCode: issue.element.replace(/value=["']\s*["']/, 'value="Submit"'),
            explanation: 'Added "Submit" as button text for accessibility',
          };
        }
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: issue.element.replace(/<input/, `<input aria-label="${label}"`),
          explanation: `Added aria-label "${label}" to describe button purpose`,
        };
      }
      
      return {
        file: 'index.html',
        originalCode: issue.element,
        fixedCode: issue.element.replace(/<button/, `<button aria-label="${label}"`),
        explanation: `Added aria-label "${label}" to describe button purpose`,
      };
    },
    'link-text': (issue) => {
      if (issue.description.includes('no accessible text')) {
        const label = inferLinkDestination(issue.element);
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: issue.element.replace(/<a/, `<a aria-label="${label}"`),
          explanation: `Added aria-label "${label}" to describe link destination`,
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
          explanation: 'Added lang="en" for screen reader language detection',
        };
      }
      if (issue.description.includes('empty')) {
        return {
          file: 'index.html',
          originalCode: '<html lang="">',
          fixedCode: '<html lang="en">',
          explanation: 'Set lang attribute to "en" for screen reader language detection',
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
          explanation: 'Added responsive viewport meta tag',
        };
      }
      if (issue.description.includes('disables')) {
        return {
          file: 'index.html',
          originalCode: issue.element,
          fixedCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          explanation: 'Removed user-scalable restriction to allow zooming',
        };
      }
      return null;
    },
    'meta-title': (issue, html) => {
      if (issue.description.includes('missing')) {
        const title = inferPageTitle(html);
        return {
          file: 'index.html',
          originalCode: '<head>',
          fixedCode: `<head>\n  <title>${title}</title>`,
          explanation: `Added page title: "${title}"`,
        };
      }
      return null;
    },
    'meta-description': (issue, html) => {
      if (issue.description.includes('missing')) {
        const description = inferMetaDescription(html);
        return {
          file: 'index.html',
          originalCode: '<head>',
          fixedCode: `<head>\n  <meta name="description" content="${description}">`,
          explanation: 'Added meta description for SEO',
        };
      }
      return null;
    },
    'og-tags': (issue, html) => {
      const missing = issue.description.match(/Missing Open Graph tags: (.+)/)?.[1] || '';
      const title = inferPageTitle(html);
      const description = inferMetaDescription(html);

      const tagValues: Record<string, string> = {
        'og:title': title,
        'og:description': description,
        'og:image': '/og-image.png',
      };

      const tags = missing.split(', ').map(tag =>
        `<meta property="${tag}" content="${tagValues[tag] || ''}">`
      ).join('\n  ');

      return {
        file: 'index.html',
        originalCode: '<head>',
        fixedCode: `<head>\n  ${tags}`,
        explanation: 'Added Open Graph meta tags for social media previews',
      };
    },
    'clickable-divs': (issue, html) => {
      const label = inferButtonLabel(issue.element, html);
      const fixed = issue.element
        .replace(/<div/, `<button type="button" aria-label="${label}"`)
        .replace(/<\/div>/, '</button>');
      return {
        file: 'index.html',
        originalCode: issue.element,
        fixedCode: fixed,
        explanation: `Converted to semantic button with aria-label "${label}"`,
      };
    },
  };

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
  if (issue.selector.includes('img') || issue.description.toLowerCase().includes('alt')) return 'img-alt';
  if ((issue.selector.includes('input') || issue.selector.includes('select') || issue.selector.includes('textarea')) && 
      issue.description.toLowerCase().includes('label')) return 'form-labels';
  if (issue.description.toLowerCase().includes('clickable') && issue.description.toLowerCase().includes('div')) return 'clickable-divs';
  if ((issue.selector.includes('button') || issue.description.toLowerCase().includes('button')) && 
      issue.description.toLowerCase().includes('accessible name')) return 'button-names';
  if (issue.selector.includes('a') || issue.description.toLowerCase().includes('link text')) return 'link-text';
  if (issue.selector === 'html' && issue.description.toLowerCase().includes('lang')) return 'lang-attribute';
  if (issue.selector.includes('viewport') || issue.description.toLowerCase().includes('viewport')) return 'meta-viewport';
  if (issue.selector === 'title' || issue.description.toLowerCase().includes('page') && issue.description.toLowerCase().includes('title')) return 'meta-title';
  if (issue.selector.includes('description') || issue.description.toLowerCase().includes('meta description')) return 'meta-description';
  if (issue.description.toLowerCase().includes('open graph')) return 'og-tags';
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
