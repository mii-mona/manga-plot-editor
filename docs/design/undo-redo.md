# 設計: Undo / Redo（ロードマップ v2 ①）

ステータス: **設計確定 / 実装前**（レビュー指摘 6 点を反映済み）
最終更新: 2026-06-07
関連: [roadmap.md](../roadmap.md) P1-①

編集ツールとして最重要級の機能。誤削除が即 localStorage に保存されると復旧不能なため、
v2 の公開ゲート（必須機能）として最初に実装する。

---

## 採用方針サマリ

| 項目 | 決定 |
|------|------|
| 実装方式 | **自前フック（依存ゼロ）**。王道の past / present / future パターン |
| 履歴の持ち方 | **スナップショット**（イミュータブル更新を活かし変更前オブジェクト参照を積む。deep copy 不要） |
| 対象スコープ | ドキュメント5項目のみ。UI状態は履歴に含めない |
| 状態統合 | 分散していた5つの `useState` を**単一 `doc` state** に集約し、履歴フックで管理 |
| テキスト編集のまとめ | **アイドル debounce（~800ms）＋ scope 単位**。構造操作は即コミット |
| キー操作 | ドキュメント編集に対しては**一律アプリ undo**（Ctrl+Z / Ctrl+Shift+Z）＋ヘッダーボタン。**モーダル表示中は無効** |
| 履歴上限 | past 50 件。超過分は古い方から破棄。新規編集で future クリア |
| 全データ削除ボタン | **廃止**（§5）。やり直しは場面削除＋import で代替。データ消失対策(②)の思想と矛盾するため |

---

## 1. 背景: 現状の状態管理

[App.tsx](../../src/App.tsx) は、ドキュメント状態を5つの `useState` に分散して保持している。

- `scenes` / `characters` / `workTitle` / `workTheme` / `refLayouts`
- これらを `useMemo` で `plotData` に合成 → `useAutoSave` が 600ms debounce で localStorage 保存
- 全更新はイミュータブル（`.map` / spread で新オブジェクト生成）

**課題**: 5項目が独立しているため、import のように複数項目を同時に変える操作を
「1操作＝1履歴」にまとめられない。→ 単一 `doc` への集約が前提条件。

---

## 2. アーキテクチャ: past / present / future

Redux 公式 "Implementing Undo History" で確立された王道パターン。

```
History<T> = {
  past:    T[]   // 古い順
  present: T
  future:  T[]   // undo で押し戻された状態
}
```

- **undo**: present を future 先頭へ、past 末尾を present へ
- **redo**: future 先頭を present へ、旧 present を past 末尾へ
- **新規編集**: past に旧 present を積み、future をクリア

履歴対象 `T` = ドキュメント本体（下記）。`nextId` / `_format` は定数扱いで履歴に含めない。

```ts
type Doc = {
  workTitle: string;
  workTheme: string;
  scenes: Scene[];
  characters: string[];
  refLayouts: RefLayout[];
};
```

---

## 3. フック API: `src/hooks/useHistory.ts`

```ts
function useHistory(initial: Doc): {
  doc: Doc;
  update: (fn: (d: Doc) => Doc, opts?: { transient?: boolean; scope?: string }) => void;
  flush: () => void;             // 保留中の transient を今すぐ1件コミット（内部でも使用）
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetBaseline: (doc: Doc) => void;  // ロード / import 専用。past/future をクリアし present 差し替え
}
```

### 内部で保持する保留状態（pending）
transient 編集を「まとめる」ために、フックは以下を内部に持つ。

- `pendingScope: string | null` … 現在まとめ中の編集対象（scope）。無編集なら null。
- `pendingBaseline: Doc | null` … その編集チャンクを**開始する直前**のスナップショット（コミット時に past へ積む値）。
- `idleTimer` … 最後の transient 編集から ~800ms で `flush()` を呼ぶタイマ。

### update のセマンティクス
- **`update(fn)`（構造操作 / 即コミット）**
  1. 保留中があれば先に `flush()`（#1）。
  2. 旧 present を past に積み、future をクリアして present を更新。

- **`update(fn, { transient: true, scope })`（テキスト編集 / まとめ）**
  1. `scope` が `pendingScope` と異なる場合は先に `flush()`（別フィールドの編集は別履歴に分ける / #2）。
  2. 保留が無ければ `pendingBaseline = 現 present`、`pendingScope = scope` を記録。
  3. present だけ更新（**past には積まない**）。
  4. idleTimer を再スタート（~800ms）。満了で `flush()`。

