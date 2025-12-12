# genshin-rotation-sim

原神のローテーションを検証するためのシミュレーター（`sim-core`）と、その結果を確認するための Web
UI をまとめた monorepo です。コアはピュアな TypeScript、UI は React + Vite +
Tailwind。パッケージ管理は pnpm のワークスペースで行います。

## 必要環境

- Node.js 18〜22 を推奨（20 系を想定）。`engines` で `>=18 <23` を指定。
- pnpm 10 系を推奨（`packageManager: pnpm@10.17.1`）。インストールしていない場合は `corepack enable`
  で有効化。

## リポジトリ構成

- `packages/sim-core`: シミュレーター本体。TypeScript/ESM。Vitest でテスト。
- `apps/web`: React + Vite + Tailwind の UI。コアをパッケージとして利用。

## セットアップ手順（ローカル開発）

1. Node/pnpm を準備
   - `corepack enable` で pnpm を有効化（`packageManager` で 10 系を指定済み）。
   - Node は 20 系を推奨。必要なら `nvm use 20` などで合わせてください。
2. 依存インストール
   - ルートで `pnpm install`（CI 同等なら `--frozen-lockfile` 推奨）。
   - Vite は root の override で `npm:rolldown-vite@7.2.5` に固定されています。
3. ツール設定
   - 初回のみ `pnpm run prepare` が必要な場合があります（husky のセットアップ）。
   - エディタが `tsconfig.base.json` を見るように設定すると、`@genshin-rotation-sim/sim-core`
     のパスエイリアスが解決されます。`.editorconfig` も参照してください。
4. 動作確認
   - `pnpm lint` / `pnpm test` / `pnpm build` で一通り通るか確認します。

## 主要コマンド（ルートで実行）

- 開発サーバー（web）: `pnpm dev`
- ビルド（core → web）: `pnpm build`
- 全テスト: `pnpm test`
- sim-core テストのみ: `pnpm test:core` / 監視実行: `pnpm test:core:watch`
- 全 lint: `pnpm lint`
- sim-core の ESLint: `pnpm lint:core`
- sim-core の型チェック: `pnpm --filter @genshin-rotation-sim/sim-core typecheck`
- web の ESLint: `pnpm lint:web`
- フォーマット確認/整形: `pnpm format` / `pnpm format:fix`

## 開発フロー

1. コアのロジックを `packages/sim-core/src`
   に実装し、Vitest でテストを追加 (`packages/sim-core/tests` など)。
2. Web UI からは `import { ... } from "@genshin-rotation-sim/sim-core";`
   でコアを利用できます（Vite の alias 設定済み）。
3. `pnpm dev` でフロントの動作を確認。必要に応じて `pnpm test:core:watch`
   を並行で走らせてください。Lint は共通の ESLint 設定（flat config）で web/sim ともに実行できます。
4. コミット時は Conventional Commits に従ってください（例:
   `feat: add rotation calc`）。`.husky/commit-msg` の commitlint が動きます。`pnpm run prepare`
   などを行なっていれば自動でセットアップされ、コミット時に自動でチェックされます。
5. PR 前に `pnpm lint` と `pnpm test`（必要なら `pnpm build`）を通すことを推奨します。
6. フォーマットは Prettier を使用しています。`pnpm format:fix` で整形、`pnpm format`
   で差分確認ができます。ESLint では `eslint-config-prettier`
   を最後に読み込み、フォーマット系ルールを無効化しています。

## ビルド/テストの仕組み

- `pnpm build` は `@genshin-rotation-sim/sim-core` を先に `tsc -b` でビルドし、その後 Web を
  `tsc -b && vite build` します。
- テストは Vitest（Node 環境）で実行。デフォルトで `src/**/*.{test,spec}.{ts,tsx}` と
  `tests/**/*.{test,spec}.{ts,tsx}` を拾います。
- Lint は ESLint のフラット構成を共有。sim-core は Node 向け、web は React
  Hooks/Refresh ルールを追加しています。型チェックは
  `pnpm --filter @genshin-rotation-sim/sim-core typecheck` で個別に実行できます。

## ライセンス

- ISC
