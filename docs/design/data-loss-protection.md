# 設計: データ消失対策（バックアップ強化 / ロードマップ v2 ②）

ステータス: **設計確定 / 実装前**
最終更新: 2026-06-07
関連: [roadmap.md](../roadmap.md) P1-②

公開ゲート（必須機能）の2つ目。他人に勧めるツールでデータが飛ぶのは致命的なため、
多層でデータ消失を防ぐ。

---

## 採用スコープ

| 区分 | 対策 | 採用 |
|------|------|------|
| core | **A. JSONファイル DL / 読込**（Blob + file picker） | ✅ |
| core | **B. 最終バックアップ日時の表示＋リマインド** | ✅ |
| core | **C. localStorage 保存失敗の検知＆警告** | ✅ |
| core | **D. Persistent Storage 要求**（`navigator.storage.persist()`、補助扱い） | ✅ |
| core | **軽量F. import 前に1世代自動退避→復元** | ✅ |
| 見送り | E. File System Access API「上書き保存」 | ⏭ core の次（別途） |
| 見送り | F-full. ローリングバックアップ（直近N世代） | ⏭ 軽量Fで代替、必要なら拡張 |
| 見送り | G. IndexedDB 移行 | ⏭ localStorage 据え置き |

ストレージ基盤は **localStorage のまま**（テキスト中心で数MB上限に収まるため）。

---

## 1. 背景: 現状とリスク

現状（[App.tsx](../../src/App.tsx) / [storage.ts](../../src/utils/storage.ts)）:
- 自動保存: 変更ごと localStorage 単一キー `manga-plot-editor-v2` に 600ms debounce
- 手動エクスポート: JSON をモーダル表示 → 「全文コピー」→ ユーザーが貼り付け保存
- 手動インポート: JSON 貼り付け → 復元（`resetBaseline` で履歴クリア）

リスク:
1. **localStorage クリアで全消失**（データ削除 / プライベートモード / eviction）。防御が手動コピペのみで摩擦大 → **A・D**
2. **保存失敗が無言**: `saveToStorage` は容量超過時 `false` を返すだけで通知なし → **C**
3. **単一スロット**: 世代が無く、誤 import / migration が唯一のコピーを上書き。今は import で undo 履歴も消える → **軽量F**
4. **定期バックアップの習慣が付かない** → **B**

---

## 2. A. JSON ファイル DL / 読込

**目的**: コピペ摩擦を解消し、ブラウザ外に実ファイルのコピーを作る。全ブラウザ/スマホ対応。

新規 `src/utils/backup.ts`:
```ts
// 文字列 JSON を Blob 化してダウンロード
export function downloadJson(json: string, filename: string): void;
// File を読んで文字列を返す（FileReader / file.text()）
export function readJsonFile(file: File): Promise<string>;
// 作品名から安全なファイル名を生成
export function backupFilename(workTitle: string, now?: Date): string;
//   例: "<title>-2026-06-07.json"。title 空や禁則文字は "untitled" / "_" に正規化
```

UI:
- **エクスポート**: `ExportModal` に「ファイルに保存」ボタンを追加（既存「全文をコピー」と併置）。
  押下で `downloadJson(exportData, backupFilename(workTitle))`。
  - **重要（指摘1）**: A は「バックアップ対策」なので、**エクスポート実行時に `lastManualBackupAt` を記録**する
    （ファイルDL／全文コピーの両方）。これが無いと B のリマインドが成立しない。
    ※ ダウンロードはブラウザ仕様上"完了"を観測できないため、例外なく発火した時点で「実行した」とみなして記録する
    （厳密な完了確認は E. File System Access で初めて可能）。
- **インポート（復元）**: 「JSONを貼り付けて復元」と「JSONファイルから読み込み」を
  **同じ復元モーダル（`ImportModal`）内に2手段として併置**（指摘5。責務重複による混乱を避ける）。
  - ファイル: `<input type="file" accept="application/json,.json">` → `readJsonFile`
  - どちらも共通の import 経路（`migrateData` → 軽量F退避 → `resetBaseline`）へ流す。

