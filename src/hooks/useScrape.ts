import React from 'react';
import type { ScrapingResult } from '@/types/reddit';

interface UseScrapeState {
  data: ScrapingResult | null;
  loading: boolean;
  error: string | null;
}

export function useScrape() {
  const [state, setState] = React.useState<UseScrapeState>({
    data: null,
    loading: false,
    error: null,
  });

  const scrape = async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeThread' });

      if (response.success) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Failed to scrape thread',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  };

  return { ...state, scrape };
}
