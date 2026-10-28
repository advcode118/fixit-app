import { AccessibilityIssue, AuditResult, CodeFix } from '@/types';

export const demoIssues: AccessibilityIssue[] = [
  {
    id: 'demo-1',
    type: 'error',
    category: 'accessibility',
    severity: 'critical',
    wcagRule: 'WCAG 1.1.1',
    element: '<img src="hero-image.jpg" class="hero-banner">',
    selector: 'img.hero-banner',
    description: 'Hero image is missing alt text',
    impact: 'Screen reader users cannot understand the main visual content of the page',
    fix: {
      file: 'index.html',
      originalCode: '<img src="hero-image.jpg" class="hero-banner">',
      fixedCode: '<img src="hero-image.jpg" class="hero-banner" alt="Team collaborating on digital accessibility solutions">',
      explanation: 'Added descriptive alt text that conveys the image content and purpose',
      lineNumber: 15,
    },
  },
  {
    id: 'demo-2',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 1.3.1',
    element: '<input type="email" placeholder="Enter your email" class="newsletter-input">',
    selector: 'input.newsletter-input',
    description: 'Email input field is missing an associated label',
    impact: 'Screen reader users will not understand the purpose of this form field',
    fix: {
      file: 'index.html',
      originalCode: '<input type="email" placeholder="Enter your email" class="newsletter-input">',
      fixedCode: '<label for="newsletter-email" class="sr-only">Email address</label>\n<input type="email" id="newsletter-email" placeholder="Enter your email" class="newsletter-input" aria-describedby="email-hint">',
      explanation: 'Added a visually hidden label and improved accessibility attributes',
      lineNumber: 42,
    },
  },
  {
    id: 'demo-3',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 4.1.2',
    element: '<div class="btn-submit" onclick="submitForm()">Subscribe</div>',
    selector: 'div.btn-submit',
    description: 'Clickable div should be a button element for keyboard accessibility',
    impact: 'Keyboard users cannot activate this interactive element using standard controls',
    fix: {
      file: 'index.html',
      originalCode: '<div class="btn-submit" onclick="submitForm()">Subscribe</div>',
      fixedCode: '<button type="submit" class="btn-submit">Subscribe</button>',
      explanation: 'Changed div to semantic button element with proper type attribute',
      lineNumber: 45,
    },
  },
  {
    id: 'demo-4',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 3.1.1',
    element: '<html>',
    selector: 'html',
    description: 'HTML element is missing lang attribute',
    impact: 'Screen readers may not announce content in the correct language',
    fix: {
      file: 'index.html',
      originalCode: '<html>',
      fixedCode: '<html lang="en">',
      explanation: 'Added lang attribute to specify the page language',
      lineNumber: 1,
    },
  },
  {
    id: 'demo-5',
    type: 'warning',
    category: 'accessibility',
    severity: 'moderate',
    wcagRule: 'WCAG 2.4.4',
    element: '<a href="/pricing">Click here</a>',
    selector: 'a.cta-link',
    description: 'Link text "Click here" is not descriptive',
    impact: 'Users may not understand the link destination without surrounding context',
    fix: {
      file: 'index.html',
      originalCode: '<a href="/pricing">Click here</a>',
      fixedCode: '<a href="/pricing">View our pricing plans</a>',
      explanation: 'Replaced generic link text with descriptive text indicating the destination',
      lineNumber: 67,
    },
  },
  {
    id: 'demo-6',
    type: 'warning',
    category: 'accessibility',
    severity: 'moderate',
    wcagRule: 'WCAG 1.3.1',
    element: '<h4 class="section-title">Features</h4>',
    selector: 'h4.section-title',
    description: 'Heading level skipped from h2 to h4',
    impact: 'Users navigating by headings may be confused by the document structure',
    fix: {
      file: 'index.html',
      originalCode: '<h4 class="section-title">Features</h4>',
      fixedCode: '<h3 class="section-title">Features</h3>',
      explanation: 'Changed h4 to h3 to maintain proper heading hierarchy',
      lineNumber: 78,
    },
  },
  {
    id: 'demo-7',
    type: 'error',
    category: 'seo',
    severity: 'critical',
    element: '<title></title>',
    selector: 'title',
    description: 'Page title is empty',
    impact: 'Search engines and browsers cannot properly identify this page',
    fix: {
      file: 'index.html',
      originalCode: '<title></title>',
      fixedCode: '<title>FixIt Demo - Accessibility Testing Target Site</title>',
      explanation: 'Added descriptive page title for SEO and browser tabs',
      lineNumber: 4,
    },
  },
  {
    id: 'demo-8',
    type: 'warning',
    category: 'seo',
    severity: 'moderate',
    element: '<head>',
    selector: 'head',
    description: 'Page is missing meta description',
    impact: 'Search engines use meta descriptions for search result snippets',
    fix: {
      file: 'index.html',
      originalCode: '  <title>FixIt Demo - Accessibility Testing Target Site</title>',
      fixedCode: '  <title>FixIt Demo - Accessibility Testing Target Site</title>\n  <meta name="description" content="A demonstration page for FixIt accessibility auditing tool. Contains intentional accessibility issues for testing purposes.">',
      explanation: 'Added meta description for improved search engine visibility',
      lineNumber: 5,
    },
  },
  {
    id: 'demo-9',
    type: 'notice',
    category: 'seo',
    severity: 'minor',
    element: '<head>',
    selector: 'head',
    description: 'Missing Open Graph tags: og:title, og:description, og:image',
    impact: 'Social media shares will not display rich previews',
    fix: {
      file: 'index.html',
      originalCode: '  <meta name="description" content="A demonstration page for FixIt accessibility auditing tool. Contains intentional accessibility issues for testing purposes.">',
      fixedCode: `  <meta name="description" content="A demonstration page for FixIt accessibility auditing tool. Contains intentional accessibility issues for testing purposes.">
  <meta property="og:title" content="FixIt Demo - Accessibility Testing">
  <meta property="og:description" content="Test page for FixIt accessibility auditor">
  <meta property="og:image" content="https://advcode118.github.io/fixit-demo-target/og-image.png">`,
      explanation: 'Added Open Graph meta tags for social media previews',
      lineNumber: 6,
    },
  },
  {
    id: 'demo-10',
    type: 'error',
    category: 'accessibility',
    severity: 'critical',
    wcagRule: 'WCAG 1.4.4',
    element: '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">',
    selector: 'meta[name="viewport"]',
    description: 'Viewport disables user scaling',
    impact: 'Users with low vision cannot zoom the page to read content',
    fix: {
      file: 'index.html',
      originalCode: '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">',
      fixedCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      explanation: 'Removed user-scalable=no to allow zooming for accessibility',
      lineNumber: 3,
    },
  },
  {
    id: 'demo-11',
    type: 'warning',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 4.1.2',
    element: '<button class="close-modal"><svg>...</svg></button>',
    selector: 'button.close-modal',
    description: 'Button does not have an accessible name',
    impact: 'Screen reader users will not know what this button does',
    fix: {
      file: 'index.html',
      originalCode: '<button class="close-modal"><svg>...</svg></button>',
      fixedCode: '<button class="close-modal" aria-label="Close modal"><svg aria-hidden="true">...</svg></button>',
      explanation: 'Added aria-label to button and hid decorative SVG from assistive technology',
      lineNumber: 112,
    },
  },
  {
    id: 'demo-12',
    type: 'warning',
    category: 'accessibility',
    severity: 'moderate',
    wcagRule: 'WCAG 1.1.1',
    element: '<img src="decorative-line.svg" alt="">',
    selector: 'img.decorative',
    description: 'Image has empty alt text - ensure this is decorative',
    impact: 'If not decorative, screen reader users will miss important content',
  },
];

