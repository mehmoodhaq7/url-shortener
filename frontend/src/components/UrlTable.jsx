import { useState } from "react";
import {
  Copy,
  Trash2,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import StatsBadge from "./StatsBadge";
import { copyToClipboard } from "../utils/clipboard";

const UrlTable = ({ urls, pagination, loading, page, setPage, onDelete }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleCopy = async (url) => {
    const success = await copyToClipboard(url.shortUrl);
    if (success) {
      setCopiedId(url.id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (url) => {
    if (!confirm(`Delete short URL "/${url.slug}"?`)) return;
    setDeletingId(url.id);
    try {
      await onDelete(url.id);
      toast.success("URL deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!urls.length) {
    return (
      <div className="card flex flex-col items-center justify-center h-40 text-gray-500">
        <p className="text-sm">No URLs yet — snip your first one above!</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Links</h2>
        {pagination && (
          <span className="text-xs text-gray-500">
            {pagination.total} total
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-800">
        {urls.map((url) => (
          <div
            key={url.id}
            className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-400 font-mono text-sm font-medium">
                  /{url.slug}
                </span>
                <StatsBadge clicks={url.clicks} />
              </div>
              <p className="text-gray-500 text-sm truncate">
                {url.originalUrl}
              </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Open link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCopy(url)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy short URL"
              >
                {copiedId === url.id ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleDelete(url)}
                disabled={deletingId === url.id}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Delete URL"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlTable;
