import type { RedditComment, ScrapingResult } from '@/types/reddit';

export function scrapeRedditThread(): ScrapingResult {
  const url = window.location.href;
  const threadTitle = extractThreadTitle();
  const comments: RedditComment[] = [];

  // Find all comment containers
  const commentElements = findComments();

  commentElements.forEach((element, index) => {
    const comment = parseCommentElement(element, index);
    if (comment) {
      comments.push(comment);
    }
  });

  return {
    url,
    threadTitle,
    totalComments: comments.length,
    comments: buildCommentTree(comments),
    scrapedAt: new Date().toISOString(),
  };
}

function findComments(): Element[] {
  const comments: Element[] = [];

  // Try multiple selectors for robustness
  const selectors = [
    'div[data-testid="comment"]',
    'div[data-testid*="comment"]',
    'article[data-testid*="post-container"]',
  ];

  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll(selector));
    if (elements.length > 0) {
      return elements;
    }
  }

  return comments;
}

function extractThreadTitle(): string {
  const selectors = [
    'h1',
    '[data-testid="post-title"]',
    'h3',
    '.Post__title',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      return element.textContent.trim();
    }
  }

  return 'Unknown Thread';
}

function parseCommentElement(element: Element, index: number): RedditComment | null {
  try {
    // Extract author
    const authorLink = element.querySelector(
      'a[data-testid="comment_author_link"], [data-testid*="author"]',
    ) as HTMLAnchorElement;
    const username = authorLink?.textContent?.trim() || authorLink?.getAttribute('href')?.replace('/u/', '') || `User_${index}`;

    // Extract timestamp
    const timestampElement = element.querySelector(
      'a[data-testid="comment_timestamp"], time, [data-testid*="timestamp"]',
    ) as HTMLElement;
    const timestamp = timestampElement?.textContent?.trim() || timestampElement?.getAttribute('title') || '';

    // Extract comment text
    let bodyText = extractCommentText(element);
    if (!bodyText || bodyText.length < 2) {
      return null;
    }

    // Extract upvotes
    const upvotes = extractUpvotes(element);

    // Generate unique ID
    const id = `comment_${username}_${index}_${Date.now()}`;

    return {
      id,
      username: username || 'Unknown User',
      text: bodyText,
      timestamp,
      upvotes,
      level: calculateCommentLevel(element),
      elementId: element.id || id,
      replies: [],
    };
  } catch (error) {
    console.error('Error parsing comment element:', error);
    return null;
  }
}

function extractCommentText(element: Element): string {
  // Try to find the comment body
  const selectors = [
    'div[data-testid*="comment-body"] p',
    'p[data-testid*="comment-text"]',
    '[data-testid="comment-text"]',
    '.comment p',
  ];

  let text = '';
  for (const selector of selectors) {
    const paragraphs = element.querySelectorAll(selector);
    if (paragraphs.length > 0) {
      paragraphs.forEach((p) => {
        text += (p.textContent?.trim() || '') + ' ';
      });
      break;
    }
  }

  return text.trim();
}

function extractUpvotes(element: Element): number {
  try {
    // Try multiple selectors
    const upvoteSelectors = [
      '[data-testid="upvote-button-count"]',
      '[aria-label*="upvote"]',
      '.votes',
      '[data-testid*="score"]',
    ];

    for (const selector of upvoteSelectors) {
      const upvoteElement = element.querySelector(selector) as HTMLElement;
      if (upvoteElement?.textContent) {
        const num = parseInt(upvoteElement.textContent.replace(/\D/g, '') || '0', 10);
        if (!isNaN(num)) {
          return num;
        }
      }
    }

    // Fallback: try to find any number that looks like a vote count
    const text = element.textContent || '';
    const numbers = text.match(/(\d+)\s*(upvote|point|vote)/i);
    if (numbers?.[1]) {
      return parseInt(numbers[1], 10);
    }

    return 0;
  } catch {
    return 0;
  }
}

function calculateCommentLevel(element: Element): number {
  let level = 0;
  let parent = element.parentElement;

  while (parent && parent !== document.body) {
    if (parent.getAttribute('data-testid')?.includes('comment') || parent.classList.contains('comment')) {
      level++;
    }
    parent = parent.parentElement;
  }

  return Math.min(level, 10);
}

function buildCommentTree(comments: RedditComment[]): RedditComment[] {
  const root: RedditComment[] = [];
  const map = new Map<string, RedditComment>();

  // Create a map of all comments
  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  // Build tree structure based on nesting level
  comments.forEach((comment) => {
    const treeNode = map.get(comment.id)!;
    if (comment.level === 0) {
      root.push(treeNode);
    } else {
      // Find parent at level - 1
      const parentLevel = comment.level - 1;
      for (let i = comments.indexOf(comment) - 1; i >= 0; i--) {
        if (comments[i].level === parentLevel) {
          const parent = map.get(comments[i].id);
          if (parent) {
            parent.replies.push(treeNode);
          }
          break;
        }
      }
    }
  });

  return root.length > 0 ? root : comments;
}
