import { beforeEach, describe, expect, test } from 'vitest';
import type { PlotData } from '../types/plot';
import {
  clearStorage,
  dismissPreimport,
  getLastEditedAt,
  getLastManualBackupAt,
  getPreimportAt,
  hasPendingPreimport,
  loadFromStorage,
  readPreimportBackup,
  savePreimportBackup,
  saveToStorage,
  setLastEditedAt,
  setLastManualBackupAt,
} from '../utils/storage';

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

describe('preimport（軽量F: import 前退避）', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('退避していなければ null を返す', () => {
    expect(readPreimportBackup()).toBeNull();
  });

  test('savePreimportBackup → readPreimportBackup で元に戻る', () => {
    expect(savePreimportBackup(SAMPLE)).toBe(true);
    expect(readPreimportBackup()?.workTitle).toBe('テスト作品');
  });

  test('退避はメイン保存キーとは独立している', () => {
    savePreimportBackup(SAMPLE);
    // preimport を退避してもメインデータは未保存のまま。
    expect(loadFromStorage()).toBeNull();
  });

  test('壊れた preimport は null を返す（クラッシュしない）', () => {
    localStorage.setItem('manga-plot-editor-v2.preimport', '{invalid}');
    expect(readPreimportBackup()).toBeNull();
  });

  test('savePreimportBackup は退避日時 preimportAt も記録する', () => {
    savePreimportBackup(SAMPLE, new Date('2026-06-07T00:00:00.000Z'));
    expect(getPreimportAt()).toBe('2026-06-07T00:00:00.000Z');
  });
});

describe('復元導線の永続判定（軽量F: hasPendingPreimport / dismissPreimport）', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('退避が無ければ導線は出ない', () => {
    expect(hasPendingPreimport()).toBe(false);
  });

  test('import 成功（退避あり）後はリロードしても導線が出る', () => {
    savePreimportBackup(SAMPLE);
    // 別キーの React state に依存せず localStorage だけで判定できる＝リロード後も維持。
    expect(hasPendingPreimport()).toBe(true);
  });

  test('却下（dismiss）後は同じ退避では導線が出ない', () => {
    savePreimportBackup(SAMPLE);
    dismissPreimport();
    expect(hasPendingPreimport()).toBe(false);
    // 退避データ自体は残す（おまけの安全網）。
    expect(readPreimportBackup()?.workTitle).toBe('テスト作品');
  });

  test('却下後に新たな import（退避更新）があれば導線は再び出る', () => {
    savePreimportBackup(SAMPLE, new Date('2026-06-07T00:00:00.000Z'));
    dismissPreimport();
    expect(hasPendingPreimport()).toBe(false);
    // 新しい退避は preimportAt が変わるので却下マークと一致せず、再表示される。
    savePreimportBackup(SAMPLE, new Date('2026-06-08T00:00:00.000Z'));
    expect(hasPendingPreimport()).toBe(true);
  });

  test('退避データが消えていれば（preimportAt だけ残っても）導線は出ない', () => {
    savePreimportBackup(SAMPLE);
    localStorage.removeItem('manga-plot-editor-v2.preimport');
    expect(hasPendingPreimport()).toBe(false);
  });
});

describe('lastManualBackupAt / lastEditedAt（B: バックアップ日時）', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('未記録なら null', () => {
    expect(getLastManualBackupAt()).toBeNull();
    expect(getLastEditedAt()).toBeNull();
  });

  test('set した日時が ISO 文字列で読み出せる', () => {
    const d = new Date('2026-06-07T00:00:00.000Z');
    setLastManualBackupAt(d);
    setLastEditedAt(d);
    expect(getLastManualBackupAt()).toBe(d.toISOString());
    expect(getLastEditedAt()).toBe(d.toISOString());
  });

  test('reload 後も保持される（別 localStorage インスタンスからも読める想定）', () => {
    setLastEditedAt(new Date('2026-06-07T12:00:00.000Z'));
    // localStorage は永続なので再読込しても残る。
    expect(getLastEditedAt()).toBe('2026-06-07T12:00:00.000Z');
  });
});
