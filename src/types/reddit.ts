export interface RedditComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  upvotes: number;
  level: number;
  elementId?: string;
  replies: RedditComment[];
}

export interface ScrapingResult {
  url: string;
  threadTitle?: string;
  totalComments: number;
  comments: RedditComment[];
  scrapedAt: string;
}

export type ExportFormat = 'json' | 'csv' | 'clipboard';
