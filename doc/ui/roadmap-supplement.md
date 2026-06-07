# ロードマップ補足ドキュメント

このドキュメントは、漫画プロットエディタのReact/Vite/TypeScript移行ロードマップに対する補足です。
ロードマップ本体と一緒にClaude Codeへ渡してください。

---

## 1. 移植元ソースコードについて

移植元は以下の2ファイルです。このドキュメントと一緒に渡してください。

- `plot-editor.html` — HTML単体版（localStorage自動保存対応）
- `manga-plot-editor.jsx` — Claudeアーティファクト版（最新のUI/機能）

**JSX版の方が新しいです。** HTML版にない機能がJSX版にあります：
- 見せゴマの任意解除（トグル式）
- カスタム削除確認モーダル（`confirm()` 不使用）
- JSONコピペ方式のエクスポート/インポート

移植時はJSX版を正とし、HTML版はlocalStorage実装の参考として使ってください。

---

## 2. ディレクトリ構成の追加・修正

ロードマップの構成に以下を追加してください。

```
manga-plot-editor/
  docs/
    spec.md                    ← 追加：仕様書（UX判断・データ構造・将来構想）
  public/
    data/
      shanbuggy-mujintou.json
  src/
    main.tsx
    App.tsx
    types/
      plot.ts
    styles/
      tokens.ts                ← 追加：カラーパレット・フォント定義
    data/
      layoutTemplates.ts
      characters.ts
    components/
      Header.tsx
      Sidebar.tsx
      SceneCard.tsx
      PageBlock.tsx
      PanelCard.tsx
      DialogueLine.tsx          ← 追加：セリフ行コンポーネント
      LayoutPreview.tsx
      PageLayoutMap.tsx          ← 追加：ページ内コマ配置マップ（大）
      LayoutPickerModal.tsx
      ExportImportModal.tsx
      ConfirmModal.tsx           ← 任意：カスタム確認モーダル（confirm()で代用可）
    utils/
      storage.ts
      migrate.ts
      ids.ts
      plotSchema.ts
    hooks/
      useAutoSave.ts             ← 追加：自動保存ロジック
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  README.md
```

---

## 3. styles/tokens.ts の内容

以下の定数を定義してexportする。全コンポーネントからimportして使う。

```ts
// カラーパレット
export const C = {
  bg: "#F6F1EB",
  card: "#FFFDF9",
  cardBorder: "#E8DFD3",
  accent: "#C2785C",
  accentSoft: "#EADDD4",
  accentDark: "#9B5A3F",
  text: "#3A302A",
  textSub: "#8C7E72",
  conveyBg: "#FFF5EC",
  conveyBorder: "#F0D9C4",
  emotionBg: "#F3F0FF",
  emotionBorder: "#D8D0F0",
  emotionText: "#6B5CA5",
  pageBg: "#F9F5F0",
  panelBg: "#FFFFFF",
  panelBorder: "#E8DFD3",
  sidebar: "#FAF7F3",
  danger: "#D4564E",
  success: "#6BA368",
  hero: "#E8A838",
  heroBg: "#FFF8E8",
  heroBorder: "#F0C860",
};

// フォント
export const fonts = {
  display: "'Noto Serif JP','Georgia',serif",
  body: "'Noto Sans JP','Helvetica Neue',sans-serif",
  mono: "'Source Code Pro',monospace",
};
```

これらの値は勝手に変更しないでください。デザインの意図があります。

---

## 4. 開発中に判明したUX判断



### 見せゴマは任意（解除可能）
- 新規ページ作成時は最初のコマがデフォルトで見せゴマ
- 別のコマをタップで切り替え
- **同じコマを再タップで解除可能**（heroId = null）
- 解除状態では全コマが均等な見た目
- 1コマのみのページでは見せゴマUI非表示
- 見せゴマ ≠ 大きいコマ。あくまで「このページで一番伝えたいコマ」の印

### 見せゴマの表示方法
- ⭐アイコンは不採用（「お気に入り？」と誤解されるため）
- 選択中のコマに「見せゴマ」テキストラベル（金色バッジ）を表示
- 金色の枠 + 背景で視覚的に区別
- 非見せゴマのopacity低下は不採用（コマ内容が読みにくくなるため）
- 非見せゴマのscale縮小も不採用

