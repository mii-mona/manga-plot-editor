---
name: review
description: >
  Git diff、Pull Request、変更ファイル群を分析し、具体的で根拠のあるレビュー所見を生成する。
  正確性・バグリスク・セキュリティ・パフォーマンス・テスト不足・設計規約との不整合を優先度順に報告する。
  Use when: 「レビューして」「コードレビュー」「差分を見て」「PRレビュー」「review this PR」
  「review this diff」「review changed files」「code review」「PR review」「変更をチェックして」
  「このブランチをレビュー」「staging との差分をレビュー」のように、
  コード変更に対するレビュー所見の生成を求められた時に使用。
  read-only のレビュー専用スキル。修正の実行は行わない。
allowed-tools: Read, Glob, Grep, Bash(git:*), Bash(gh:*), AskUserQuestion, Agent
argument-hint: '[--wait|--background] [--base <ref>] [--pr <number>]'
---

# MANGA PLOT EDITOR Code Review

変更差分を分析し、優先度付きのレビュー所見を生成する read-only スキル。

**重要: このスキルはレビュー専用。コード修正、ファイル編集、commit、push、PR作成、PRコメント投稿、merge は行わない。**

Raw slash-command arguments:
`$ARGUMENTS`

## read-only 制約

このスキル、および起動されるサブエージェントは、以下を禁止する。

* ファイルの作成・編集・削除
* commit
* push
* merge
* PR作成
* PRコメント投稿
* `gh pr review`
* `gh pr comment`
* `gh pr merge`
* 依存パッケージの追加・更新
* install/build/test以外の副作用があるコマンド実行

`gh` は原則として以下の読み取り用途のみ許可する。

* `gh pr diff`
* `gh pr view`

`git` は原則として以下の読み取り用途のみ許可する。

* `git diff`
* `git status`
* `git log`
* `git show`
* `git branch`
* `git ls-files`

## 実行モード判定

* `--wait` が含まれる場合: フォアグラウンドで実行。ユーザーに確認しない。
* `--background` が含まれる場合: バックグラウンドで実行。ユーザーに確認しない。
* どちらも指定なし: レビューサイズを推定してからユーザーに確認する。

### サイズ推定

```bash
# --pr 指定時
gh pr diff <number> --name-only

# --pr 未指定時（--base のデフォルトは staging）
git diff <base>...HEAD --stat
```

* 差分が小さい場合（1-2ファイル、100行以下）: フォアグラウンドを推奨
* それ以外（不明な場合含む）: バックグラウンドを推奨

推定後、`AskUserQuestion` で1回だけ確認する。推奨オプションを先頭に置き `(Recommended)` を付ける。

* `Wait for results`
* `Run in background`

## フォアグラウンド実行

Agent tool でサブエージェントを起動し、結果を待つ。

サブエージェントには必ず read-only 制約を含める。

```typescript
Agent({
  description: "manga-plot-editor code review",
  prompt: `<レビュー指示（後述のプロンプト構成を参照）>`
})
```

結果をそのままユーザーに返す。要約や補足は加えない。

## バックグラウンド実行

Agent tool でサブエージェントをバックグラウンド起動する。

サブエージェントには必ず read-only 制約を含める。

```typescript
Agent({
  description: "manga-plot-editor code review",
  prompt: `<レビュー指示（後述のプロンプト構成を参照）>`,
  run_in_background: true
})
```

起動後、ユーザーに「レビューをバックグラウンドで開始しました。完了すると通知されます。」と伝える。
完了を待ったり、ポーリングしたりしない。

## サブエージェントへのプロンプト構成

以下の情報をプロンプトに含める。

1. 差分の取得方法
2. read-only 制約
3. レビュー観点
4. プロジェクト固有のガードレール
5. 出力フォーマット

## 引数

| 引数              | 説明            | デフォルト         |
| --------------- | ------------- | ------------- |
| `--pr <number>` | レビュー対象の PR 番号 | 省略時はブランチ差分を使用 |
| `--base <ref>`  | 比較元のブランチ/コミット | `staging`     |

## 使用例

```text
/review --pr 123
/review --base main
/review
/review --pr 123 --base main
/review --wait --base staging
/review --background --pr 123
```

## Phase 1: 差分の取得

引数に応じて差分を取得する。

```bash
# --pr が指定された場合
gh pr diff <PR番号>

# --pr が未指定の場合（--base のデフォルトは staging）
git diff <base>...HEAD
```

差分が大きい場合（1000行超）は `--stat` で全体像を先に確認し、ファイル単位で読む。

```bash
git diff <base>...HEAD --stat
git diff <base>...HEAD -- <file>
```

