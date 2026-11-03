import { useCallback, useEffect, useRef, useState } from 'react';

type Result<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

const LOADING = { status: 'loading', data: undefined, error: undefined } as const;

export function useAsync<T>(key: string, fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  const [attempt, setAttempt] = useState(0);
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

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  const result: Result<T> = settled?.token === token ? settled.result : LOADING;

  return { ...result, reload };
}