### コマカードのタップ動作
- コマカードの空白部分（入力欄・ボタン以外）をタップ → 見せゴマ切り替え
- INPUT / SELECT / TEXTAREA / BUTTON をタップした場合はそちらの操作が優先
- 判定は `e.target.tagName` でフィルタリング

### コマ割りテンプレートの読み順
- すべて **右→左**（漫画の読み方に準拠）
- テンプレートの `panels` 配列の順番 = 読み順（1番 = 右上から）
- テンプレートピッカーは現在のコマ数に合うものを優先表示

### セリフは配列構造
- 1コマに複数セリフ対応（`panel.lines: Line[]`）
- 古いデータに `panel.speaker` / `panel.dialogue` がある場合は `migrate.ts` で `lines[]` に変換

---

## 5. コンポーネント分割の指針

### DialogueLine.tsx を分離する理由
PanelCard 内のセリフ部分（lines の map）が最も複雑。
話者セレクト + セリフ入力 + 削除ボタンを1行コンポーネントにする。
Props: `line`, `characters`, `onUpdate`, `onRemove`, `isFirst`（💬アイコン表示用）

### PageLayoutMap.tsx を分離する理由
LayoutPreview（小さいプレビュー、テンプレピッカー用）とは別に、
ページ内に表示する大きいコマ配置マップがある。
こちらはコマの内容テキストや話者、見せゴマハイライトを表示する。
混同しないよう別コンポーネントにする。

### ConfirmModal.tsx（任意）
カスタムの確認モーダルを使う場合のみ作成。
`confirm()` で代用してもよい。
作る場合のProps: `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel?`, `danger?`

---

## 6. データ構造について

新規プロジェクトなので、最新のデータ構造のみ実装してください。
型定義は `src/types/plot.ts`（Phase 2で作成）に従います。

migrate.ts は「JSONインポート時に不完全なデータを補完する」用途で使います。
例：
- `panel.lines` がない場合 → `lines: []` を補う
- `page.heroId` がない場合 → `null` を補う
- `panel.emotion` がない場合 → `""` を補う

旧バージョンからの段階的マイグレーションは不要です。

---

## 7. docs/spec.md について

このリポジトリに `docs/spec.md` として仕様書を配置してください。
内容は別途渡す `plot-editor-spec.md` をそのまま使います。

この仕様書には以下が含まれています：
- コンセプト
- 全機能の仕様
- UX判断の理由（なぜそう決めたか）
- データ構造（JSONスキーマ）
- カラーパレット・フォント
- 将来構想（優先度付き）
- 不採用にした機能と理由

Claude Codeはこの仕様書の内容を尊重してください。
特に「UX上の決定事項」テーブルに書かれた判断を勝手に覆さないでください。

---

## 8. README.md に含めるべき内容

ロードマップのPhase 6でREADMEを書く際、以下を含めてください。

### 必須セクション
- プロジェクト概要（コンセプト1行）
- 技術構成（React / Vite / TypeScript / localStorage）
- 開発コマンド（install / dev / build / preview）
- ディレクトリ構成
- データ管理方針（JSONファイルでバージョン管理、将来DB移行可能）
- デプロイ方法（GitHub Pages）

### 今後やることリスト（Phase 7から転記 + 以下を追加）
- スマホ用の場面 上へ/下へ 移動ボタン
- ページ / コマの移動ボタン
- 場面 / ページ / コマの複製
- 見せゴマ種別（将来検討）
- コマの役割タグ
- 作品複数管理
- クリスタEXストーリーエディタ向けテキスト/CSV書き出し
- ページめくりプレビュー（課金 or 常設は未定）
- ドラッグでコマ境界線調整
- カスタムコマ割り作成
- 参考画像の貼り付け
- CSS Gridでコマ割り比率制御（保留）
- ネームラフ描画（保留）
- 感情グラフ（保留）
- JSON差分確認
- GitHub MCP連携
- DB保存 / Cloud Run / AWS / Supabase / Firebase検討
- TypeScript型の厳密化 / zod schema validation

---

## 9. 渡すファイル一覧チェックリスト

Claude Codeに渡すもの：
- [ ] ロードマップ本体（Phase 1〜7）
- [ ] この補足ドキュメント
- [ ] manga-plot-editor.jsx（移植元ソース・最新版）
- [ ] plot-editor.html（localStorage実装の参考）
- [ ] plot-editor-spec.md（仕様書 → docs/spec.md として配置）