## Phase 2: コンテキスト収集

差分だけでは判断できない箇所について、必要最小限の周辺コードを読む。

* 変更された関数の呼び出し元・呼び出し先
* 変更されたインターフェースの実装箇所
* 関連するテストファイル
* スキーマ変更がある場合は関連モデル
* CLAUDE.md
* README.md
* docs 配下の関連規約

**読みすぎない。**
差分に直接関係する範囲だけ読む。

## Phase 3: 分析観点

以下の観点で差分を精査する。優先度が高いものから確認する。

### critical / high

* 正確性: ロジックの誤り、境界条件の見落とし、off-by-one
* バグ混入リスク: null/undefined 未チェック、競合状態、状態管理の不整合
* セキュリティ: XSS、認証・認可漏れ、秘密情報のハードコード
* データ破損: マイグレーション不整合、破壊的スキーマ変更
* 公開事故: private-data や本番JSONが public/dist/build成果物に混入していないか

### medium

* パフォーマンス: 不要なループ、巨大データの全件処理
* テスト不足: 変更に対応するテストがない、エッジケース未カバー
* エラーハンドリング: 読み込み失敗、localStorage失敗、JSON parse失敗の未処理
* 依存管理: 不要なnpm/pnpm依存追加、lifecycle scripts追加

### low / info

* 可読性・保守性
* 設計・規約との不整合
* 型安全性: any の乱用、型アサーションの不適切な使用

## プロジェクト固有ガードレール

manga-plot-editor 系プロジェクトでは、必ず以下を確認する。

* `private-data/` を `src` から import していないか
* `private-data/` を fetch していないか
* `private-data/` を `public/` にコピーしていないか
* `private-data/` が build/dist 成果物に混入する設定になっていないか
* `public/data/` に公開してよい `sample.json` 以外の本番データが置かれていないか
* 本番創作データが GitHub Pages に配信される構成になっていないか
* localStorage保存処理が utils に分離されているか
* migrate処理が欠損JSONや古い形式に耐えるか
* PlotData / Scene / Page / Panel / Line のIDが安定しているか
* `pnpm-workspace.yaml` の `minimumReleaseAge` が維持されているか
* package.jsonに不要な依存や怪しい scripts が増えていないか
* DB/API/認証/MCPを勝手に実装していないか
* UIを既存方針から大幅に変えていないか

## Phase 4: レポート出力

以下のフォーマットで出力する。所見がないセクションは省略する。

```md
## Review Summary

対象: [PRタイトル / ブランチ名 / ファイル群]
変更規模: [ファイル数、追加行数、削除行数]
総合所感: [1-2文で変更の質と主要な懸念を要約]

## Findings

### 1. [Title] — `critical` | `high` | `medium` | `low` | `info`

**Why it matters**: [何が問題か、どういう影響があるか]

**Evidence**: [ファイル:行番号、関数名、差分の該当箇所、挙動の根拠]

**Suggested fix**: [修正案。不要なら省略]

---

### 2. ...

## Missing Tests

- [テストが不足している観点を列挙]

## Nice to Have

- [必須ではないが改善になる提案]
```

## 制約

* 不明点を想像で補完しない
* 確信がない場合は「要確認」と明記する
* 根拠のない断定をしない
* 差分・コード・ドキュメントに基づく指摘のみ行う
* 変更していないコードへの広範囲リファクタ提案は控える
* スタイル指摘だけで終わらせない
* 自動フォーマッタやリンターで解決できるものは省略する
* read-only: このスキルはコードの修正を行わない。所見の報告のみ

## レビュー品質基準

良いレビュー所見は以下を満たす。

* 具体的なファイル・関数・差分に基づいている
* 何が問題かだけでなく、なぜ問題かを説明している
* 影響範囲が明確
* 修正案が現実的
* 優先度が妥当
* 推測と事実が分離されている

悪いレビュー所見の例。

* 「ここは改善できそうです」だけで根拠がない
* スタイルや好みの指摘だけ
* 差分と関係ない大規模リファクタ提案
* 実装方針を勝手に変える提案
* DB/API/認証/MCPなど、今回のスコープ外実装を強く要求する
* read-only なのに修正を実行しようとする

## 最終確認

レビュー完了前に、以下を確認する。

* read-only 制約を破っていない
* ファイル編集していない
* commit/push/merge/PR作成していない
* PRコメント投稿していない
* 指摘に根拠がある
* critical/high がある場合、影響と修正案が明確
* Missing Tests が必要な場合だけ出ている
* Nice to Have が必須対応のように見えない
