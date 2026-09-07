# CLAUDE.md — スクアドシリーズ（アプリ開発グループ）

## このファイルについて
スクアドを起点に展開する複数アプリ（スクアド／スクアドビューティー／スクアドソロ）をまとめて管理するグループ用CLAUDE.mdです。**motionimagingjp/SCAD・SCAD-Beauty・scad-solo の3リポジトリに同一内容をコミットして運用**しています（各リポジトリの直下に置くことで、そのリポジトリで作業するClaude Codeセッションが自動的に読み込みます）。アイコンデザインの系統を揃えて統一感を持たせる方針で開発中。

更新したら3リポジトリ全てに同じ内容を反映してください。設計決定があった回のチャット終わりに「CLAUDE.mdを更新して」と伝えれば、そのセッションが3リポジトリへ反映します。

---

# スクアド（SCAD CHAT）── リポジトリ: motionimagingjp/SCAD

## 概要
DECODE（既存の恋愛・婚活AI相談アプリ）の後継として開発中のWeb版アプリ。スクリーンショット解析＋恋愛相談チャットが核。婚活船長ジェイ（konkatsu-jay）をベースに、DECODE風のチャットUIへ作り替える方針で進めてきた。将来的に相談データを統計として蓄積し、アドバイスの精度を上げる設計思想を持つ（特許出願済み）。

## 実装状況（コード確認済み・2026年9月時点）
- Next.js 14（App Router）。`src/app/scad-page.js`がアプリ本体、`src/app/page.js`はエントリ
- **アドバイザーは3人：サキ・レン・のり様**（手動選択方式）。`ADVISORS`オブジェクトで人格・プロンプトを管理
- `about`ページ・`privacy`ページ実装済み
- UI: 文字色`#94a5a0`など、DECODE系の配色を継承（コードで確認済み）
- X自動投稿（@scadchatapp）は**motionimagingjp/motionimaging側**に実装・稼働中（`app/api/post-sukuado-morning`等、`post-sukuado-core.js`に共通ロジック）。このリポジトリ自体にはX投稿コードはない
- **データ保存・DB・同意画面は未実装**（Supabase等の接続コード、consent画面のコードは現状リポジトリ内に存在しない）

## 確定している設計決定（一部は上記の通り未実装）
- **アプリ名**: スクアド（英語表記 SCAD）／スクショ＋アドバイスの意味
- **UI/UX**: 現行DECODE Web版のレイアウト・配色を継承（実装済み）
- **アドバイザー**: サキ・レン・のり様の手動選択方式（実装済み）
- **姉妹アプリ導線**: aboutページの`SERIES_APPS`で、ヘアスタイル・ファッション相談はSCAD BEAUTYへの外部リンクとして案内している（アプリ内でアドバイザーを一時切替する設計ではなく、別アプリへ誘導する形。旧CLAUDE.mdにあった「洋服・レストラン相談時のみ専門アドバイザーへ自動切替」という記述は実装と異なるため訂正）
- **データ方針（未実装・設計のみ）**: 会話本文は履歴として保管するのみで統計・学習には使わない。個人情報を除去したメタデータ（返信時間・文字数・絵文字有無など）のみを中間サーバーで抽出・保存する設計（特許構造に準拠）
- **同意画面（未実装）**: スクロール必須＋同意ボタン方式（チェックボックスなし）を予定
- **統計活用**: 今はデータ蓄積のみに専念する方針。実運用（統計に基づくアドバイス最適化）は1年後を目安に着手
- **集客**: X（@scadchatapp）で1日2回（朝データ寄り／夜共感寄り）＋宣伝枠の自動投稿。motionimaging側で実装・本番投稿済み

## 未決定・検討中
- 中間サーバー（メタデータ抽出・保存）の具体的な実装場所・構成
- 同意画面・データ保存基盤（DB）の実装着手時期

