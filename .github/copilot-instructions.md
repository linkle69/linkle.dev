# Linkle.dev Personal Website

Personal website built with Astro and TypeScript, featuring dynamic AI-powered color theming and automated favicon generation. Deployed to GitHub Pages with custom domain linkle.dev.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Dependencies
- Node.js v20+ is required (v20.19.4 confirmed working)
- `npm install` -- takes ~20 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- `npm audit fix` -- REQUIRED after install to fix security vulnerabilities (~7 seconds)

### Build Process
- **CRITICAL REQUIREMENT**: `GEMINI_API_KEY` environment variable must be set with valid Google Gemini API key
- `node favicon.mjs` -- generates favicons from src/avatar.png (~0.15 seconds)
- `npm run build` -- Astro static build with AI color analysis (~15 seconds with API key). NEVER CANCEL. Set timeout to 120+ seconds.
- Build WILL FAIL without valid GEMINI_API_KEY due to live AI API call during build-time
- Build artifacts output to `dist/` directory

### Development Workflow
- `npm run dev` -- starts development server on localhost:4321 (~0.5 seconds)
- **CRITICAL**: Dev server requires GEMINI_API_KEY to render pages (returns 500 without it)
- `npm run preview` -- preview built site on localhost:4321 (requires successful build first)
- NO linting, formatting, or testing scripts are available in this project

### Manual Validation Requirements
- **ALWAYS** test with `node favicon.mjs` to verify favicon generation works
- **ALWAYS** test development server starts with `GEMINI_API_KEY=test-key npm run dev`
- **VALIDATION SCENARIO**: After making changes to color/theming logic:
  1. Verify favicon generation: `node favicon.mjs && ls -la public/favicon-*.png`
  2. Check build works: `GEMINI_API_KEY=valid-key npm run build`
  3. Verify generated favicons are present in dist folder
- **VALIDATION SCENARIO**: After changing Avatar or AI integration:
  1. Test that new avatar triggers favicon regeneration 
  2. Verify the AI color analysis still functions with valid API key
  3. Check that generated colors appear reasonable in browser (not too dark/light)

## Key Technical Details

### Environment Requirements
- Node.js v20+ (tested with v20.19.4)
- GEMINI_API_KEY secret (required for both dev and build)
- Internet connection for Google Gemini API calls during build

### Build Timing (NEVER CANCEL)
- `npm install`: ~20 seconds (set timeout to 60+ seconds)
- `node favicon.mjs`: ~0.15 seconds (set timeout to 30+ seconds) 
- `npm run build`: ~15 seconds with valid API key (set timeout to 120+ seconds)
- Complete GitHub Actions build: ~35 seconds total (set timeout to 180+ seconds)

### Project Structure
```
src/
  components/Friends.astro    # Friend links component
  icons/                     # SVG icons (github, steam, twitter)
  pages/index.astro         # Main page with AI-powered dynamic styling
  avatar.png               # Source avatar image for favicon generation
astro.config.mjs           # Astro configuration
favicon.mjs               # Favicon generator script (prebuild step)
package.json              # Dependencies and scripts
.github/workflows/deploy.yml  # GitHub Pages deployment
```

### Deployment
- Automatic deployment via GitHub Actions on push to main branch
- Uses `withastro/action@v3` which handles Node.js setup and build
- Requires GEMINI_API_KEY secret configured in repository settings
- Deployed to GitHub Pages at linkle.dev (custom domain via CNAME)

## Common Tasks

### Repository root files
```
.git/ .github/ .gitignore .vscode/
CNAME LICENSE README.md
astro.config.mjs favicon.mjs package.json package-lock.json
public/ src/ tsconfig.json
```

### Key dependencies from package.json
```json
{
  "dependencies": {
    "@google/genai": "^1.5.1",
    "@napi-rs/canvas": "^0.1.71", 
    "astro": "^5.1.5",
    "astro-icon": "^1.1.5",
    "sharp": "^0.33.5"
  }
}
```

### Available npm scripts
- `dev`: Start development server
- `prebuild`: Generate favicons (runs before build automatically)
- `build`: Build static site
- `preview`: Preview built site
- `astro`: Run Astro CLI commands

## Special Considerations

### AI-Powered Dynamic Theming
- Main page (`src/pages/index.astro`) uses Google Gemini to analyze avatar colors
- AI generates accent colors at BUILD TIME, not runtime
- Colors are used for CSS custom properties throughout the site
- This is why GEMINI_API_KEY is required for builds to succeed

### Favicon Generation
- `favicon.mjs` creates multiple sized favicons (16px to 192px) from src/avatar.png
- Also generates a custom "button.png" (88x31) with darkened avatar and "LINKLE" text
- Runs automatically as prebuild step during `npm run build`
- Generated files: favicon-16.png, favicon-32.png, favicon-48.png, favicon-64.png, favicon-96.png, favicon-192.png, button.png

### Icon System
- Uses `astro-icon` integration for SVG icons
- Custom icons stored in `src/icons/` (github.svg, steam.svg, twitter.svg)
- Icons referenced in code as `<Icon name="github" />` etc.

### TypeScript Configuration
- Uses Astro's base TypeScript config
- TypeScript available via `npx tsc --version` (v5.7.3)
- No separate type checking step - handled by Astro build process