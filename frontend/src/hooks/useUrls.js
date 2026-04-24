import { useState, useEffect } from "react";
import { urlService } from "../services/api";

export const useUrls = () => {
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await urlService.getAll(page);

        if (!cancelled) {
          setUrls(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const createUrl = async (originalUrl, customSlug) => {
    const res = await urlService.shorten(originalUrl, customSlug);

    const refreshed = await urlService.getAll(page);
    setUrls(refreshed.data);
    setPagination(refreshed.pagination);

    return res.data;
  };

  const deleteUrl = async (id) => {
    await urlService.delete(id);

    const refreshed = await urlService.getAll(page);
    setUrls(refreshed.data);
    setPagination(refreshed.pagination);
  };

  return {
    urls,
    pagination,
    loading,
    error,
    page,
    setPage,
    createUrl,
    deleteUrl,
  };
};