- **`flush()`**
  - 保留があれば `pendingBaseline` を past に積み、future をクリア、pending を解除。
  - 保留が無ければ何もしない。

- **`undo()` / `redo()` / `resetBaseline()`**
  - いずれも**先頭で必ず `flush()`**（#1）。これにより「入力途中で Ctrl+Z」は
    "今打っているチャンクを確定 → それを undo" となり、直前の構造操作が誤って undo されない。

### scope の付け方（#2）
`'<種別>:<id>:<field>'` 形式で一意化する。例:
- 場面: `scene:<sceneId>:title` / `:plot` / `:convey`
- コマ: `panel:<panelId>:content` / `:emotion`
- セリフ: `line:<lineId>:dialogue` / `:speaker`
- 作品: `work:title` / `work:theme`
- 参考: `ref:<refId>:name` / `:note`

### ループ防止
undo / redo / resetBaseline による present 差し替えは「ユーザー編集」ではないため、past へ再 push しない。
autosave は present 由来で動くので、復元結果はそのまま localStorage に保存される（#6）。

---

## 4. App.tsx の移行

- 5つの `useState` + 各 setter を `doc` + `update(...)` に**機械的に置換**。
  - 例: `setScenes(p => p.map(...))` → `update(d => ({ ...d, scenes: d.scenes.map(...) }))`
- **transient（テキスト編集・scope 付き）にするハンドラ（#4）**:
  - `updateScene`（title / plot / convey）
  - `updatePanel`（content / emotion）
  - `updateLine`（speaker / dialogue）
  - **`setWorkTitle` / `setWorkTheme`**（作品タイトル・テーマ）
  - **`updateRefLayout` の name / note**（参考コマ割りの自由入力）
  - ※ refLayout の `layoutId` 変更は選択操作なので即コミット側。
- **即コミット（構造操作）**:
  - add/remove 系（scene/page/panel/line/char/refLayout）、`setPageLayout`、`setHeroPanel`、
    ドラッグ並べ替え（`onDragEnd`）、`addChar` / `removeChar`、import 後の `resetBaseline`。
- `plotData` は `doc` から導出（`nextId` / `_format` を付与）。`useAutoSave(plotData, loaded)` は据え置き。
- 初期ロード（localStorage / sample.json）と import は `resetBaseline(doc)` を使う。
- UI状態（`expandedScenes` / `dragId` / `sidebarOpen` / モーダル類）は**現状のまま** `useState` で保持。

### UI 追加
- ヘッダーに ↩︎（undo）/ ↪︎（redo）ボタン。`canUndo` / `canRedo` で `disabled` 連動。
- グローバル `keydown` リスナ:
  - `Ctrl/Cmd + Z` → undo、`Ctrl/Cmd + Shift + Z`（および `Ctrl + Y`）→ redo
  - 発火時に `preventDefault()`（壊れがちなブラウザ標準 undo の発動を抑止）。
  - **モーダル表示中（import / export / confirm / layoutPicker）は無効化**（#5）。
    import/export の一時テキストはドキュメント履歴の対象外であり、奪うと危険なため。

---

## 5. 全データ削除ボタンの廃止

現状の「全データ削除（リセット）」（`ConfirmModal` の `type: 'reset'` 分岐 + `clearStorage()`）は**廃止**する。

- 場面カード単位の削除はすでに可能、全置換は import で代替できる。
- v2 の核である**データ消失対策(②)と真逆のフットガン**であり、思想と矛盾する。
- 将来「作品の複数管理」が入れば、やり直しは"新規プロジェクト作成"が正道。
- 廃止により履歴設計が簡潔化：`resetBaseline` は「ロード / import 専用」と一意に定義できる。

実装時は `ConfirmModal` の reset 分岐・サイドバーの「全データ削除」導線・`clearStorage` 呼び出しを除去。
（将来必要になれば `update(() => emptyDoc)` で undo 可能な"クリア"として復活可能。）

---

## 6. その他の割り切り（v1 で許容）

- **undo によるシーン増減**で `expandedScenes` に存在しない id が残る/再追加シーンが閉じた状態になる
  → 表示が少しズレるだけで無害。v1 では許容。
- スナップショットは状態まるごと参照保持。データ規模が小さいため問題なし。
  将来データが巨大化したら Immer パッチ方式へ移行（§8-代替案）。
- **undo 履歴はメモリ上のみ（永続化しない）**。リロードで履歴は消える（present は localStorage 復元）。
  これは一般的な挙動であり v1 で許容。

---

## 7. キー操作を「一律アプリ undo」にした理由

