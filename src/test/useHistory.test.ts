import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Doc } from '../hooks/useHistory';
import { useHistory } from '../hooks/useHistory';
import type { Scene } from '../types/plot';

function scene(id: string, title: string): Scene {
  return { id, title, plot: '', convey: '', pages: [] };
}

function doc(partial: Partial<Doc> = {}): Doc {
  return {
    workTitle: '無題の作品',
    workTheme: '',
    scenes: [],
    characters: [],
    refLayouts: [],
    ...partial,
  };
}

describe('useHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('初期状態は undo / redo 不可', () => {
    const { result } = renderHook(() => useHistory(doc()));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.doc.workTitle).toBe('無題の作品');
  });

  test('構造操作の即コミットと undo/redo 基本往復', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => {
      result.current.update((d) => ({ ...d, scenes: [...d.scenes, scene('a', 'A')] }));
    });
    expect(result.current.doc.scenes).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    expect(result.current.doc.scenes).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.doc.scenes).toHaveLength(1);
    expect(result.current.doc.scenes[0].id).toBe('a');
  });

  test('新規編集で future がクリアされる', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => result.current.update((d) => ({ ...d, scenes: [scene('a', 'A')] })));
    act(() => result.current.undo()); // future に積む
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.update((d) => ({ ...d, scenes: [scene('b', 'B')] })));
    expect(result.current.canRedo).toBe(false);
    expect(result.current.doc.scenes[0].id).toBe('b');
  });

  test('transient: 同一 scope はまとまり 1 履歴になる', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => {
      result.current.update((d) => ({ ...d, workTitle: 'あ' }), {
        transient: true,
        scope: 'work:title',
      });
    });
    act(() => {
      result.current.update((d) => ({ ...d, workTitle: 'あい' }), {
        transient: true,
        scope: 'work:title',
      });
    });
    expect(result.current.doc.workTitle).toBe('あい');

    // idle で 1 件だけ確定 → undo で開始前の状態へ戻る
    act(() => vi.advanceTimersByTime(800));
    act(() => result.current.undo());
    expect(result.current.doc.workTitle).toBe('無題の作品');
    expect(result.current.canUndo).toBe(false);
  });

  test('transient: scope が変わると別履歴に分かれる', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => {
      result.current.update((d) => ({ ...d, workTitle: 'T' }), {
        transient: true,
        scope: 'work:title',
      });
    });
    // 別 scope → 前のチャンクが flush される
    act(() => {
      result.current.update((d) => ({ ...d, workTheme: 'M' }), {
        transient: true,
        scope: 'work:theme',
      });
    });
    act(() => vi.advanceTimersByTime(800));

    // 1 回目の undo: theme 編集を取り消し
    act(() => result.current.undo());
    expect(result.current.doc.workTheme).toBe('');
    expect(result.current.doc.workTitle).toBe('T');

    // 2 回目の undo: title 編集を取り消し
    act(() => result.current.undo());
    expect(result.current.doc.workTitle).toBe('無題の作品');
  });

  test('idle 満了で transient が確定する', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => {
      result.current.update((d) => ({ ...d, workTitle: 'X' }), {
        transient: true,
        scope: 'work:title',
      });
    });
    // 確定前でも pending があるため canUndo は true
    expect(result.current.canUndo).toBe(true);

    act(() => vi.advanceTimersByTime(800));
    // past に積まれている
    act(() => result.current.undo());
    expect(result.current.doc.workTitle).toBe('無題の作品');
  });

  test('入力途中の undo で打ちかけチャンクが flush され、直前操作を誤って消さない (#1)', () => {
    const { result } = renderHook(() => useHistory(doc()));

    // 構造操作（即コミット）
    act(() => result.current.update((d) => ({ ...d, scenes: [scene('a', 'A')] })));
    // テキスト編集を開始（idle 満了前）
    act(() => {
      result.current.update((d) => ({ ...d, workTitle: '途中' }), {
        transient: true,
        scope: 'work:title',
      });
    });

    // idle を待たずに undo → まず打ちかけを確定し、それを取り消す
    act(() => result.current.undo());
    expect(result.current.doc.workTitle).toBe('無題の作品');
    expect(result.current.doc.scenes).toHaveLength(1); // 構造操作は残る

    // さらに undo で構造操作を取り消す
    act(() => result.current.undo());
    expect(result.current.doc.scenes).toHaveLength(0);
  });

  test('past 上限 50 を超えると古い履歴から破棄される', () => {
    const { result } = renderHook(() => useHistory(doc({ workTitle: 'init' })));

    // 60 回の即コミット（present を 1..60 に）
    for (let i = 1; i <= 60; i++) {
      act(() => result.current.update((d) => ({ ...d, workTitle: `v${i}` })));
    }
    expect(result.current.doc.workTitle).toBe('v60');

    // 50 回までは undo 可能。51 回目で底（最古に残る past）に達する
    for (let i = 0; i < 50; i++) {
      act(() => result.current.undo());
    }
    expect(result.current.canUndo).toBe(false);
    // 古い 'init'〜'v10' は破棄され、'v10' が最古の present として残る
    expect(result.current.doc.workTitle).toBe('v10');
  });

  test('resetBaseline 後は undo で空へ戻らない', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => result.current.update((d) => ({ ...d, scenes: [scene('a', 'A')] })));
    act(() =>
      result.current.resetBaseline(doc({ workTitle: 'ロード済み', scenes: [scene('x', 'X')] }))
    );

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    act(() => result.current.undo());
    expect(result.current.doc.workTitle).toBe('ロード済み');
    expect(result.current.doc.scenes[0].id).toBe('x');
  });

  test('resetBaseline は保留中の transient タイマを破棄する', () => {
    const { result } = renderHook(() => useHistory(doc()));

    act(() => {
      result.current.update((d) => ({ ...d, workTitle: '打ちかけ' }), {
        transient: true,
        scope: 'work:title',
      });
    });
    act(() => result.current.resetBaseline(doc({ workTitle: 'ロード' })));

    // タイマが残っていても古い pending を flush しないこと
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.doc.workTitle).toBe('ロード');
    expect(result.current.canUndo).toBe(false);
  });
});
