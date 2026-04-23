import type { RedditComment, ScrapingResult } from '@/types/reddit';

export function exportToJSON(data: ScrapingResult): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: ScrapingResult): string {
  const rows: string[] = [];

  rows.push('Username,Text,Timestamp,Upvotes,Level,URL');

  function addCommentRow(comment: RedditComment, threadUrl: string) {
    const escaped = (str: string) => `"${str.replace(/"/g, '""')}"`;
    rows.push(
      `${escaped(comment.username)},${escaped(comment.text)},${escaped(comment.timestamp)},${comment.upvotes},${comment.level},${escaped(threadUrl)}`,
    );
    comment.replies.forEach((reply) => addCommentRow(reply, threadUrl));
  }

  data.comments.forEach((comment) => addCommentRow(comment, data.url));
  return rows.join('\n');
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
