# Reddit Thread Scraper Extension - Codebase Documentation

## Overview

This is a modern Chrome extension built with WXT framework that scrapes Reddit comment threads and exports them in multiple formats. It's designed to be maintainable, type-safe, and extensible.

## Tech Stack

- **Framework**: WXT (Web Extension Tool)
- **UI**: React 18 + TypeScript
- **Styling**: CSS (Tailwind-like utility approach)
- **Icons**: Lucide React
- **Build Tool**: WXT (Vite-based)

## Project Structure

```
flojo/
├── src/
│   ├── entrypoints/              # Entry points for extension
│   │   ├── content.ts            # Content script (runs on reddit.com)
│   │   └── popup/
│   │       ├── index.tsx         # Popup entry point
│   │       ├── Popup.tsx         # Main React component
│   │       └── popup.css         # Popup styles
│   ├── components/               # Reusable React components
│   │   ├── ResultsTable.tsx      # Expandable comment tree display
│   │   └── ExportMenu.tsx        # Export format buttons
│   ├── hooks/                    # Custom React hooks
│   │   └── useScrape.ts          # Handles scraping logic
│   ├── lib/                      # Utilities
│   │   ├── reddit-scraper.ts     # DOM scraping logic
│   │   └── export-utils.ts       # Export formatters
│   └── types/                    # TypeScript definitions
│       └── reddit.ts             # Core types
├── public/                       # Static assets
│   └── icons/
│       └── icon.svg              # Extension icon
├── wxt.config.ts                 # Extension configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                      # User-facing documentation
```

## Key Files and Their Responsibilities

### Content Script (`src/entrypoints/content.ts`)

**Purpose**: Runs in the context of reddit.com pages and scrapes comment data

**Key Functionality**:
- Listens for messages from the popup
- Calls `scrapeRedditThread()` when requested
- Returns structured comment data or errors
- Runs automatically on all Reddit pages due to manifest configuration

**Communication Protocol**:
```typescript
// Popup sends:
{ action: 'scrapeThread' }

// Content script responds:
{ success: true, data: ScrapingResult }
// OR
{ success: false, error: string }
```

### Scraper (`src/lib/reddit-scraper.ts`)

**Purpose**: Core DOM scraping logic for Reddit comments

**Key Functions**:

1. `scrapeRedditThread()`: Main entry point
   - Finds all comment elements
   - Parses each comment
   - Builds tree structure from flat list
   - Returns `ScrapingResult` with metadata

2. `parseCommentElement()`: Extracts data from single comment
   - Username from author link
   - Comment text from multiple possible selectors
   - Timestamp from time element
   - Upvotes from vote display
   - Calculates nesting level

3. `buildCommentTree()`: Constructs nested reply structure
   - Creates map of all comments
   - Places replies under appropriate parents
   - Returns root-level comments with nested replies

**Selector Strategy**:
- Uses multiple selector fallbacks for robustness
- Tries data-testid attributes first (most stable)
- Falls back to classname/aria-label selectors
- Handles various Reddit DOM variations

### Popup Component (`src/entrypoints/popup/Popup.tsx`)

**Purpose**: Main UI for the extension

**Features**:
- Displays scraping status and progress
- Shows results in collapsible table
- Provides export options
- Statistics (comment count, timestamp, avg upvotes)

**State Management**:
- Uses `useScrape` hook for scraping logic
- Local state for UI (show/hide export menu)
- React hooks for side effects

**User Flow**:
1. Click "Scrape Current Thread" button
2. Content script extracts comments
3. Results display in table with expandable threads
4. Export menu shows options (JSON/CSV/Clipboard)

### Export Utilities (`src/lib/export-utils.ts`)

**Purpose**: Convert scraped data to exportable formats

**Exporters**:

1. `exportToJSON()`: Pretty-printed JSON
   - Full structured data with metadata
   - Preserves threading relationships
   - Client downloads `.json` file

2. `exportToCSV()`: Spreadsheet format
   - Headers: Username, Text, Timestamp, Upvotes, Level, URL
   - Proper quote escaping
   - Flattens nested comments (includes parent context via level)
   - Client downloads `.csv` file

3. `copyToClipboard()`: Direct clipboard
   - Uses modern Clipboard API
   - Handles permission errors gracefully
   - Great for sharing snippets

### Types (`src/types/reddit.ts`)

**Core Interfaces**:

```typescript
interface RedditComment {
  id: string;              // Unique identifier
  username: string;        // Comment author
  text: string;           // Comment body text
  timestamp: string;      // Posted time ("2 days ago")
  upvotes: number;        // Vote count
  level: number;          // Nesting depth (0 for top-level)
  elementId?: string;     // DOM element ID
  replies: RedditComment[]; // Child comments
}

interface ScrapingResult {
  url: string;            // Reddit thread URL
  threadTitle?: string;   // Post title
  totalComments: number;  // Total count
  comments: RedditComment[]; // Root-level comments
  scrapedAt: string;      // ISO timestamp
}
```

