# ◇ 漫画プロットエディタ

「感情設計 → 演技メモ → ページ割り → コマ割り」までをつなぐ漫画ネーム前エディタ。

## 技術構成

| 技術 | 用途 |
|---|---|
| React 18 | UI |
| Vite 5 | ビルド・開発サーバー |
| TypeScript (strict) | 型安全 |
| localStorage | データ永続化 |
| Vitest + jsdom | テスト |
| pnpm | パッケージ管理 |

DB・API・認証なし。静的サイトとして GitHub Pages で公開。

## 開発コマンド

```sh
pnpm install     # 依存関係インストール
pnpm dev         # 開発サーバー起動 (http://localhost:5173)
pnpm build       # プロダクションビルド (dist/)
pnpm preview     # ビルド結果をローカルで確認
pnpm test        # テスト（watch モード）
pnpm test:run    # テスト（1回実行して終了）
pnpm test:ui     # テスト UI（ブラウザ）
```

## ディレクトリ構成

```
manga-plot-editor/
  public/
    data/
      sample.json        ← デモ用初期データ（公開OK）
  src/
    types/plot.ts        ← データ型定義（全要素に UUID string ID）
    styles/tokens.ts     ← カラーパレット・フォント定数
    data/
      layoutTemplates.ts ← コマ割りテンプレート 12種
    utils/
      ids.ts             ← crypto.randomUUID() でID生成
      storage.ts         ← localStorage 読み書き
      migrate.ts         ← インポートデータの補完・旧形式変換
    hooks/
      useAutoSave.ts     ← 600ms debounce 自動保存
    components/          ← UI コンポーネント群
    test/                ← Vitest テスト
  docs/
    spec.md              ← 仕様書（全機能・UX判断・将来構想の正本）
    roadmap.md           ← v2 実行計画（優先度付き）
    archive/             ← 移行前のプロトタイプ・旧デザイン案（履歴）
  CLAUDE.md              ← AI作業ガイド（本番データ管理ルール等）
```

## データ管理方針

- 全データは `localStorage` に自動保存される（600ms debounce）
- エクスポート: JSON をコピーしてメモアプリ等に保存
- インポート: 保存した JSON を貼り付けて復元
- 自分用の本番データは別の private repo `manga-project-data` で管理し、アプリ起動時に「バックアップを読み込む」で手動ロードする（この公開リポジトリには置かない）

**将来 DB に移行する場合:**
全要素（scene / page / panel / line）が UUID string ID を持つため、そのまま DB の主キーとして使用できる。まず `works` テーブルに `data_json` 全体を保存し、必要に応じて正規化する想定。

## デプロイ（GitHub Pages）

```sh
pnpm build
# dist/ を GitHub Pages のソースに指定
# または gh-pages ブランチに push
```

`vite.config.ts` の `base: './'` により、サブパス配置でも動作する。

## 今後やること

- スマホ用の場面 上へ/下へ 移動ボタン
- ページ / コマの移動ボタン
- 場面 / ページ / コマの複製
- コマの役割タグ
- 作品複数管理
- クリスタEX ストーリーエディタ向けテキスト/CSV 書き出し
- ページめくりプレビュー
- ドラッグでコマ境界線調整
- カスタムコマ割り作成
- 参考画像の貼り付け
- CSS Grid でコマ割り比率制御（保留）
- ネームラフ描画（保留）
- 感情グラフ（保留）
- JSON 差分確認
- DB保存 / Cloud Run / Supabase 検討
- TypeScript 型の厳密化 / zod schema validation
