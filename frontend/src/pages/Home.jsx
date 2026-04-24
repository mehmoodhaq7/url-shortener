import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";
import { useUrls } from "../hooks/useUrls";

const Home = () => {
  const {
    urls,
    pagination,
    loading,
    error,
    page,
    setPage,
    createUrl,
    deleteUrl,
  } = useUrls();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Short links, <span className="text-indigo-400">instantly</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Paste a long URL and get a clean short link in seconds
        </p>
      </div>

      <UrlForm onCreate={createUrl} />

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <UrlTable
        urls={urls}
        pagination={pagination}
        loading={loading}
        page={page}
        setPage={setPage}
        onDelete={deleteUrl}
      />
    </main>
  );
};

export default Home;