ファイル名は `manga-project-data`（`project-x/latest.json` + `backups/YYYY-MM-DD.json`）運用に手で載せやすい形にする。

---

## 3. B. 最終バックアップ日時の表示＋リマインド

**「バックアップ」= ユーザーが明示的に外部へ書き出した操作**（ファイルDL / 全文コピー）。
localStorage 自動保存は"同じ脆い場所"なのでバックアップに数えない。

- 別キー `manga-plot-editor-v2.lastManualBackupAt`（ISO 文字列）に記録。DL / コピー時に更新。
- 併せて「最後のバックアップ以降に編集があるか」を判定するため、保存時に `dirtySinceBackup` を立てる
  （実装は lastManualBackupAt と「最終編集時刻」の比較で代替可）。
- 表示: サイドバーに「最終バックアップ: YYYY-MM-DD（N日前）」。未実施なら「まだバックアップしていません」。
- リマインド（控えめに）: `dirtySinceBackup` かつ前回から **7日以上**経過時のみ、
  バックアップ導線を強調 or 軽いバナー。常時うるさく出さない。

---

## 4. C. localStorage 保存失敗の検知＆警告

`saveToStorage` は既に `boolean` を返す（[storage.ts:14](../../src/utils/storage.ts#L14)）。現状 `useAutoSave` が戻り値を捨てている（storage.ts だけでは完結せず、フック側の変更が必須／指摘4）。

- **`useAutoSave` が保存ステータスを返す設計に変更**:
  ```ts
  type SaveStatus = 'saved' | 'saving' | 'error';
  function useAutoSave(data: PlotData, loaded: boolean): SaveStatus;
  //   debounce 開始で 'saving'、saveToStorage()=true で 'saved'、false/例外で 'error'
  ```
- `App` はこの status を受けて UI 表示:
  - 通常時: 控えめな「保存済み / 保存中…」インジケータ（任意・小）。
  - `'error'`: **永続バナー**「⚠️ 自動保存に失敗しました（容量超過の可能性）。今すぐバックアップを書き出してください。」
    - バナーから直接エクスポートを開けるようにする。
- プライベートモード等で `setItem` 自体が例外を投げるケースもこの経路で `'error'` として検知できる。

---

## 5. D. Persistent Storage 要求

新規 `src/utils/persistence.ts`:
```ts
export async function ensurePersistentStorage(): Promise<boolean>;
//   navigator.storage?.persisted() で既許可を確認
//   未許可なら navigator.storage.persist() を一度だけ要求
//   API 非対応/失敗は false を返すだけ（throw しない）
```

- **位置づけは"補助"（指摘2）**。eviction（容量逼迫時の自動退避）リスクを**下げる**だけで、
  許可されても「絶対に消えない」保証ではない。A（外部ファイル）が一次防御、D は補助。
- 呼ぶタイミング: アプリ初期ロード完了後に一度。
- **UI 文言の注意**: 「保護済み」「安全」と**断言しない**。出すとしても「消えにくくなりました」程度に留める。
- "要求"であり**必ず許可される保証はない**（安い保険）。許可状況は必須では表示しない。

---

## 6. 軽量F. import 前に1世代退避 → 復元

**目的**: 「誤って変な JSON を import して全消し」を救済（現状 import は undo 不可＝`resetBaseline` が履歴クリア）。

- import 実行の**直前**に、現在の doc を別キー `manga-plot-editor-v2.preimport` に退避（JSON 文字列）。
  - paste / file どちらの import 経路でも通る共通処理にする。
- import 完了後、**「インポート前に戻す」**導線を提示:
  - 例: 画面下に一時バナー「インポートしました ↺ インポート前に戻す」。
  - 押下で `preimport` を読み、`resetBaseline` で復元。
- `preimport` は localStorage 上なので**リロードしても次の import まで残る**（おまけの安全網）。
- フル版ローリングバックアップ（直近N世代）は今回見送り。必要になれば拡張。

---

## 7. 見送り（記録）

### E. File System Access API「上書き保存」（core の次）
- PC の実ファイルに保存し、同じファイルへ上書きし続けられる（Chrome/Edge desktop のみ、他は A にフォールバック）。
- `manga-project-data` の `latest.json` をワンクリック上書き → commit、という運用と好相性。
- `FileSystemFileHandle` を IndexedDB に保存して次回起動でも同じファイルへ、等で実装増のため core の後に別途。

### G. IndexedDB 移行（保留）
- 大容量・やや堅牢だが非同期 API への書き換えコスト。テキスト中心の現状では localStorage で足りる。
- 「参考画像の貼り付け」(roadmap いつか) を入れる段で再検討。

---

## 8. 影響範囲（実装ファイル）

| ファイル | 変更 |
|----------|------|
| `src/utils/backup.ts` | 新規（downloadJson / readJsonFile / backupFilename） |
| `src/utils/persistence.ts` | 新規（ensurePersistentStorage） |
| `src/utils/storage.ts` | 退避/日時用キーの read/write 追加（preimport / lastManualBackupAt） |
| `src/hooks/useAutoSave.ts` | 保存失敗を通知できるよう変更（C） |
| `src/components/ExportModal.tsx` | 「ファイルに保存」ボタン追加 |
| `src/components/ImportModal.tsx` | 「ファイルから読込」ボタン追加 |
| `src/components/Sidebar.tsx` | 最終バックアップ日時表示・リマインド |
| `src/App.tsx` | 保存失敗バナー / import 前退避 + 復元導線 / 起動時 persist / 日時更新の配線 |

---

## 9. エッジケース / 割り切り

- バックアップ日時は「外部書き出し操作」基準。コピーしただけで実際に保存しなかった場合は検知不能（割り切り）。
- Persistent Storage は許可されない場合がある（保険であり保証ではない）。
- 軽量F の退避は1世代のみ。連続 import すると古い退避は上書きされる。
- ファイル import の JSON 不正時は既存同様アラート表示し、退避は行うが doc は変更しない。

---

## 10. 実装タスク

1. `src/utils/backup.ts`（downloadJson / readJsonFile / backupFilename）+ テスト
2. `src/utils/persistence.ts`（ensurePersistentStorage）
3. `storage.ts` に preimport / lastManualBackupAt の read/write 追加
4. `useAutoSave` の保存失敗通知 → `App` で警告バナー（C）
5. `ExportModal`「ファイルに保存」/ `ImportModal`「ファイルから読込」（A）
6. import 前退避 + 「インポート前に戻す」導線（軽量F）
7. `Sidebar` 最終バックアップ日時 + 7日リマインド（B）
8. 起動時 `ensurePersistentStorage()`（D）
9. テスト:
   - backupFilename 正規化（空/禁則文字）
   - readJsonFile の正常/不正
   - useAutoSave が status を返す（saved/saving/error）／保存失敗時にバナーが出る（saveToStorage を false に）
   - import 前退避 → 復元で元に戻る
   - lastManualBackupAt 更新とリマインド閾値

---

## 11. レビュー反映状況

| 重大度 | 指摘 | 反映箇所 |
|--------|------|----------|
| High | A を BU 対策にするなら成功状態（最終BU日時）の記録が必要 | §2 エクスポート時に `lastManualBackupAt` 記録を明記（DL完了は観測不可の注記付き） |
| Medium | D は補助扱い。「安全/保護済み」と断言しない | §5 位置づけを"補助"に・UI文言の注意を追記 |
| Medium | 軽量F（import前退避）は core に入れるべき | スコープ表で 追加→**core** に格上げ・F-full は見送り明記 |
| Medium | C は storage.ts だけで完結せず、useAutoSave が status を返す設計が必要 | §4 `SaveStatus = 'saved'｜'saving'｜'error'` を返す形に具体化 |
| Low | A の「読込」と貼り付け import の責務重複 | §2 同一の復元モーダルに2手段として併置 |
