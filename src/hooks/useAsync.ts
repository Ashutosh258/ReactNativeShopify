import { useCallback, useEffect, useRef, useState } from 'react';

type Result<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

const LOADING = { status: 'loading', data: undefined, error: undefined } as const;

export function useAsync<T>(key: string, fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  const [attempt, setAttempt] = useState(0);
  const [silent, setSilent] = useState(false);
  const [settled, setSettled] = useState<{ token: string; result: Result<T> } | null>(null);
  const token = `${key}#${attempt}`;

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let active = true;
    fnRef.current().then(
      (data) => active && setSettled({ token, result: { status: 'success', data, error: undefined } }),
      (error: Error) => active && setSettled({ token, result: { status: 'error', data: undefined, error } }),
    );
    return () => {
      active = false;
    };
  }, [token]);

  const reload = useCallback(() => {
    setSilent(false);
    setAttempt((a) => a + 1);
  }, []);
  const refresh = useCallback(() => {
    setSilent(true);
    setAttempt((a) => a + 1);
  }, []);

  const current = settled?.token === token ? settled.result : null;
  const stale = silent && settled?.result.status === 'success' ? settled.result : null;
  const result: Result<T> = current ?? stale ?? LOADING;

  return { ...result, reload, refresh, refreshing: !current && !!stale };
}
