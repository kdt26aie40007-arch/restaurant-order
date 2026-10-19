# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

restaurant-order: 飲食店「サニーテーブル」のメニュー・オーダーシステム（学校の課題）。

- 店名: サニーテーブル（画面の店名表示などではこの表記を使う）

技術スタックは HTML / CSS / JavaScript のみ（ライブラリ・ビルドなし）。注文データはブラウザの localStorage に保存する。

## 満たすべき要件

1. 店名表示
2. メニュー表示
3. 注文
4. 注文データの記録
5. おすすめ機能
6. 会計
7. 入力チェック
8. アレルギー対応

メニューは20品以上にする（現在23品）。

機能を実装・変更するときは、どの要件を満たすものかを意識する。

## README について

- 提出物の README.md は、講師配布のテンプレート（概要 / 起動方法 / システム構成 / データ設計 / 画面と機能 / 自分で決めたこと / 動作確認 / 作成者）に沿って書く。
- 講師は「起動方法」の手順どおりに clone から起動まで行う。起動手順や必要な準備（インストールなど）が変わったら、README の「起動方法」も必ず更新する。
- ファイルの追加・削除や役割の変更をしたら、README の「ファイル構成」表も更新する。
- データの保存方法や項目を変えたら、README の「データ設計」も更新する。

## 言語

- ユーザーへの返答、コードコメント、コミットメッセージは日本語で書く。

## 開発コマンド

ビルド・インストールは不要。`index.html` をブラウザで直接開いて動作確認する。テスト・Lint の仕組みはない。

## アーキテクチャ

- `index.html`: 画面の骨組み。`menu.js` → `app.js` の順に読み込む。
- `menu.js`: データだけを持つ（`STORE_NAME`, `ALLERGENS`, `CATEGORIES`, `MAIN_CATEGORIES`, `MENU`）。メニューの追加・変更はここだけで行う。
- `images/`: 料理の画像。今は料理の id と同じ名前の SVG イラスト（`h1.svg` など）。写真に差し替えるときは画像をここに置き、`menu.js` の `image` のパスを書き換える。読み込めないときは `noimage.svg` を表示する。
- `app.js`: `state`（カート・選択中アレルゲン・表示カテゴリ）を持ち、変化のたびに `render*` 関数で該当部分を描き直す。
- 注文は localStorage のキー `sunnyTable.orders`、会計（お預かり金額・おつり）は `sunnyTable.payments` に配列で保存する。人気ランキングは `sunnyTable.orders` から毎回集計する。

注意点:
- `file://` で開くため、`<script type="module">` や `fetch` でのファイル読み込みは使わない（ブラウザがブロックする）。
- 文字の表示は `textContent` を使い、`innerHTML` に文字列を入れない。
- `alert` / `confirm` は使わず、画面内のメッセージや確認ボタンで伝える。
