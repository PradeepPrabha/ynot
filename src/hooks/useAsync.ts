import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; reload: () => void }

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const id = useRef(0);
  useEffect(() => {
    const mine = ++id.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then(
      (data) => { if (mine === id.current) setState({ data, loading: false, error: null }); },
      (e: unknown) => { if (mine === id.current) setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'Something went wrong.' }); },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
