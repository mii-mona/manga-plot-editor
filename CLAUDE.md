# manga-plot-editor — Claude Code 作業ガイド

## private-data/ ルール（厳守）

`private-data/` はプロジェクトルートにある**本番創作データの置き場**。
private repo にコミットし、git でバージョン管理する。
GitHub Pages の build 成果物には含めない。

### 絶対にやってはいけないこと

- `src/` から `private-data/` を import しない
- `public/` に `private-data/` 内ファイルをコピーしない
- `fetch('/private-data/...')` をコードに書かない
- build script や GitHub Actions で `dist/` に含める設定をしない

### 正しい設計

公開アプリが使う初期データは `public/data/sample.json` のみ。
本番データはユーザーが「バックアップを読み込む」から手動でブラウザに取り込む。
一度読み込むと localStorage に保存され、以後は自動で復元される。

### .gitignore ルール

- `private-data/*.local.json` → 除外（一時ファイル）
- `private-data/tmp/` → 除外
- `private-data/*.json` → **除外しない**（バージョン管理対象）

---

## データ設計

- 全 ID は `crypto.randomUUID()` で生成した UUID string（`src/utils/ids.ts`）
- scene.id も string（旧データの number は `migrate.ts` で変換）
- localStorage キー: `manga-plot-editor-v2`
- 起動フロー: localStorage 優先 → 空なら `public/data/sample.json` を fetch

---

## 技術スタック

- React 18 + Vite 6 + TypeScript（strict モード）
- CSS フレームワーク: **なし**（インラインスタイルのみ）
- カラー・フォントは `src/styles/tokens.ts` の定数を使う。直書き禁止
- DB / API / 認証: 未実装（将来の Phase で追加予定）
- パッケージ管理: pnpm（`pnpm-workspace.yaml` で minimumReleaseAge 設定済み）
- Linter/Formatter: Biome（`biome.json`）

---

## Windows / PowerShell 環境の注意事項

この環境は Windows 11 + PowerShell 5.1 で動作している。

### ファイル書き込みは Write/Edit ツールを使う

PowerShell の `Set-Content` はデフォルトで UTF-16 LE (BOM付き) で書き込む。
日本語を含むファイルが壊れるため、**ファイル編集は必ず `Edit` または `Write` ツールを使うこと**。
PowerShell でファイル内容を書く必要がある場合のみ以下を使う:

```powershell
$utf8NoBOM = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBOM)
```

### コマンドチェーンは `;` で繋ぐ

PowerShell 5.1 では `&&` が使えない。複数コマンドの連結は `;` を使う。
Bash の構文が必要な場合は `Bash` ツールを使う（Git Bash がインストール済み）。

### 隠しディレクトリの検索

`Glob` ツールは `.claude/` や `.codex/` などドット始まりのディレクトリを検出しない。
隠しディレクトリを探す場合は PowerShell の `Get-ChildItem -Force -Recurse` を使う。

---

## デザイン制約

`src/styles/tokens.ts` の値はデザイン上の決定があるため、**勝手に変更しない**。

既存 UI の雰囲気（色・操作感・コンポーネント構成）を大きく変えない。
変更が必要な場合は先にユーザーに確認する。

`docs/spec.md` の「UX 上の決定事項」テーブルに書かれた判断を勝手に覆さない。

---

## 将来の拡張方針（参考）

- DB 移行: まず `works` テーブルに `data_json` として全体を保存
- その後必要なら `scene_versions` → `scenes/pages/panels/lines` に正規化
- 全要素に安定した UUID があるため、正規化時の主キーとして使える
- GitHub Pages 公開 → 将来は Cloud Run / Supabase 等に移行想定
