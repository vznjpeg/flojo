# Quick Setup Guide

## Installation & Development

### Prerequisites
- Node.js 16+ (check with `node --version`)
- npm 7+ (check with `npm --version`)
- Chrome/Chromium browser

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# This watches your files and rebuilds automatically
# The dist/ folder will contain the extension
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top right corner)
3. Click **Load unpacked**
4. Select the `dist` folder from this project
5. The Reddit Scraper extension icon appears in your toolbar

### Using the Extension

1. Navigate to any Reddit thread (e.g., `reddit.com/r/AskReddit/comments/...`)
2. Click the extension icon in your toolbar
3. Click **"Scrape Current Thread"** button
4. Wait for scraping to complete
5. View results in the popup
6. Click **"Show Export Options"** to download or copy data

### Development Commands

```bash
# Start dev mode with auto-reload
npm run dev

# Build for production
npm run build

# Create a .zip file for distribution
npm run zip

# Type-check TypeScript files
npm run typecheck

# Run linter
npm run lint
```

## Project Structure

```
src/
├── entrypoints/
│   ├── content.ts          ← Runs on Reddit pages
│   └── popup/              ← Main extension UI
├── components/             ← React components
├── hooks/                  ← Custom React hooks
├── lib/                    ← Scraping & export logic
└── types/                  ← TypeScript types
```

## Key Files

| File | Purpose |
|------|---------|
| `src/entrypoints/content.ts` | Content script that scrapes Reddit |
| `src/entrypoints/popup/Popup.tsx` | Main UI component |
| `src/lib/reddit-scraper.ts` | Comment extraction logic |
| `src/lib/export-utils.ts` | CSV/JSON export functions |
| `wxt.config.ts` | Extension configuration |

## Troubleshooting

### "Extension not loading"
- Check that `dist/` folder exists
- Look for errors in `chrome://extensions/` page
- Try reloading: Click reload icon in extensions list

### "Content script not responding"
- Refresh the Reddit page
- Check console (F12 on reddit.com) for errors
- Try a different Reddit thread

### "No comments found"
- Verify you're on a Reddit thread (not a subreddit listing)
- Some Reddit threads might have custom styling
- Check browser console for scraper errors

### "Build failing with TypeScript errors"
- Run `npm run typecheck` to see all issues
- Check that TypeScript version matches: `npm ls typescript`
- Try `npm install` again to update dependencies

## Making Changes

### Edit TypeScript/React Files
```bash
npm run dev  # Keep this running
# Edit any .ts or .tsx files
# The dev server auto-rebuilds
```

### Test Your Changes
1. Keep dev server running
2. Make code changes
3. Refresh the Reddit page (F5)
4. Extension automatically reloads

### Debug Content Script
```bash
# Open Reddit page → F12 → Console
# See content script logs here
```

### Debug Popup
```bash
# Right-click extension icon
# Select "Inspect"
# Opens popup developer tools
```

## Common Development Tasks

### Add a New Component
1. Create `src/components/MyComponent.tsx`
2. Import and use in `src/entrypoints/popup/Popup.tsx`
3. Styles go in component file as className

### Improve Scraper Accuracy
1. Open Reddit thread, press F12
2. Right-click a comment → Inspect
3. Find the CSS selector
4. Add to selector list in `src/lib/reddit-scraper.ts`
5. Test with `npm run dev`

### Add Export Format
1. Create function in `src/lib/export-utils.ts`
2. Add button in `src/components/ExportMenu.tsx`
3. Handle download/copy in button click

## Building for Release

```bash
# Create optimized production build
npm run build

# Create .zip file ready for Chrome Web Store
npm run zip

# The extension.zip file is ready to upload
```

## Documentation

- **User Guide**: See [README.md](README.md)
- **Codebase Docs**: See [CLAUDE.md](CLAUDE.md)
- **This File**: Quick setup guide

## Getting Help

If something isn't working:

1. Check the console (F12) for error messages
2. Read error messages carefully - they're usually helpful
3. Try the specific troubleshooting section above
4. Check if similar issue exists in project documentation

## Next Steps

- Explore the code in `src/`
- Read [CLAUDE.md](CLAUDE.md) for architecture details
- Make a small change to understand the workflow
- Start building your own features!

Happy coding! 🚀
