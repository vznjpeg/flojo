import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useScrape } from '@/hooks/useScrape';
import { ResultsTable } from '@/components/ResultsTable';
import { ExportMenu } from '@/components/ExportMenu';

export function Popup() {
  const { data, loading, error, scrape } = useScrape();
  const [showExport, setShowExport] = React.useState(false);

  const isReddit = window.location.hostname.includes('reddit.com');

  return (
    <div className="w-full max-w-2xl bg-slate-900 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4">
        <h1 className="text-xl font-bold mb-1">Reddit Thread Scraper</h1>
        <p className="text-xs text-slate-400">Extract comments, timestamps, and upvotes</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Messages */}
        {!isReddit && (
          <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              This extension only works on reddit.com. Please navigate to a Reddit thread first.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200 font-semibold">Error</p>
              <p className="text-xs text-red-200">{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-200 font-semibold">Successfully scraped!</p>
              <p className="text-xs text-green-200">Found {data.totalComments} comments</p>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={scrape}
          disabled={loading || !isReddit}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Scrape Current Thread
            </>
          )}
        </button>

        {/* Results */}
        {data && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{data.totalComments}</p>
                <p className="text-xs text-slate-400">Comments</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {new Date(data.scrapedAt).toLocaleTimeString()}
                </p>
                <p className="text-xs text-slate-400">Scraped at</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {Math.round(data.comments.reduce((sum, c) => sum + c.upvotes, 0) / (data.totalComments || 1))}
                </p>
                <p className="text-xs text-slate-400">Avg upvotes</p>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowExport(!showExport)}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
            >
              {showExport ? '↑ Hide Export' : '↓ Show Export Options'}
            </button>

            {showExport && <ExportMenu data={data} />}

            {/* Results Table */}
            <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Comments</h3>
              <ResultsTable comments={data.comments} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && isReddit && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Click the button above to scrape this thread</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-3 text-xs text-slate-500 text-center">
        <p>Made with ❤️ | Manifest V3 Compatible</p>
      </div>
    </div>
  );
}
