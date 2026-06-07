import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { RefLayout, Scene } from '../types/plot';

/**
 * 履歴対象のドキュメント本体。
 * `nextId` / `_format` は定数扱いのため履歴には含めない（design/undo-redo.md §2）。
 */
export interface Doc {
  workTitle: string;
  workTheme: string;
  scenes: Scene[];
  characters: string[];
  refLayouts: RefLayout[];
}

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UpdateOptions {
  /** テキスト編集など「まとめ」対象。past には即積まず idle/scope 変化で確定する。 */
  transient?: boolean;
  /** transient のまとめ単位。`'<種別>:<id>:<field>'` 形式（design §3）。 */
  scope?: string;
}

export interface UseHistory {
  doc: Doc;
  update: (fn: (d: Doc) => Doc, opts?: UpdateOptions) => void;
  /** 保留中の transient を今すぐ 1 件 past へコミットする。 */
  flush: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** ロード / import 専用。past/future をクリアし present を差し替える。 */
  resetBaseline: (doc: Doc) => void;
}

/** past の上限。超過分は古い方から破棄（design §採用方針）。 */
const PAST_LIMIT = 50;
/** transient 編集の確定までのアイドル時間（ms）。 */
const IDLE_MS = 800;

function capPast<T>(past: T[]): T[] {
  return past.length > PAST_LIMIT ? past.slice(past.length - PAST_LIMIT) : past;
}

export function useHistory(initial: Doc): UseHistory {
  // 履歴本体は ref に持ち、変更時に forceRender で再描画する。
  // （functional setState の中で ref を書くと StrictMode の二重実行で壊れるため）
  const histRef = useRef<History<Doc>>({ past: [], present: initial, future: [] });
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  // 保留中（pending）の transient チャンク
  const pendingScopeRef = useRef<string | null>(null);
  const pendingBaselineRef = useRef<Doc | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    clearIdle();
    const baseline = pendingBaselineRef.current;
    pendingBaselineRef.current = null;
    pendingScopeRef.current = null;
    if (baseline === null) return;
    const h = histRef.current;
    histRef.current = {
      past: capPast([...h.past, baseline]),
      present: h.present,
      future: [],
    };
    forceRender();
  }, [clearIdle]);

  const update = useCallback(
    (fn: (d: Doc) => Doc, opts?: UpdateOptions) => {
      if (opts?.transient) {
        const scope = opts.scope ?? null;
        // 別 scope の編集は別履歴に分ける（#2）
        if (pendingScopeRef.current !== null && pendingScopeRef.current !== scope) {
          flush();
        }
        const h = histRef.current;
        if (pendingBaselineRef.current === null) {
          // 新しいチャンクの開始: 開始直前の present を baseline として記録し、redo をクリア
          pendingBaselineRef.current = h.present;
          pendingScopeRef.current = scope;
          histRef.current = { ...h, present: fn(h.present), future: [] };
        } else {
          // まとめ中: present だけ更新（past には積まない）
          histRef.current = { ...h, present: fn(h.present) };
        }
        forceRender();
        clearIdle();
        idleTimerRef.current = setTimeout(flush, IDLE_MS);
      } else {
        // 構造操作 / 即コミット: 保留を先に確定してから past へ積む
        flush();
        const h = histRef.current;
        histRef.current = {
          past: capPast([...h.past, h.present]),
          present: fn(h.present),
          future: [],
        };
        forceRender();
      }
    },
    [flush, clearIdle]
  );

  const undo = useCallback(() => {
    flush(); // 入力途中の Ctrl+Z で打ちかけのチャンクを確定してから undo（#1）
    const h = histRef.current;
    if (h.past.length === 0) return;
    const previous = h.past[h.past.length - 1];
    histRef.current = {
      past: h.past.slice(0, -1),
      present: previous,
      future: [h.present, ...h.future],
    };
    forceRender();
  }, [flush]);

  const redo = useCallback(() => {
    flush();
    const h = histRef.current;
    if (h.future.length === 0) return;
    const next = h.future[0];
    histRef.current = {
      past: [...h.past, h.present],
      present: next,
      future: h.future.slice(1),
    };
    forceRender();
  }, [flush]);

  const resetBaseline = useCallback(
    (doc: Doc) => {
      // ロード / import 専用。保留チャンクは破棄し、履歴を完全に差し替える。
      clearIdle();
      pendingBaselineRef.current = null;
      pendingScopeRef.current = null;
      histRef.current = { past: [], present: doc, future: [] };
      forceRender();
    },
    [clearIdle]
  );

  // アンマウント時に保留タイマを掃除
  useEffect(() => clearIdle, [clearIdle]);

  const h = histRef.current;
  return {
    doc: h.present,
    update,
    flush,
    undo,
    redo,
    // 保留チャンクがあれば flush 経由で取り消せるため undo 可能扱い
    canUndo: h.past.length > 0 || pendingBaselineRef.current !== null,
    canRedo: h.future.length > 0,
    resetBaseline,
  };
}
