import { beforeEach, describe, expect, test } from 'vitest';
import type { PlotData } from '../types/plot';
import { clearStorage, loadFromStorage, saveToStorage } from '../utils/storage';

const SAMPLE: PlotData = {
  workTitle: 'テスト作品',
  workTheme: 'テーマ',
  scenes: [],
  characters: ['キャラA'],
  refLayouts: [],
  nextId: 100,
  _format: 'manga-plot-editor-v2',
};

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('データがない場合 null を返す', () => {
    expect(loadFromStorage()).toBeNull();
  });

  test('saveToStorage → loadFromStorage で同じデータが復元される', () => {
    saveToStorage(SAMPLE);
    const loaded = loadFromStorage();
    expect(loaded?.workTitle).toBe('テスト作品');
    expect(loaded?.characters).toEqual(['キャラA']);
    expect(loaded?.scenes).toEqual([]);
  });

  test('clearStorage 後は null を返す', () => {
    saveToStorage(SAMPLE);
    clearStorage();
    expect(loadFromStorage()).toBeNull();
  });

  test('壊れた JSON の場合 null を返す（クラッシュしない）', () => {
    localStorage.setItem('manga-plot-editor-v2', '{invalid json}');
    expect(loadFromStorage()).toBeNull();
  });

  test('saveToStorage は true を返す（成功）', () => {
    expect(saveToStorage(SAMPLE)).toBe(true);
  });
});
