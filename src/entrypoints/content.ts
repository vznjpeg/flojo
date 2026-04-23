import { scrapeRedditThread } from '@/lib/reddit-scraper';

console.log('Reddit Scraper content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeThread') {
    try {
      const result = scrapeRedditThread();
      sendResponse({ success: true, data: result });
    } catch (error) {
      console.error('Scraping error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});