### Hook (`src/hooks/useScrape.ts`)

**Purpose**: Encapsulates scraping communication logic

**Behavior**:
- Gets active tab using Chrome API
- Sends message to content script
- Manages loading/error states
- Returns data and scrape function

**Usage**:
```typescript
const { data, loading, error, scrape } = useScrape();
scrape(); // Trigger scraping
```

## Important Design Decisions

### DOM Scraper Robustness
- **Why multiple selectors?** Reddit's DOM can change; multiple fallbacks increase resilience
- **Why data-testid first?** These are typically most stable (internal testing infrastructure)
- **Why limit nesting level?** Performance and preventing infinite loops

### React Architecture
- **Why hooks over class components?** Simpler, more composable, better for extensions
- **Why separate files?** Clear separation of concerns and easier to test
- **Why useScrape hook?** Decouples UI from communication logic

### Export Formats
- **JSON**: Complete data with structure preserved
- **CSV**: For spreadsheet analysis and data cleaning
- **Clipboard**: Quick sharing without file creation

## Extension Manifest

The manifest (generated by WXT from `wxt.config.ts`) includes:

**Permissions**:
- `storage`: For future persistent state
- `scripting`: To inject content script
- `activeTab`: To access current tab

**Host Permissions**:
- `*://reddit.com/*`: All Reddit URLs
- `*://www.reddit.com/*`: Reddit with www subdomain

**Manifest V3**: Uses modern extension format (no background page, service worker instead)

## Development Workflow

### Setup
```bash
npm install
npm run dev  # Watch mode with hot reload
```

### Building
```bash
npm run build    # Optimized build
npm run typecheck # Check TypeScript
npm run lint      # ESLint checks
```

### Testing Extension
1. `npm run dev` starts watching
2. Navigate to `chrome://extensions`
3. Click "Load unpacked", select `dist` folder
4. Go to reddit.com thread
5. Click extension icon, trigger scrape

### Debugging
- Content script: Inspector on reddit.com page (F12)
- Popup: Right-click extension icon > Inspect popup
- Messages: Both locations show in console

## Common Tasks

### Adding a New Export Format
1. Add new exporter function to `lib/export-utils.ts`
2. Create button in `ExportMenu.tsx`
3. Handle file download or clipboard copy

### Improving Scraper Accuracy
1. Inspect Reddit comment element in DevTools
2. Find CSS selector for the data
3. Add to appropriate selector list in `reddit-scraper.ts`
4. Test on different thread styles

### Styling Changes
1. Modify `popup.css` for popup styles
2. Use component-level styles in `.tsx` files via className
3. Consider dark mode (already implemented)

### Adding UI Features
1. Create new component in `components/`
2. Import and use in `Popup.tsx`
3. Style with Tailwind-like classes

## Common Issues and Solutions

### "Content script not responding"
- Reddit page may use old DOM structure
- Try adding new selectors to scraper
- Check console for errors (F12 on reddit.com)

### CSV has incorrect data
- Verify field escaping in `exportToCSV()`
- Check that comment text parsing captures full content
- May need to adjust selector in scraper

### Export buttons don't work
- Check browser download settings
- Verify clipboard permission in manifest
- Try different export format

## Performance Considerations

- **DOM Queries**: Limited to comment elements only, not entire page
- **String Operations**: Comment text processing could be optimized with regexes
- **Memory**: Comment tree stored in React state, cleared when new scrape happens
- **Async**: Scraping is non-blocking, UI remains responsive

## Security Considerations

- **No eval/innerHTML**: Uses only textContent and safe APIs
- **CSP Compliant**: Follows Manifest V3 security model
- **User Data**: Only scraped data is stored locally, never sent to servers
- **Permissions**: Minimized to only reddit.com and necessary APIs

## Future Improvements

- [ ] Background script for persistent storage
- [ ] Settings page for selector customization
- [ ] Batch thread scraping
- [ ] Reddit API integration (authenticated)
- [ ] Filter/search within results
- [ ] Custom data fields
- [ ] Thread timeline visualization
- [ ] Sentiment analysis of comments

## Debugging Tips

1. **Content Script Issues**:
   - Open Reddit page, press F12
   - Check Console tab for errors
   - Content script logs appear here

2. **Popup Issues**:
   - Right-click extension icon > "Inspect"
   - Check Console for React/message errors
   - Use React DevTools extension

3. **Message Passing**:
   - Add `console.log()` in content.ts when receiving message
   - Add `console.log()` in useScrape when response received
   - Verify message structure matches expected format

4. **Manifest Issues**:
   - Check `chrome://extensions` for errors
   - Verify host permissions match Reddit URLs
   - Ensure all script files exist in build output
