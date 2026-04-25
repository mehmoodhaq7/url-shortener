import { useState } from "react";
import { Scissors, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const UrlForm = ({ onCreate }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setLoading(true);
    try {
      await onCreate(originalUrl.trim(), customSlug.trim() || undefined);
      setOriginalUrl("");
      setCustomSlug("");
      setShowAdvanced(false);
      toast.success("Short URL created!");
    } catch (err) {
      toast.error(err.message || "Failed to create URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-white mb-4">Shorten a URL</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            className="input-field"
            placeholder="https://example.com/very/long/url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Snipping...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Snip it
              </span>
            )}
          </button>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Custom slug (optional)
        </button>

        {showAdvanced && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              localhost:3000/
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="my-custom-slug"
              value={customSlug}
              onChange={(e) =>
                setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default UrlForm;