## 関連ファイル・リポジトリ
- X自動投稿の実装詳細: `motionimagingjp/motionimaging` リポジトリの `app/api/post-sukuado-*`, `app/api/_lib/post-sukuado-core.js`
- 姉妹アプリ: SCAD Beauty（`motionimagingjp/SCAD-Beauty`）, スクアドソロ（`motionimagingjp/scad-solo`）

---

# スクアドビューティー（SCAD Beauty）── リポジトリ: motionimagingjp/SCAD-Beauty

## 概要
チャット型ヘアスタイル・ファッション・レストラン診断アプリ（旧称 HAIR Recipe）。`scad-beauty.vercel.app` で稼働中。

## 実装状況（コード確認済み）
- `api/`配下に5本のGemini呼び出しAPI：`analyze-face-shape.js`（顔型診断）、`analyze-screenshot.js`（スクショ解析）、`analyze-fashion-check.js`（ファッションチェック）、`generate-hairstyle-composite.js`（ヘア合成）、`restaurant-recommend.js`（レストラン推薦）
- フロントは`public/index.html`（vanilla JS）＋`public/catalog.json`（ヘアスタイル一覧データ）
- Gemini APIキーはサーバー環境変数のみで保持、フロント非露出。API未接続時はモックへ自動フォールバック（README記載・設計として確認済み）

## 確定している設計決定
- アイコンは生成りの背景に横顔の線画
- X宣伝は現状スクアドチャットが優先。SCAD Beauty専用のInstagram新設などは未着手

## 今後の課題（README記載）
- Web検索によるイメージ補完機能はモックのまま（`searchWebImages()`）
- 顔型×スタイルの相性タグ（`faceShapes`）は仮データ。美容師監修が必要
- 運営者ページの氏名・写真・SNSリンクはプレースホルダー

---

# スクアドソロ（SCAD-SOLO／ソロ活居酒屋アプリ）── リポジトリ: motionimagingjp/scad-solo

## 概要
「ソロ活（一人でお店に行く活動）」支援アプリ。詳細な画面遷移設計は`FLOW.md`に記載済み（このCLAUDE.mdでは要点のみ）。

## 実装状況（コード確認済み）
- Next.js（App Router）+ Prisma + Neon（PostgreSQL、シンガポールリージョン）
- ナビ構成：おまかせ／地図／ゲーム／マイページ（AI相談タブ・ソロ活タブは廃止済み）
- メインループ：起動→今夜の3軒（距離順、シャッフルなし）→（任意でモード切替／次の3軒）→チェックイン確定→結果画面（Threadsシェア導線あり）
- 実績・来店ログ管理（`/logs`、`VisitLog.comment`にメモ保存）
- 場所決定の優先順位：手動指定（駅名検索）＞GPS＞IP推定＞既定値（渋谷駅）
- Vercel Cronで閉店確認（`/api/cron/check-closures`、月1回、Places APIの`businessStatus`を参照）
- 店舗データは現状デモ（架空）のみ。実店舗投入は未着手（`scripts/import-spots.ts`で投入予定、Gemini+Google検索groundingで候補発掘→人力レビュー→Geocoding→DB投入というフロー設計済み）

## 確定している設計決定
- アイコンはカクテルグラス＋グラスの縁のリップ跡（人物・夜景シルエットなし、シンプル）
- 配色はアプリ独自（白ベース×オレンジ）。スクアドビューティーの配色には合わせない
- ゲーム系機能（乾杯タイマー等）はナビに置かず結果画面にのみ表示。本体は未実装（`lib/data/activities.ts`の`ALL_GAMES`）

## 未決定・検討中
- 実店舗データの本格投入（Phase 0〜2で段階拡大予定、現状未着手）
- 地図画面の自由入力（AI検索）欄（コンテンツ検討中、未実装）

---

# 姉妹リポジトリ

- **motionimagingjp/motionimaging**（Migoron本体、スクアードX自動投稿の実装場所）: docsフォルダおよび`ai-cto-memory/`に開発ノウハウ・過去プロジェクトの記録を蓄積する運用あり
