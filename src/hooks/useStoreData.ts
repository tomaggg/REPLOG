import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import type { DataStore } from "~/services/data-store";

/**
 * Load something from the data store and keep it in state.
 */
export function useStoreData<T>(
  load: (store: DataStore) => Promise<T>,
  initialValue: T,
  errorFallback = "Could not load data.",
) {
  const { store } = useStore();
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest `load` without making callers memoize it
  const loadRef = useRef(load);
  loadRef.current = load;

  const refresh = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    try {
      setData(await loadRef.current(store));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, errorFallback));
    } finally {
      setLoading(false);
    }
  }, [store, errorFallback]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, setError, refresh };
}
