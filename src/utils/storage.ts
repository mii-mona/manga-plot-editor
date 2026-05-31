import type { PlotData } from '../types/plot';

const STORAGE_KEY = 'manga-plot-editor-v2';

export function loadFromStorage(): PlotData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlotData) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(data: PlotData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
