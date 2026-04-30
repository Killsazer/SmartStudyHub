import { useEffect, useState } from 'react';

export function useDelayedFlag(value: boolean, delay = 200): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!value) {
      setDelayed(false);
      return;
    }
    const timer = window.setTimeout(() => setDelayed(true), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return delayed;
}
