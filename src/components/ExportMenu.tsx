import React from 'react';
import { Download, Copy, FileJson, FileText } from 'lucide-react';
import { exportToJSON, exportToCSV, copyToClipboard, downloadFile } from '@/lib/export-utils';
import type { ScrapingResult } from '@/types/reddit';

interface ExportMenuProps {
  data: ScrapingResult;
  onClose?: () => void;
}

export function ExportMenu({ data, onClose }: ExportMenuProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const json = exportToJSON(data);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(json, `reddit-scrape-${timestamp}.json`, 'application/json');
      setMessage('✓ JSON exported');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error exporting JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const csv = exportToCSV(data);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(csv, `reddit-scrape-${timestamp}.csv`, 'text/csv');
      setMessage('✓ CSV exported');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error exporting CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJSON = async () => {
    setIsLoading(true);
    try {
      const json = exportToJSON(data);
      await copyToClipboard(json);
      setMessage('✓ Copied to clipboard');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error copying to clipboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">Export Options</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-sm rounded transition-colors"
        >
          <FileJson size={16} />
          JSON
        </button>
        <button
          onClick={handleExportCSV}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white text-sm rounded transition-colors"
        >
          <FileText size={16} />
          CSV
        </button>
        <button
          onClick={handleCopyJSON}
          disabled={isLoading}
          className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm rounded transition-colors"
        >
          <Copy size={16} />
          Copy JSON
        </button>
      </div>

      {message && <p className="text-sm text-slate-300 text-center">{message}</p>}
    </div>
  );
}
