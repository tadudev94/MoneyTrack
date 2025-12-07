import React from 'react';

// usePaging.ts
export function usePaging<T>(
  fetchFn: (page: number, pageSize: number, ...args: any[]) => Promise<T[]>,
  pageSize: number,
) {
  const [data, setData] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [params, setParams] = React.useState<any[]>([]);

  const loadPage = React.useCallback(
    async (reset = false, extraParams: any[] = params) => {
      if (loading || (!reset && !hasMore)) return;

      setLoading(true);
      const currentPage = reset ? 1 : page;
      const res = await fetchFn(currentPage, pageSize, ...extraParams);
      if (reset) {
        setData(res);
        setPage(2);
        setHasMore(res.length === pageSize);
        setParams(extraParams);
      } else {
        setData(prev => [...prev, ...res]);
        setPage(prev => prev + 1);
        if (res.length < pageSize) setHasMore(false);
      }

      setLoading(false);
    },
    [loading, hasMore, page, pageSize, fetchFn],
  );

  const reset = React.useCallback(
    async (extraParams: any[] = params) => {
      setPage(1);
      setHasMore(true);
      setData([]);
      setParams(extraParams);

      await loadPage(true, extraParams);
    },
    [loadPage, params],
  );

  return { data, loading, hasMore, loadPage, reset, setData, setParams};
}
