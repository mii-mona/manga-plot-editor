import type { PlotData } from '../types/plot';

const STORAGE_KEY = 'manga-plot-editor-v2';
// データ消失対策で使う付随キー（docs/design/data-loss-protection.md §3 / §6）
const PREIMPORT_KEY = `${STORAGE_KEY}.preimport`;
const PREIMPORT_AT_KEY = `${STORAGE_KEY}.preimportAt`;
// この退避を「消化済み（復元 or 却下）」とマークした preimportAt（導線の再表示抑止）。
const PREIMPORT_DISMISSED_KEY = `${STORAGE_KEY}.preimportDismissedAt`;
const LAST_BACKUP_KEY = `${STORAGE_KEY}.lastManualBackupAt`;
const LAST_EDITED_KEY = `${STORAGE_KEY}.lastEditedAt`;

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

// ── 軽量F: import 前の1世代退避（§6） ──

/**
 * import 直前の現データを退避する。容量超過 / private mode で失敗し得るため boolean を返す。
 * 失敗時は import を中断する（復元ポイント無しで上書きしないため）。
 * 退避日時 `preimportAt` も記録する（リロード後の復元導線の判定/表示に使う）。
 */
export function savePreimportBackup(data: PlotData, at: Date = new Date()): boolean {
  try {
    localStorage.setItem(PREIMPORT_KEY, JSON.stringify(data));
    localStorage.setItem(PREIMPORT_AT_KEY, at.toISOString());
    return true;
  } catch {
    return false;
  }
}

/** 退避した1世代を読み出す。無い / 壊れている場合は null。 */
export function readPreimportBackup(): PlotData | null {
  try {
    const raw = localStorage.getItem(PREIMPORT_KEY);
    return raw ? (JSON.parse(raw) as PlotData) : null;
  } catch {
    return null;
  }
}

/** 退避日時（ISO 文字列）。無ければ null。 */
export function getPreimportAt(): string | null {
  try {
    return localStorage.getItem(PREIMPORT_AT_KEY);
  } catch {
    return null;
  }
}

/**
 * 復元導線を出すべきか判定する（リロード後も判定がぶれないよう localStorage で完結）。
 * 退避データ・退避日時が存在し、その退避をまだ消化（復元/却下）していない場合に true。
 */
export function hasPendingPreimport(): boolean {
  const at = getPreimportAt();
  if (!at) return false;
  if (readPreimportBackup() === null) return false;
  try {
    return localStorage.getItem(PREIMPORT_DISMISSED_KEY) !== at;
  } catch {
    return false;
  }
}

/**
 * 現在の退避を「消化済み」とマークし、復元導線を再表示しないようにする。
 * 退避データ自体は次の成功 import まで残す（おまけの安全網／§6）。
 */
export function dismissPreimport(): void {
  const at = getPreimportAt();
  if (!at) return;
  try {
    localStorage.setItem(PREIMPORT_DISMISSED_KEY, at);
  } catch {
    // ignore
  }
}

// ── B: 最終バックアップ日時 / 最終編集時刻（§3） ──

/** 外部書き出し（DL / コピー）成功時に最終バックアップ日時を記録する。 */
export function setLastManualBackupAt(date: Date = new Date()): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, date.toISOString());
  } catch {
    // ignore
  }
}

/** 最終バックアップ日時（ISO 文字列）。未記録なら null。 */
export function getLastManualBackupAt(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/** auto-save 成功時に最終編集時刻を記録する。 */
export function setLastEditedAt(date: Date = new Date()): void {
  try {
    localStorage.setItem(LAST_EDITED_KEY, date.toISOString());
  } catch {
    // ignore
  }
}

/** 最終編集時刻（ISO 文字列）。未記録なら null。 */
export function getLastEditedAt(): string | null {
  try {
    return localStorage.getItem(LAST_EDITED_KEY);
  } catch {
    return null;
  }
}
