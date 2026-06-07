import { useEffect, useRef, useState } from 'react';
import type { PlotData } from '../types/plot';
import { saveToStorage, setLastEditedAt } from '../utils/storage';

// データ消失対策 C: 保存ステータスを返し、失敗を検知できるようにする（§4）
export type SaveStatus = 'saved' | 'saving' | 'error';

export function useAutoSave(data: PlotData, loaded: boolean): SaveStatus {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>('saved');
  // 初期ロード直後の最初の保存は「ロードしたデータの書き戻し」であり実ユーザー編集ではない。
  // これを lastEditedAt に反映すると未編集の起動が最終編集扱いになり、リマインドを誤発火させる。
  // そこで loaded 成立時点の data 参照（ロードスナップショット）を覚えておき、
  // その参照を保存するときだけ lastEditedAt 更新をスキップする。
  // 実ユーザー編集は App の useMemo により必ず別参照の data を生むため、
  // 初回保存タイマーが編集でキャンセルされても編集後保存は確実に lastEditedAt を更新する。
  // 参照ベースなので StrictMode の二重実行でも判定がぶれない。
  const initialDataRef = useRef<PlotData | null>(null);

  useEffect(() => {
    if (!loaded) return;
    // loaded 成立後の最初の data をロードスナップショットとして1度だけ記録。
    if (initialDataRef.current === null) {
      initialDataRef.current = data;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');
    timerRef.current = setTimeout(() => {
      let ok = false;
      try {
        ok = saveToStorage(data);
      } catch {
        ok = false;
      }
      if (ok) {
        // ロードスナップショット以外（＝実ユーザー編集）の保存でのみ最終編集時刻を更新。
        if (data !== initialDataRef.current) {
          setLastEditedAt();
        }
        setStatus('saved');
      } else {
        setStatus('error');
      }
    }, 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, loaded]);

  return status;
}
