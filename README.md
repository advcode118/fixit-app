# FixIt 🔧

AI-powered accessibility and SEO auditor that scans any website, identifies issues, generates fixes, and opens a GitHub Pull Request automatically.

![FixIt Screenshot](https://via.placeholder.com/800x400?text=FixIt+Screenshot)

## Features

- **Live Website Auditing** - Paste any URL and get a comprehensive accessibility/SEO audit
- **Real-time Activity Feed** - Watch the AI analyze your site with streaming progress updates
- **Intelligent Issue Detection** - Checks for WCAG violations, missing alt text, form labels, heading order, color contrast, SEO meta tags, and more
- **AI-Powered Fixes** - Uses LLM (X.AI Grok or OpenAI) to rank issues and generate smart fixes
- **Deterministic Fallback** - Works without an LLM key using rule-based fixes
- **Interactive Diff Viewer** - View before/after code changes with syntax highlighting
- **Visual Preview** - Side-by-side slider comparing original vs fixed versions
- **One-Click PR Creation** - Automatically create a GitHub PR with all fixes applied
- **Demo Mode** - Try the full experience with realistic sample data

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Accessibility Checks**: Custom rule engine inspired by axe-core
- **LLM Integration**: X.AI (Grok) / OpenAI compatible API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub Personal Access Token (for PR creation)
- (Optional) X.AI or OpenAI API key for enhanced fixes

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/fixit.git
cd fixit
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your credentials:

```env
# Required for PR creation
GITHUB_TOKEN=ghp_your_token_here

# Optional - for AI-powered analysis
XAI_API_KEY=xai_your_key_here
# or
OPENAI_API_KEY=sk-your_key_here
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes (for PR) | GitHub Personal Access Token with `repo` scope |
| `XAI_API_KEY` | No | X.AI (Grok) API key for AI-powered fixes |
| `OPENAI_API_KEY` | No | OpenAI API key (fallback if X.AI not configured) |

### Getting API Keys

#### GitHub Token
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `repo` scope
4. Copy the token to `GITHUB_TOKEN`

#### X.AI API Key
1. Sign up at [x.ai](https://x.ai)
2. Navigate to API settings
3. Generate an API key
4. Copy to `XAI_API_KEY`

#### OpenAI API Key
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to [API Keys](https://platform.openai.com/api-keys)
3. Create a new key
4. Copy to `OPENAI_API_KEY`

## Deployment on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/fixit&env=GITHUB_TOKEN,XAI_API_KEY)

### Manual Deployment

1. Push your code to a GitHub repository

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project" and import your repository

4. Add environment variables in the Vercel dashboard:
   - `GITHUB_TOKEN` (required)
   - `XAI_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional)

5. Click "Deploy"

## Usage

### Standard Audit

1. Enter a website URL (e.g., `https://example.com`)
2. Enter the GitHub repository (e.g., `username/repo`)
3. Click "Start Audit"
4. Watch the activity feed as issues are discovered
5. Review the score improvement and issue details
6. Click "Open Pull Request" to commit fixes

### Demo Mode

1. Toggle "Demo Mode" on
2. Click "Start Audit" to see a simulated audit
3. Explore the UI and features with sample data
4. No API keys required!

## Accessibility Checks

FixIt checks for:

| Category | Checks |
|----------|--------|
| **Accessibility** | Image alt text, form labels, button names, link text, language attribute, heading order, clickable elements, color contrast, viewport scaling |
| **SEO** | Page title, meta description, Open Graph tags |

Each issue includes:
- Severity level (Critical, Serious, Moderate, Minor)
- WCAG rule reference
- Plain English explanation
- Impact on users
- Auto-generated fix (when possible)

## API Endpoints

### POST /api/audit

Audit a website for accessibility/SEO issues.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:** Server-Sent Events (SSE) stream with progress updates, issues, fixes, and final results.

### POST /api/create-pr

Create a GitHub Pull Request with fixes.

**Request:**
```json
{
  "repo": "owner/repo",
  "files": [{ "path": "index.html", "content": "..." }],
  "summary": "Fixed 10 accessibility issues",
  "issues": [...]
}
```

**Response:**
```json
{
  "success": true,
  "prUrl": "https://github.com/owner/repo/pull/1",
  "branch": "fixit/auto-fixes-1234567890",
  "filesChanged": 1
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the hackathon by the FixIt team.
