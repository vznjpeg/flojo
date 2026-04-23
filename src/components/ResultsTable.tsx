import React from 'react';
import type { RedditComment } from '@/types/reddit';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ResultsTableProps {
  comments: RedditComment[];
  onlyTop?: boolean;
}

export function ResultsTable({ comments, onlyTop = true }: ResultsTableProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const displayComments = onlyTop ? comments : comments;

  const renderComment = (comment: RedditComment, index: number) => {
    const isExpanded = expandedIds.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div key={comment.id} className="border-b border-slate-700 py-3">
        <div className="flex items-start gap-3">
          {hasReplies && (
            <button
              onClick={() => toggleExpand(comment.id)}
              className="mt-1 p-0.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-slate-400" />
              ) : (
                <ChevronRight size={16} className="text-slate-400" />
              )}
            </button>
          )}
          {!hasReplies && <div className="w-6" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200 truncate">{comment.username}</span>
              <span className="text-xs text-slate-500">{comment.timestamp}</span>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                {comment.upvotes} ↑
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-2 break-words">{comment.text}</p>
          </div>
        </div>

        {isExpanded && hasReplies && (
          <div className="ml-8 mt-3 space-y-3 border-l border-slate-700 pl-3">
            {comment.replies.map((reply) => renderComment(reply, 0))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {displayComments.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">No comments found</p>
      ) : (
        displayComments.map((comment, index) => renderComment(comment, index))
      )}
    </div>
  );
}
