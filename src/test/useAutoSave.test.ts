import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useAutoSave } from '../hooks/useAutoSave';
import type { PlotData } from '../types/plot';

// storage をモックして保存結果を制御する。
const saveToStorage = vi.fn();
const setLastEditedAt = vi.fn();
vi.mock('../utils/storage', () => ({
  saveToStorage: (...args: unknown[]) => saveToStorage(...args),
  setLastEditedAt: (...args: unknown[]) => setLastEditedAt(...args),
}));

const DATA: PlotData = {
  workTitle: 'x',
  workTheme: '',
  scenes: [],
  characters: [],
  refLayouts: [],
  nextId: 100,
  _format: 'manga-plot-editor-v2',
};

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    saveToStorage.mockReset();
    setLastEditedAt.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('loaded=false の間は保存せず "saved" のまま', () => {
    const { result } = renderHook(() => useAutoSave(DATA, false));
    act(() => vi.advanceTimersByTime(1000));
    expect(saveToStorage).not.toHaveBeenCalled();
    expect(result.current).toBe('saved');
  });

  test('debounce 中は "saving"、成功で "saved"（初期ロード直後の保存）', () => {
    saveToStorage.mockReturnValue(true);
    const { result } = renderHook(() => useAutoSave(DATA, true));
    // 直後は saving
    expect(result.current).toBe('saving');
    act(() => vi.advanceTimersByTime(600));
    expect(saveToStorage).toHaveBeenCalledTimes(1);
    expect(result.current).toBe('saved');
  });

  test('初期ロード直後の最初の保存では lastEditedAt を更新しない（未編集を編集扱いしない）', () => {
    saveToStorage.mockReturnValue(true);
    renderHook(() => useAutoSave(DATA, true));
    act(() => vi.advanceTimersByTime(600));
    expect(setLastEditedAt).not.toHaveBeenCalled();
  });

  test('ユーザー編集後（2回目以降）の保存では lastEditedAt を更新する', () => {
    saveToStorage.mockReturnValue(true);
    const { rerender } = renderHook(({ d }) => useAutoSave(d, true), {
      initialProps: { d: DATA },
    });
    // 1回目（ロード書き戻し）はスキップ。
    act(() => vi.advanceTimersByTime(600));
    expect(setLastEditedAt).not.toHaveBeenCalled();
    // データ変更（ユーザー編集）→ 2回目の保存。
    rerender({ d: { ...DATA, workTitle: 'edited' } });
    act(() => vi.advanceTimersByTime(600));
    expect(setLastEditedAt).toHaveBeenCalledTimes(1);
  });

  test('ロード直後600ms以内に編集すると、初回タイマーがキャンセルされても lastEditedAt を更新する', () => {
    saveToStorage.mockReturnValue(true);
    const { rerender } = renderHook(({ d }) => useAutoSave(d, true), {
      initialProps: { d: DATA },
    });
    // 初回保存タイマーが発火する前（600ms 未満）に編集してキャンセルさせる。
    act(() => vi.advanceTimersByTime(300));
    rerender({ d: { ...DATA, workTitle: 'edited' } });
    // 編集後データの保存が「最初に成功する保存」になるが、ロードスナップショットとは
    // 別参照なのでスキップ対象にならず lastEditedAt が更新される。
    act(() => vi.advanceTimersByTime(600));
    expect(saveToStorage).toHaveBeenCalledTimes(1);
    expect(setLastEditedAt).toHaveBeenCalledTimes(1);
  });

  test('saveToStorage が false を返すと "error"（lastEditedAt は更新しない）', () => {
    saveToStorage.mockReturnValue(false);
    const { result } = renderHook(() => useAutoSave(DATA, true));
    act(() => vi.advanceTimersByTime(600));
    expect(result.current).toBe('error');
    expect(setLastEditedAt).not.toHaveBeenCalled();
  });

  test('saveToStorage が例外を投げても "error" として検知（private mode 想定）', () => {
    saveToStorage.mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const { result } = renderHook(() => useAutoSave(DATA, true));
    act(() => vi.advanceTimersByTime(600));
    expect(result.current).toBe('error');
  });
});