export const demoFixes: CodeFix[] = demoIssues
  .filter(issue => issue.fix)
  .map(issue => issue.fix!);

export const demoHTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title></title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
    .hero-banner { width: 100%; height: 300px; object-fit: cover; }
    .btn-submit { background: #0066cc; color: white; padding: 12px 24px; cursor: pointer; }
    .newsletter-input { padding: 12px; border: 1px solid #ccc; width: 200px; }
  </style>
</head>
<body>
  <header>
    <img src="hero-image.jpg" class="hero-banner">
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/pricing">Click here</a>
    </nav>
  </header>
  
  <main>
    <h2>Welcome to Our Site</h2>
    <p>We help businesses improve their digital presence.</p>
    
    <h4 class="section-title">Features</h4>
    <ul>
      <li>Fast performance</li>
      <li>Great design</li>
      <li>Easy to use</li>
    </ul>
    
    <section class="newsletter">
      <h3>Subscribe to our newsletter</h3>
      <input type="email" placeholder="Enter your email" class="newsletter-input">
      <div class="btn-submit" onclick="submitForm()">Subscribe</div>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 Demo Site</p>
  </footer>
  
  <div class="modal">
    <button class="close-modal"><svg>...</svg></button>
    <img src="decorative-line.svg" alt="">
  </div>
</body>
</html>`;

export const demoFixedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FixIt Demo - Accessibility Testing Target Site</title>
  <meta name="description" content="A demonstration page for FixIt accessibility auditing tool. Contains intentional accessibility issues for testing purposes.">
  <meta property="og:title" content="FixIt Demo - Accessibility Testing">
  <meta property="og:description" content="Test page for FixIt accessibility auditor">
  <meta property="og:image" content="https://advcode118.github.io/fixit-demo-target/og-image.png">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
    .hero-banner { width: 100%; height: 300px; object-fit: cover; }
    .btn-submit { background: #0066cc; color: white; padding: 12px 24px; cursor: pointer; border: none; }
    .newsletter-input { padding: 12px; border: 1px solid #ccc; width: 200px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  </style>
</head>
<body>
  <header>
    <img src="hero-image.jpg" class="hero-banner" alt="Team collaborating on digital accessibility solutions">
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/pricing">View our pricing plans</a>
    </nav>
  </header>
  
  <main>
    <h1>Welcome to Our Site</h1>
    <p>We help businesses improve their digital presence.</p>
    
    <h2 class="section-title">Features</h2>
    <ul>
      <li>Fast performance</li>
      <li>Great design</li>
      <li>Easy to use</li>
    </ul>
    
    <section class="newsletter">
      <h2>Subscribe to our newsletter</h2>
      <label for="newsletter-email" class="sr-only">Email address</label>
      <input type="email" id="newsletter-email" placeholder="Enter your email" class="newsletter-input" aria-describedby="email-hint">
      <button type="submit" class="btn-submit">Subscribe</button>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 Demo Site</p>
  </footer>
  
  <div class="modal" role="dialog" aria-labelledby="modal-title">
    <button class="close-modal" aria-label="Close modal"><svg aria-hidden="true">...</svg></button>
    <img src="decorative-line.svg" alt="" role="presentation">
  </div>
</body>
</html>`;

export function getDemoAuditResult(): AuditResult {
  const issues = demoIssues;
  const fixes = demoFixes;
  
  const summary = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    serious: issues.filter(i => i.severity === 'serious').length,
    moderate: issues.filter(i => i.severity === 'moderate').length,
    minor: issues.filter(i => i.severity === 'minor').length,
    byCategory: {
      accessibility: issues.filter(i => i.category === 'accessibility').length,
      seo: issues.filter(i => i.category === 'seo').length,
      performance: 0,
      'best-practices': 0,
    },
  };

  return {
    url: 'https://advcode118.github.io/fixit-demo-target/',
    timestamp: new Date().toISOString(),
    scoreBefore: 38,
    scoreAfter: 94,
    issues,
    fixes,
    summary,
    html: demoHTML,
  };
}
