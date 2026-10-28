import { AccessibilityIssue, AuditResult, CodeFix, PRResult } from '@/types';

const HERO =
  'https://cdn.sanity.io/images/vyp0n3a2/production/4f8674dc0ac69de45af840fabf50b1c33afd7326-2500x1698.webp?rect=0,0,2500,1552&w=1400&auto=format';
const AERIAL =
  'https://cdn.sanity.io/images/vyp0n3a2/production/43ff57e5d80d3b9e4a718942bcc75d83ed2612c6-2500x1665.jpg?rect=0,0,2500,1592&w=900&auto=format';
const COURT =
  'https://cdn.sanity.io/images/vyp0n3a2/production/dd240bf5e5fa00ea932c56b51c12818ccf1f5d83-3306x2480.jpg?rect=0,0,3306,2396&w=900&auto=format';
const FACADE =
  'https://cdn.sanity.io/images/vyp0n3a2/production/444f15be7ddf1d924f1aff5c661165debcf4f596-2500x1698.jpg?w=900&auto=format';

const TITLE = 'Architecture firm in Paris: renovation, refurbishment — PDA';
const DESCRIPTION =
  'PDA, Partners & Dalous Architecture, transforms office, hospitality and residential buildings in Paris: renovation, refurbishment, vertical extension.';

export const PDA_URL = 'https://pda.archi/en';
export const PDA_REPO = 'partners-dalous/pda.archi';

export const pdaPrResult: PRResult = {
  success: true,
  prUrl: 'https://github.com/partners-dalous/pda.archi/pull/18',
  branch: 'fixit/pda-en-accessibility',
  filesChanged: 1,
};

