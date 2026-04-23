# Reddit Thread Scraper Extension

A powerful Chrome extension for scraping and exporting Reddit comment threads. Built with WXT framework, TypeScript, and React.

## Features

- **Comment Extraction**: Automatically scrapes usernames, comment text, timestamps, and upvotes
- **Thread Preservation**: Maintains comment threading structure to understand reply relationships
- **Modern UI**: Clean, dark-mode popup interface with real-time scraping progress
- **Multiple Export Formats**:
  - JSON: Complete structured data
  - CSV: Spreadsheet-friendly format
  - Clipboard: Quick copy for sharing
- **Nested Reply Support**: Intelligently handles deeply nested Reddit threads
- **Manifest V3 Compliant**: Modern extension architecture with proper security practices
- **Robust Selectors**: DOM scrapers designed to be resilient to minor Reddit changes

## Installation

### From Source (Development)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd flojo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

For active development with hot reload:

```bash
npm run dev
```

This starts the WXT dev server and watches for changes.

## Usage

1. Navigate to any Reddit thread (e.g., `reddit.com/r/...`)
2. Click the Reddit Scraper extension icon
3. Click "Scrape Current Thread" button
4. Wait for the scraping to complete
5. View results in the popup table
6. Export using your preferred format:
   - **JSON**: Download as `.json` file
   - **CSV**: Download as `.csv` spreadsheet
   - **Copy**: Copy JSON to clipboard

## Project Structure

```
src/
├── entrypoints/
│   ├── content.ts          # Content script for Reddit pages
│   └── popup/
│       ├── index.tsx       # Popup entry point
│       ├── Popup.tsx       # Main React component
│       └── popup.css       # Popup styles
├── components/
│   ├── ResultsTable.tsx    # Collapsible results display
│   └── ExportMenu.tsx      # Export options UI
├── hooks/
│   └── useScrape.ts        # React hook for scraping logic
├── lib/
│   ├── reddit-scraper.ts   # DOM scraping logic
│   └── export-utils.ts     # Export format functions
└── types/
    └── reddit.ts           # TypeScript type definitions
```

## Architecture

### Content Script (`content.ts`)
- Runs on `reddit.com/*` pages
- Listens for messages from popup
- Executes DOM scraping when triggered
- Returns structured comment data

### Popup (`Popup.tsx`)
- React component with dark mode design
- Displays scraping progress and results
- Manages export options
- Shows statistics and comment previews

### Scraper (`reddit-scraper.ts`)
- Robust CSS selectors for Reddit's comment elements
- Handles nested replies intelligently
- Extracts: username, text, timestamp, upvotes, nesting level
- Returns structured `ScrapingResult` with metadata

### Export Utilities (`export-utils.ts`)
- JSON: Pretty-printed structured format
- CSV: Spreadsheet format with proper escaping
- Clipboard: Direct browser clipboard integration

## Configuration

The extension is configured via `wxt.config.ts`:

```typescript
export default defineConfig({
  manifest: {
    permissions: ['storage', 'scripting', 'activeTab'],
    host_permissions: ['*://reddit.com/*', '*://www.reddit.com/*'],
    // ... other manifest settings
  },
});
```

## Building for Production

```bash
npm run build
npm run zip
```

This creates an optimized bundle and a `.zip` file ready for distribution.

## Browser Support

- Chrome 88+
- Edge 88+
- Brave
- Other Chromium-based browsers

## Permissions

- **`storage`**: Store extension state and settings
- **`scripting`**: Inject content script on Reddit
- **`activeTab`**: Access current tab for scraping
- **Host permission**: `reddit.com/*` and `www.reddit.com/*`

## Limitations

- Works only on Reddit's new design (uses data-testid selectors)
- Requires JavaScript to be enabled on reddit.com
- Respects Reddit's DOM structure; major redesigns may require selector updates
- Rate limited by browser's injection capabilities

## Development

### Type Checking

```bash
npm run typecheck
```

### Code Quality

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions welcome! Please ensure code follows the existing style and includes proper TypeScript types.

## Troubleshooting

### Extension not appearing
- Refresh the Reddit page after installation
- Check extension is enabled in `chrome://extensions/`

### Scraping returns no comments
- Verify you're on a Reddit thread (not a subreddit listing)
- Check browser console for errors (F12 > Console)
- Some Reddit threads may have custom styling that affects selectors

### Export not working
- Check that you have permission to download files
- Verify clipboard permission is granted in extension settings
- Try a different export format

## Credits

Built with:
- [WXT](https://wxt.dev/) - Web extension framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Lucide React](https://lucide.dev/) - Icons