「入力中はブラウザ標準（textarea のネイティブ文字単位 undo）」案は直感的だが、
本アプリの入力欄は **React の制御コンポーネント**（value を state で上書き）。
制御コンポーネントでは**ブラウザ標準の undo 履歴が壊れる**（React の再レンダで value が
上書きされ、ネイティブ undo スタックが飛ぶ）のが既知の問題で信頼できない。

→ **ドキュメント編集欄に対しては** フォーカス位置に依存せず Ctrl+Z は常にアプリの undo に統一する。
アイドル debounce ＋ scope のまとめ方と組み合わさり、「直前に打ったひとまとまりの文章を取り消す」挙動になる。
ただし **import / export 等のモーダル内一時テキストは対象外**（§4・#5）。

参考: 既存類似ツール [nameboard](https://nameboard-mangalayout.netlify.app/) は
ツールバーに Undo/Redo ボタンのみ（ショートカット・テキスト欄固有挙動の記載なし）。
本アプリはボタン＋グローバル Ctrl+Z で同等以上。

---

## 8. 代替案の検討（不採用の記録）

将来の再検討に備え、検討した選択肢と判断理由を残す。

### B. Zustand + zundo（不採用）
- **内容**: 状態管理に Zustand を導入し、temporal ミドルウェア zundo で undo/redo を実装。
  `partialize`（履歴対象の限定）/ `limit`（上限）/ `handleSet`（debounce まとめ）/ `equality` が揃い、
  本設計の決定事項とほぼ 1:1 に対応する実績ある実装。
- **不採用理由**:
  - 状態が小さく、zundo の主目的（巨大 state の効率化）の旨味が薄い。
  - **状態管理ライブラリの新規導入＝アーキテクチャ変更**。現状の `useState` ハンドラ群を
    Zustand store へ移す影響範囲が大きい。
  - CLAUDE.md の「不要な依存を増やさない / pnpm minimumReleaseAge」方針とも合わない。
- **再検討の目安**: 状態が大きくなる、または複数画面で共有 store が必要になった場合。
  その際は単一 `doc` に寄せてある本設計から Zustand への移行は比較的容易。

### redux-undo（不採用）
- Redux 前提。本アプリは Redux を使っておらず、導入コストに見合わない。

### Immer パッチ方式（将来の発展先として保留）
- `produceWithPatches` で forward / inverse patch を積む差分方式。省メモリ。
- 現状はスナップショットで十分。データが巨大化したらこちらへ移行する。

### コマンドパターン（不採用）
- do/undo 操作を積む最省メモリ方式だが実装が複雑。CAD 等の大規模向けで、本アプリには過剰。

---

## 9. レビュー指摘の反映状況

| # | 指摘 | 反映箇所 |
|---|------|----------|
| 1 | transient 中の undo で flush 未定義 | §3「undo/redo/resetBaseline は先頭で必ず flush」 |
| 2 | scope なしでは対象識別不可 | §3 `update` に `scope` 追加・scope 変化で flush |
| 3 | reset の「履歴クリア」と「全削除 undo 可」が矛盾 | §5 全削除ボタン廃止 / `resetBaseline` はロード・import 専用に一意化 |
| 4 | transient 対象に work/ref のテキストが抜け | §4 transient 一覧に workTitle/workTheme/refLayout name・note を明記 |
| 5 | 一律 undo が import/export textarea も奪う | §4・§7 モーダル表示中はグローバル undo/redo を無効化 |
| 6 | 「次の編集時に autosave」が不正確 | §3・§5 undo で present 変化＝その時点で保存。clearStorage 廃止 |

---

## 10. 実装タスク（次フェーズ）

1. `src/hooks/useHistory.ts` を新規作成（past/present/future + transient/scope/idle-flush + flush + limit）
2. `App.tsx` の5 `useState` を `doc` + `update` に置換、テキスト系に `{ transient, scope }` 付与
3. 初期ロード / import を `resetBaseline` に変更
4. 全データ削除ボタン（ConfirmModal reset 分岐 / サイドバー導線 / clearStorage）を除去
5. ヘッダーに undo/redo ボタン、グローバル keydown リスナ（モーダル中は無効）追加
6. テスト:
   - undo/redo 基本往復
   - テキスト coalescing（同一 scope はまとまる / scope 変化で分かれる / idle で確定）
   - 入力途中の undo で flush されるか（#1）
   - 構造操作の即コミット、上限 50 破棄、future クリア
   - resetBaseline 後に undo で空へ戻らないこと