function page(fixed: boolean): string {
  const heroAlt = fixed
    ? ' alt="Rendering of the refurbished facade at 49-53 avenue des Champs-Élysées, Paris"'
    : '';
  const project = (src: string, alt: string, name: string, place: string) => `
        <li>
          <a href="/en/projects">
            <img class="project" src="${src}"${fixed ? ` alt="${alt}"` : ''}>
            <h3>${name}</h3>
            <p>${place}</p>
          </a>
        </li>`;

  return `<!DOCTYPE html>
<html${fixed ? ' lang="en"' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1${fixed ? '' : ', user-scalable=no'}">
  <title>${fixed ? TITLE : ''}</title>
  ${fixed ? `<meta name="description" content="${DESCRIPTION}">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:image" content="${HERO}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    body {
      background: #eceae5;
      color: ${fixed ? '#161616' : '#c4bdb2'};
      font-family: ${fixed ? 'Manrope, "Segoe UI", sans-serif' : 'Arial, Helvetica, sans-serif'};
      font-size: 15px;
      line-height: 1.4;
    }
    a { color: inherit; }
    .skip {
      position: absolute;
      left: 16px;
      top: 12px;
      z-index: 5;
      background: #fff;
      color: #161616;
      padding: 8px 12px;
    }
    ${fixed ? '' : '.skip { display: none; }'}
    .hero { position: relative; height: 100vh; min-height: 360px; background: #8d9088; overflow: hidden; color: #fff; }
    .hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 42%; }
    ${fixed ? '.hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.38), rgba(0,0,0,.05) 42%, rgba(0,0,0,.18)); }' : ''}
    .topbar, .names, .statement { position: absolute; z-index: 2; }
    .topbar { top: 0; left: 0; right: 0; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; padding: 16px 22px; }
    .logo { color: #fff; font-weight: 700; letter-spacing: 0.12em; text-decoration: none; font-size: 15px; }
    nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 16px; }
    nav a { color: ${fixed ? '#fff' : 'rgba(255,255,255,0.45)'}; text-decoration: none; font-size: 13px; font-weight: 500; }
    .menu {
      display: grid; place-items: center; width: 36px; height: 36px; border: 0; background: transparent;
      color: ${fixed ? '#fff' : 'rgba(255,255,255,0.35)'}; cursor: pointer;
    }
    .names {
      left: 7%; right: 7%; top: 46%; transform: translateY(-50%);
      display: flex; justify-content: space-between; gap: 16px; margin: 0;
      font-size: clamp(22px, 4.2vw, 54px); font-weight: 600; letter-spacing: -0.045em; line-height: 0.95;
      color: ${fixed ? '#fff' : 'rgba(255,255,255,0.32)'};
      ${fixed ? 'text-shadow: 0 1px 18px rgba(0,0,0,0.45);' : ''}
    }
    .statement {
      left: 22px; bottom: 22px; width: min(280px, 78%);
      background: #e7e4dd; color: ${fixed ? '#161616' : '#c9c3b6'};
      padding: 16px 18px 14px;
    }
    .statement p { margin: 0 0 12px; font-size: 22px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.05; }
    .cta { color: ${fixed ? '#161616' : '#b7b1a4'}; font-size: 14px; font-weight: 600; text-decoration: none; }
    main { padding: 36px 22px 12px; max-width: 1080px; }
    h1 { margin: 0 0 14px; max-width: 22ch; font-size: clamp(28px, 4vw, 44px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.02; }
    .intro { margin: 0 0 14px; max-width: 22ch; font-size: 28px; line-height: 1.15; }
    .lede { margin: 0 0 28px; max-width: 42rem; }
    .section-title { margin: 0 0 14px; font-size: ${fixed ? '28px' : '14px'}; font-weight: ${fixed ? '600' : '400'}; letter-spacing: -0.03em; }
    .projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 36px; padding: 0; list-style: none; }
    .projects a { display: block; text-decoration: none; }
    .projects img { display: block; width: 100%; height: 180px; object-fit: cover; background: #d5d1c8; }
    .projects h3 { margin: 10px 0 0; font-size: 16px; font-weight: 600; }
    .projects p { margin: 2px 0 0; font-size: 13px; color: ${fixed ? '#5c5852' : '#c4bdb2'}; }
    .expertise { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 36px; padding: 0; list-style: none; }
    .expertise a { display: block; padding: 10px 14px; background: #e3e0d8; text-decoration: none; font-weight: 600; }
    .news { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
    .news a { display: block; text-decoration: none; padding: 12px 0; border-top: 1px solid #d5d1c8; }
    .news span { display: block; font-size: 12px; margin-bottom: 4px; }
    footer { display: grid; gap: 22px; margin-top: 28px; padding: 28px 22px 36px; background: #e3e0d8; }
    footer h2 { margin: 0 0 8px; font-size: 18px; }
    .newsletter { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .newsletter-input, .btn-submit { height: 40px; font: inherit; }
    .newsletter-input { flex: 1 1 180px; padding: 0 12px; border: 1px solid ${fixed ? '#8a867c' : '#d9d4ca'}; background: #fff; color: #161616; }
    .btn-submit { padding: 0 16px; border: 0; background: ${fixed ? '#161616' : '#d5d0c6'}; color: ${fixed ? '#fff' : '#c4bdb2'}; cursor: pointer; font-weight: 600; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid #161616; outline-offset: 3px; }
    ${fixed ? '' : 'a:focus, button:focus, input:focus { outline: none; }'}
    @media (max-width: 720px) {
      .projects { grid-template-columns: 1fr; }
      nav { display: none; }
    }
  </style>
</head>
<body>
  ${fixed ? '<a class="skip" href="#content">Skip to content</a>' : '<a class="skip" href="#content">Skip to content</a>'}
  <header class="hero">
    <img class="hero-photo"${heroAlt} src="${HERO}">
    <div class="topbar">
      <a class="logo" href="/en"${fixed ? ' aria-label="PDA, home"' : ''}>PDA</a>
      <nav${fixed ? ' aria-label="Primary"' : ''}>
        <a href="/en/projects">Projects</a>
        <a href="/en/expertise">Expertise</a>
        <a href="/en/studio">Studio</a>
        <a href="/en/team">Team</a>
        <a href="/en/news">News</a>
      </nav>
      <button type="button" class="menu"${fixed ? ' aria-label="Open menu"' : ''}>
        <svg${fixed ? ' aria-hidden="true"' : ''} width="18" height="12" viewBox="0 0 18 12" focusable="false">
          <path d="M0 1h18M0 6h18M0 11h18" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>
    <p class="names"><span>Partners</span><span>&amp;</span><span>Dalous</span></p>
    <div class="statement">
      <p>Refurbish rather than demolish.</p>
      <a class="cta" href="/en/studio">${fixed ? 'Discover' : 'Click here'}</a>
    </div>
  </header>
  <main id="content">
    ${fixed
      ? '<h1>PDA, Partners &amp; Dalous Architecture, an architecture and interior architecture firm in Paris, specialising in the renovation, refurbishment and transformation of buildings.</h1>'
      : '<div class="intro">PDA, Partners &amp; Dalous Architecture, an architecture firm in Paris.</div>'}
    <p class="lede">Offices, hotels, housing, retail: in Paris and its inner suburbs, we support property companies, investors and occupiers from the first study through to delivery.</p>
    <${fixed ? 'h2' : 'h4'} class="section-title">Projects</${fixed ? 'h2' : 'h4'}>
    <ul class="projects">
      ${project(FACADE, 'Rendering of the refurbished facade at 49-53 avenue des Champs-Élysées, Paris', '49 Champs-Élysées', 'Paris · Offices')}
      ${project(AERIAL, 'Aerial rendering of 118 Champs-Élysées and its green roof terrace, Paris', '118 Champs-Élysées', 'Paris · Offices')}
      ${project(COURT, 'Refurbished courtyard at 68 Faubourg Saint-Honoré, light facades and a planted garden, Paris', '68 Faubourg Saint-Honoré', 'Paris · Offices')}
    </ul>
    <h2>Expertise</h2>
    <ul class="expertise">
      <li><a href="/en/expertise">Refurbishment</a></li>
      <li><a href="/en/expertise">Architecture</a></li>
      <li><a href="/en/expertise">Interior Architecture</a></li>
      <li><a href="/en/expertise">Works Supervision</a></li>
      <li><a href="/en/expertise">Sustainable Approach</a></li>
    </ul>
    <h2>Our news</h2>
    <ul class="news">
      <li><a href="/en/news"><span>February 2026</span>115 Cardinet: an office project in the Batignolles district</a></li>
      <li><a href="/en/news"><span>June 2026</span>A bioclimatic canopy to cool the Virtuose project</a></li>
      <li><a href="/en/news"><span>May 2026</span>Delivery of the 50 Haussmann rooftop in Paris</a></li>
    </ul>
  </main>
  <footer>
    <div>
      <h2>Contact</h2>
      <p><a href="https://maps.google.com/?q=5+avenue+de+l%27Opera+75001+Paris">5 avenue de l’Opéra, 75001 Paris</a></p>
      <p><a href="mailto:agence@pda.archi">agence@pda.archi</a></p>
      <p><a href="tel:+33159041098">+33 1 59 04 10 98</a></p>
    </div>
    <form>
      <h2>Newsletter</h2>
      <p>Follow the latest studio news.</p>
      <div class="newsletter">
        ${fixed ? '<label class="sr-only" for="newsletter-email">Email</label>' : ''}
        <input class="newsletter-input" type="email" placeholder="Email"${fixed ? ' id="newsletter-email" autocomplete="email"' : ''}>
        ${fixed
          ? '<button class="btn-submit" type="submit">Subscribe</button>'
          : '<div class="btn-submit" onclick="submitForm()">Subscribe</div>'}
      </div>
    </form>
  </footer>
</body>
</html>`;
}

export const pdaHTML = page(false);
export const pdaFixedHTML = page(true);

export const pdaIssues: AccessibilityIssue[] = [
  {
    id: 'pda-1',
    type: 'error',
    category: 'accessibility',
    severity: 'critical',
    wcagRule: 'WCAG 1.1.1',
    element: '<img class="hero-photo" src="49-champs-elysees.webp">',
    selector: 'img.hero-photo',
    description: 'Hero photograph of 49 Champs-Élysées has no alt text',
    impact: 'Screen reader users miss the building that the whole homepage is about',
    fix: {
      file: 'index.html',
      originalCode: '<img class="hero-photo" src="49-champs-elysees.webp">',
      fixedCode: '<img class="hero-photo" alt="Rendering of the refurbished facade at 49-53 avenue des Champs-Élysées, Paris" src="49-champs-elysees.webp">',
      explanation: 'Named the facade, the address, and that the image is a rendering',
      lineNumber: 48,
    },
  },
  {
    id: 'pda-2',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 1.4.3',
    element: '<p class="names">Partners & Dalous</p>',
    selector: 'p.names',
    description: 'Studio name and the hero statement fail contrast',
    impact: 'The words over the facade and inside the cream card are too faint to read',
    fix: {
      file: 'index.html',
      originalCode: `.names { color: rgba(255,255,255,0.32); }\n.statement { color: #c9c3b6; }\n.cta { color: #b7b1a4; }`,
      fixedCode: `.names { color: #fff; text-shadow: 0 1px 18px rgba(0,0,0,0.45); }\n.statement { color: #161616; }\n.cta { color: #161616; }`,
      explanation: 'Raised the overlay type to white and the card type to the page ink',
      lineNumber: 36,
    },
  },
  {
    id: 'pda-3',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 1.1.1',
    element: '<img class="project" src="118-champs.jpg">',
    selector: 'img.project',
    description: 'Project photographs have no alt text',
    impact: 'The project list is a row of unnamed images for anyone who cannot see them',
    fix: {
      file: 'index.html',
      originalCode: '<img class="project" src="118-champs.jpg">',
      fixedCode: '<img class="project" alt="Aerial rendering of 118 Champs-Élysées and its green roof terrace, Paris" src="118-champs.jpg">',
      explanation: 'Described each project photograph instead of leaving the images silent',
      lineNumber: 72,
    },
  },
  {
    id: 'pda-4',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 4.1.2',
    element: '<button type="button" class="menu"><svg>...</svg></button>',
    selector: 'button.menu',
    description: 'Menu button has no accessible name',
    impact: 'Screen reader users land on a button that does not say it opens the menu',
    fix: {
      file: 'index.html',
      originalCode: '<button type="button" class="menu"><svg>...</svg></button>',
      fixedCode: '<button type="button" class="menu" aria-label="Open menu"><svg aria-hidden="true">...</svg></button>',
      explanation: 'Named the control and hid the decorative icon from assistive technology',
      lineNumber: 58,
    },
  },
  {
    id: 'pda-5',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 1.3.1',
    element: '<input class="newsletter-input" type="email" placeholder="Email">',
    selector: 'input.newsletter-input',
    description: 'Newsletter email field has no label',
    impact: 'Placeholder text disappears while typing and is not a reliable name',
    fix: {
      file: 'index.html',
      originalCode: '<input class="newsletter-input" type="email" placeholder="Email">',
      fixedCode: '<label class="sr-only" for="newsletter-email">Email</label>\n<input class="newsletter-input" type="email" id="newsletter-email" placeholder="Email" autocomplete="email">',
      explanation: 'Associated a visually hidden label with the email field',
      lineNumber: 96,
    },
  },
  {
    id: 'pda-6',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 4.1.2',
    element: '<div class="btn-submit" onclick="submitForm()">Subscribe</div>',
    selector: 'div.btn-submit',
    description: 'Subscribe control is a clickable div',
    impact: 'Keyboard users cannot focus or activate the newsletter submit control',
    fix: {
      file: 'index.html',
      originalCode: '<div class="btn-submit" onclick="submitForm()">Subscribe</div>',
      fixedCode: '<button class="btn-submit" type="submit">Subscribe</button>',
      explanation: 'Replaced the div with a submit button inside the newsletter form',
      lineNumber: 97,
    },
  },
  {
    id: 'pda-7',
    type: 'error',
    category: 'accessibility',
    severity: 'serious',
    wcagRule: 'WCAG 3.1.1',
    element: '<html>',
    selector: 'html',
    description: 'Page language is not set',
    impact: 'Screen readers may pronounce the English page with the wrong voice',
    fix: {
      file: 'index.html',
      originalCode: '<html>',
      fixedCode: '<html lang="en">',
      explanation: 'Declared English on the root element',
      lineNumber: 2,
    },
  },
  {
    id: 'pda-8',
    type: 'warning',
    category: 'accessibility',
    severity: 'moderate',
    wcagRule: 'WCAG 2.4.4',
    element: '<a class="cta" href="/en/studio">Click here</a>',
    selector: 'a.cta',
    description: 'Hero link says “Click here”',
    impact: 'The link does not say that it opens the studio page',
    fix: {
      file: 'index.html',
      originalCode: '<a class="cta" href="/en/studio">Click here</a>',
      fixedCode: '<a class="cta" href="/en/studio">Discover</a>',
      explanation: 'Replaced the generic label with the studio’s own call to action',
      lineNumber: 64,
    },
  },
  {
    id: 'pda-9',
    type: 'warning',
    category: 'accessibility',
    severity: 'moderate',
    wcagRule: 'WCAG 1.3.1',
    element: '<h4 class="section-title">Projects</h4>',
    selector: 'h4.section-title',
    description: 'Projects heading skips from no heading to h4',
    impact: 'People navigating by heading never meet a title for the page, then jump to level 4',
    fix: {
      file: 'index.html',
      originalCode: '<h4 class="section-title">Projects</h4>',
      fixedCode: '<h2 class="section-title">Projects</h2>',
      explanation: 'Restored an h1 for the studio, then used h2 for Projects',
      lineNumber: 70,
    },
  },
  {
    id: 'pda-10',
    type: 'error',
    category: 'seo',
    severity: 'critical',
    element: '<title></title>',
    selector: 'title',
    description: 'The page title is empty',
    impact: 'The tab, history, and search results have nothing to show for the firm',
    fix: {
      file: 'index.html',
      originalCode: '<title></title>',
      fixedCode: `<title>${TITLE}</title>`,
      explanation: 'Used the studio’s English title',
      lineNumber: 5,
    },
  },
  {
    id: 'pda-11',
    type: 'warning',
    category: 'seo',
    severity: 'moderate',
    element: '<head>',
    selector: 'head',
    description: 'Meta description is missing',
    impact: 'Search results fall back to whatever sentence they can scrape',
    fix: {
      file: 'index.html',
      originalCode: `<title>${TITLE}</title>`,
      fixedCode: `<title>${TITLE}</title>\n<meta name="description" content="${DESCRIPTION}">`,
      explanation: 'Added a description that says what the Paris studio does',
      lineNumber: 6,
    },
  },
  {
    id: 'pda-12',
    type: 'notice',
    category: 'seo',
    severity: 'minor',
    element: '<head>',
    selector: 'head',
    description: 'Open Graph title, description, and image are missing',
    impact: 'A shared link to the homepage will not preview the facade or the studio name',
    fix: {
      file: 'index.html',
      originalCode: `<meta name="description" content="${DESCRIPTION}">`,
      fixedCode: `<meta name="description" content="${DESCRIPTION}">\n<meta property="og:title" content="${TITLE}">\n<meta property="og:description" content="${DESCRIPTION}">\n<meta property="og:image" content="${HERO}">`,
      explanation: 'Added Open Graph tags so shares show the studio and the Champs-Élysées rendering',
      lineNumber: 7,
    },
  },
  {
    id: 'pda-13',
    type: 'error',
    category: 'accessibility',
    severity: 'critical',
    wcagRule: 'WCAG 1.4.4',
    element: '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">',
    selector: 'meta[name="viewport"]',
    description: 'The viewport blocks zooming',
    impact: 'People who need larger type cannot pinch-zoom the project names or the address',
    fix: {
      file: 'index.html',
      originalCode: '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">',
      fixedCode: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      explanation: 'Removed user-scalable=no so the page can be zoomed',
      lineNumber: 4,
    },
  },
];

export const pdaFixes: CodeFix[] = pdaIssues.filter((issue) => issue.fix).map((issue) => issue.fix!);

export const pdaSteps: Array<{ delay: number; type: 'progress' | 'issue' | 'fix' | 'success' | 'error'; message: string }> = [
  { delay: 280, type: 'progress', message: 'Starting demo 2…' },
  { delay: 420, type: 'progress', message: 'Fetching https://pda.archi/en' },
  { delay: 360, type: 'progress', message: 'Parsing the studio homepage…' },
  { delay: 280, type: 'progress', message: 'Running accessibility checks…' },
  { delay: 180, type: 'progress', message: 'Checking: Images must have alt text' },
  { delay: 140, type: 'issue', message: 'Found: Hero photograph of 49 Champs-Élysées has no alt text' },
  { delay: 160, type: 'issue', message: 'Found: Project photographs have no alt text' },
  { delay: 180, type: 'progress', message: 'Checking: Text contrast on the hero' },
  { delay: 140, type: 'issue', message: 'Found: Studio name and the hero statement fail contrast' },
  { delay: 180, type: 'progress', message: 'Checking: Buttons must have accessible names' },
  { delay: 140, type: 'issue', message: 'Found: Menu button has no accessible name' },
  { delay: 160, type: 'issue', message: 'Found: Subscribe control is a clickable div' },
  { delay: 180, type: 'progress', message: 'Checking: Form fields must have labels' },
  { delay: 140, type: 'issue', message: 'Found: Newsletter email field has no label' },
  { delay: 180, type: 'progress', message: 'Checking: Page language' },
  { delay: 140, type: 'issue', message: 'Found: Page language is not set' },
  { delay: 180, type: 'progress', message: 'Checking: Link text' },
  { delay: 140, type: 'issue', message: 'Found: Hero link says “Click here”' },
  { delay: 180, type: 'progress', message: 'Checking: Heading order' },
  { delay: 140, type: 'issue', message: 'Found: Projects heading skips from no heading to h4' },
  { delay: 180, type: 'progress', message: 'Checking: Title, description, and sharing tags' },
  { delay: 140, type: 'issue', message: 'Found: The page title is empty' },
  { delay: 140, type: 'issue', message: 'Found: Meta description is missing' },
  { delay: 140, type: 'issue', message: 'Found: Open Graph tags are missing' },
  { delay: 160, type: 'progress', message: 'Checking: Viewport zoom' },
  { delay: 140, type: 'issue', message: 'Found: The viewport blocks zooming' },
  { delay: 280, type: 'progress', message: 'Found 13 issues. Generating fixes…' },
  { delay: 150, type: 'fix', message: 'Generated fix for: Hero alt text' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Hero contrast' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Project alt text' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Menu button name' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Email label' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Subscribe button' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Page language' },
  { delay: 130, type: 'fix', message: 'Generated fix for: “Click here”' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Heading order' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Page title' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Meta description' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Open Graph tags' },
  { delay: 130, type: 'fix', message: 'Generated fix for: Viewport zoom' },
  { delay: 280, type: 'success', message: 'Audit complete. Score improved from 31 to 96' },
];

export function getPdaDemoAuditResult(): AuditResult {
  const issues = pdaIssues;
  const summary = {
    total: issues.length,
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    serious: issues.filter((issue) => issue.severity === 'serious').length,
    moderate: issues.filter((issue) => issue.severity === 'moderate').length,
    minor: issues.filter((issue) => issue.severity === 'minor').length,
    byCategory: {
      accessibility: issues.filter((issue) => issue.category === 'accessibility').length,
      seo: issues.filter((issue) => issue.category === 'seo').length,
      performance: 0,
      'best-practices': 0,
    },
  };

  return {
    url: PDA_URL,
    timestamp: new Date().toISOString(),
    scoreBefore: 31,
    scoreAfter: 96,
    issues,
    fixes: pdaFixes,
    summary,
    html: pdaFixedHTML,
    sourceHtml: pdaHTML,
  };
}
