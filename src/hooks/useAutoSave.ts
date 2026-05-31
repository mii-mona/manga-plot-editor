import { useEffect, useRef } from 'react';
import type { PlotData } from '../types/plot';
import { saveToStorage } from '../utils/storage';

export function useAutoSave(data: PlotData, loaded: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveToStorage(data), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, loaded]);
}
