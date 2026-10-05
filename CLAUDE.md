# CLAUDE.md — スクアドシリーズ（アプリ開発グループ）

## このファイルについて

スクアドを起点に展開する複数アプリ（スクアド／イロナビ／ヨイナビ／SCAD APPS LAB）をまとめて管理するグループ用CLAUDE.mdです。**motionimagingjp/SCAD・SCAD-Beauty・scad-solo・scad-ai-lab の4リポジトリに同一内容をコミットして運用**しています（各リポジトリの直下に置くことで、そのリポジトリで作業するClaude Codeセッションが自動的に読み込みます）。アイコンデザインの系統を揃えて統一感を持たせる方針で開発中。

更新したら4リポジトリ全てに同じ内容を反映してください。設計決定があった回のチャット終わりに「CLAUDE.mdを更新して」と伝えれば、そのセッションが4リポジトリへ反映します。

---

# スクアド（SCAD CHAT）── リポジトリ: motionimagingjp/SCAD

## 概要

LINEやマッチングアプリのスクリーンショットを送るだけでAIが恋愛・婚活アドバイスをくれるチャットアプリ。DECODE（既存の恋愛・婚活AI相談アプリ）の後継として開発中のWeb版。将来的に相談データを統計として蓄積し、アドバイスの精度を上げる設計思想を持つ（特許出願済み）。

## 技術スタック

- Next.js 14（App Router）
- Vercel でホスティング・自動デプロイ
- Gemini API (gemini-2.5-flash) でAI応答生成（`/api/chat`、サーバー側でのみAPIキーを保持）
- Gemini Live API（音声対話、`gemini-2.5-flash-native-audio-preview-09-2025`・声 Aoede）。ブラウザはエフェメラルトークンで直接接続
- Supabase（プロジェクト `scad-chat`、東京、無料プラン）。**現状は音声の利用制限だけに使用**（匿名ログイン＋利用回数の記録）

## リポジトリ構造の注意点（コード確認済み・2026年9月時点）

- **本番で実際に使われるルートページは `src/app/page.js`**。同じディレクトリに `src/app/scad-page.js` という似た名前のファイルが存在するが、これは**Next.jsのルーティングには使われない未使用ファイル**（`page.js`という名前でなければルーティングされない）。過去に誤って`scad-page.js`を編集し、本番に変更が反映されない事故が発生しているため、編集前に必ずどちらが実際にルーティングされているか確認すること。
- `src/app/about/page.js`: アプリ説明ページ（「私について」「アプリ一覧」「お問い合わせ・SNS」はmotionimaging提供の共通データAPIを使用。下記「ABOUTページ共通データ」参照）
- `src/app/useSharedAbout.js`: 上記共通データAPIをクライアント側でfetchするフック（フォールバック埋め込み済み）
- `src/app/privacy/page.js`: プライバシーポリシー
- `src/app/layout.js`: 共通レイアウト・テーマカラー
- `public/`: アイコン画像（`advisor-saki.png`、`advisor-ren.png` など）
- **アドバイザーは3人：サキ・レン・のり様**（手動選択方式）。人格・プロンプトは `src/lib/advisors.js` の `ADVISORS`（サーバーの`/api/chat`とUIで共有。のり様の内部キーは`jay`）
  - 口調は例文つきで固定：サキ＝30代前半の日本人女性・やわらかいタメ口（`SAKI_VOICE`）、レン＝30代半ばの男性・一人称「俺」（`REN_VOICE`）。AIっぽい定型句（「素晴らしい質問ですね」「ぜひ〜」等）は禁止
  - プルダウンの右に**アドバイザーごとの特別機能ボタン**を1つ置く形で3人統一：サキ「🎙 声で話す」／レン「💴 マネー」（マネーチャットのオン・オフ）／のり様「💯 採点する」（関係性スコアのヒアリング開始）
  - 開始画面の紹介は1行のみ（あいさつ文は表示しない）。質問ボタンは3つを6〜7文字で1行に収め、「返信を考えて」は3人共通
- **レン・マネーチャット**：レン選択時のみ手動切替。Google Search grounding で相場を取得し、出典URLと免責文を回答の下に表示。個別銘柄の推奨・売買タイミング助言は禁止（金商法の投資助言業対策）。SBI証券ランキング引用は撤廃
- **音声対話（サキのみ）**：`src/app/VoicePanel.js`（初回同意画面＋会話画面）、`src/app/useVoiceSession.js`（録音・再生・割り込み）、`src/app/api/voice-token/route.js`（トークン発行）、`src/lib/voice.js`（声・モデル・音声用プロンプト）。利用制限はSupabaseの`voice_limits`テーブル1行で管理（管理画面から変更可・デプロイ不要）。2026年9月末時点：1回3分・1人1日3回・全体1日90分・同時5。**画面の「1回3分・1日3回まで」表示はコードに直書きなので、値を変えたら合わせて直す**
- `/voice-lab`：開発者専用の音声試作画面（`VOICE_DEV_PASSWORD`で保護、noindex、利用枠は消費しない）。声・モデルの聴き比べ用
- 詳細な経緯・設計は `docs/handover-voice-and-money-mode.md`
- X自動投稿（@scadchatapp）は**motionimagingjp/motionimaging側**に実装・稼働中（`app/api/post-sukuado-morning`等、`post-sukuado-core.js`に共通ロジック）。このリポジトリ自体にはX投稿コードはない
- **会話本文の保存・メタデータ抽出は未実装**。Supabaseは音声の利用回数管理のみで、テキストチャットは今もログイン不要・保存なし

## ブランディング

- アドバイザーアイコンは実写調アニメ塗りイラスト（丸型・バストアップ・正面向き・自然光の公園背景）で統一。
- 「のり様」は イロナビ（旧SCAD Beauty） の `profile-avatar.jpg` を外部URL参照で共有（`https://scad-beauty.vercel.app/profile-avatar.jpg`）。サキ・レンは `public/advisor-*.png` としてリポジトリ内にホスト。
- UIカラーは白ベース（`#ffffff`）。アドバイザーごとのアクセントカラー: サキ `#e89bb8`、レン `#3a92b5`、のり様 `#b8860b`。
- 絵文字アイコンから画像アイコンへの切り替えは、`AdvisorIcon` コンポーネント（`icon` フィールドの有無で分岐）で統一的に扱う。
- 姉妹アプリ導線: aboutページの姉妹アプリ一覧はmotionimaging提供の共通データAPIから取得（旧`SERIES_APPS`のハードコード配列は廃止）。アプリ内でアドバイザーを一時切替する設計ではなく、別アプリへ誘導する形は維持。

## 確定している設計決定（一部は未実装）

- **アプリ名**: スクアド（英語表記 SCAD）／スクショ＋アドバイスの意味
- **データ方針（未実装・設計のみ）**: 会話本文は履歴として保管するのみで統計・学習には使わない。個人情報を除去したメタデータ（返信時間・文字数・絵文字有無など）のみを中間サーバーで抽出・保存する設計（特許構造に準拠）
- **同意画面**: スクロール必須＋同意ボタン方式（チェックボックスなし）。音声機能の初回利用時に実装済み（テキストチャット全体への導入は未着手）
- **Gemini APIは必ず有料枠のプロジェクトで使う**: 無料枠は入力がGoogleの改善（学習）に使われ得るため、プライバシーポリシーの「学習に利用されない」と矛盾する
- **統計活用**: 今はデータ蓄積のみに専念する方針。実運用（統計に基づくアドバイス最適化）は1年後を目安に着手
- **集客**: X（@scadchatapp）で1日2回（朝データ寄り／夜共感寄り）＋宣伝枠の自動投稿。motionimaging側で実装・本番投稿済み

## 未決定・検討中

- 中間サーバー（メタデータ抽出・保存）の具体的な実装場所・構成
- テキストチャット全体の同意画面・会話データ保存基盤の実装着手時期
- 音声をのり様→レンへ広げる時期（のり様の「点数化」ヒアリングは音声に不向きなのでテキスト誘導の予定）
- 音声モデルはpreview版。提供終了の案内が来たら `VOICE_PRODUCTION` を差し替えて `/voice-lab` で声・話し方を再確認

## デプロイフロー

1. 機能ブランチで変更
2. PR作成
3. Vercelのデプロイステータスチェック（`Vercel: Deployment has completed`）が成功するのを確認
4. mainにマージ → 本番反映

## 既知の落とし穴

- GitHub MCPの `create_or_update_file` はバイナリ（画像）アップロードに不向き。ローカルにリポジトリクローンがある場合は `git add`/`commit`/`push` で直接コミットする方が確実。
- チャットに添付された画像は環境のファイルシステムに自動保存されない。zipファイルとしてアップロードしてもらう運用が有効。
- Supabase無料プランは7日間アクセスがないと一時停止する。停止中は音声だけ使えなくなる（テキストチャットは無関係）。管理画面から再開できる

## 関連ファイル・リポジトリ

- X自動投稿の実装詳細: `motionimagingjp/motionimaging` リポジトリの `app/api/post-sukuado-*`, `app/api/_lib/post-sukuado-core.js`
- 姉妹アプリ: イロナビ（`motionimagingjp/SCAD-Beauty`）, ヨイナビ（`motionimagingjp/scad-solo`）, SCADコネクト（`motionimagingjp/partyconnect`）

---

# イロナビ（旧称: SCAD Beauty）── リポジトリ: motionimagingjp/SCAD-Beauty

## 概要

チャット型パーソナルカラー診断・ヘアスタイル・ファッション・レストラン診断アプリ（旧称 HAIR Recipe → SCAD Beauty → イロナビ）。`scad-beauty.vercel.app` で稼働中。

**2026年9月、表示名を「イロナビ」に変更した。** リポジトリ名・ディレクトリ名・DBスキーマ・URL・内部識別子（`BRAND`オブジェクトの`theme`値等）は`SCAD-Beauty`/`beauty`のまま変更していない（インフラ整合性優先。SCADコネクトの改称時と同じ方針）。表示名・UI文言のみ改称対象。

## 実装状況（コード確認済み）

- `api/`配下に5本のGemini呼び出しAPI：`analyze-face-shape.js`（顔型診断）、`analyze-screenshot.js`（スクショ解析）、`analyze-fashion-check.js`（ファッションチェック）、`generate-hairstyle-composite.js`（ヘア合成）、`restaurant-recommend.js`（レストラン推薦）
- フロントは`public/index.html`（vanilla JS、ビルド工程なしの静的HTML1枚）＋`public/catalog.json`（ヘアスタイル一覧データ）
- Gemini APIキーはサーバー環境変数のみで保持、フロント非露出。API未接続時はモックへ自動フォールバック（README記載・設計として確認済み）
- プロフィールアイコン `public/profile-avatar.jpg`（帽子・メガネの実写調イラスト）をSCAD CHATの「のり様」と共有している
- ABOUT画面の「私について」「アプリ一覧」「お問い合わせ・SNS」はmotionimaging提供の共通データAPIをブラウザ側でfetch（ビルド工程がないため常にクライアントfetch。到達できない場合は埋め込みフォールバックを表示）。下記「ABOUTページ共通データ」参照

## 確定している設計決定

- アイコンは生成りの背景に横顔の線画
- X宣伝は現状スクアドチャットが優先。イロナビ専用のInstagram新設などは未着手

## 既知の落とし穴・修正済みの表記漏れ

- `<title>`・`apple-mobile-web-app-title`・`BRAND.appName`が改称後も「スクアド」のままになっていた事故があった（2026年9月修正済み）。このリポジトリは複数アプリのテンプレートを使い回した経緯があるため、コピー元アプリの名称が残っていないか改称のたびに確認すること。

## 今後の課題（README記載）

- Web検索によるイメージ補完機能はモックのまま（`searchWebImages()`）
- 顔型×スタイルの相性タグ（`faceShapes`）は仮データ。美容師監修が必要
- 運営者ページの氏名・写真・SNSリンクはプレースホルダー

---

# ヨイナビ（旧称: Tokyo Solo Club／開発コード名 SCAD-SOLO）── リポジトリ: motionimagingjp/scad-solo

## 概要

「ソロ活（一人でお店に行く活動）」支援アプリ。詳細な画面遷移設計は`FLOW.md`に記載済み（このCLAUDE.mdでは要点のみ）。

**2026年9月、表示名を「ヨイナビ」に変更した。** 開発コード名`SCAD-SOLO`はリポジトリ名・ディレクトリ名・内部識別子として維持（`lib/brand.ts`の`BRAND.appName`のみ書き換え）。ソロ利用に限らずグループ・デート利用も含む想定に合わせた改称。

## 実装状況（コード確認済み）

- Next.js（App Router）+ Prisma + Neon（PostgreSQL、シンガポールリージョン）
- ナビ構成：おまかせ／地図／ゲーム／マイページ（AI相談タブ・ソロ活タブは廃止済み）
- メインループ：起動→今夜の3軒（距離順、シャッフルなし）→（任意でモード切替／次の3軒）→チェックイン確定→結果画面（Threadsシェア導線あり）
- 実績・来店ログ管理（`/logs`、`VisitLog.comment`にメモ保存）
- 場所決定の優先順位：手動指定（駅名検索）＞GPS＞IP推定＞既定値（渋谷駅）
- Vercel Cronで閉店確認（`/api/cron/check-closures`、月1回、Places APIの`businessStatus`を参照）
- 店舗データは現状デモ（架空）のみ。実店舗投入は未着手（`scripts/import-spots.ts`で投入予定、Gemini+Google検索groundingで候補発掘→人力レビュー→Geocoding→DB投入というフロー設計済み）
- ABOUTページ（`app/about/page.tsx`）の「私について」「アプリ一覧」「お問い合わせ・SNS」はmotionimaging提供の共通データAPIをサーバーコンポーネントでfetch（`lib/getSharedAbout.ts`、到達できない場合は埋め込みフォールバック）。下記「ABOUTページ共通データ」参照
- マイページのエコシステムセクション（`lib/data/scadApps.ts`のSCAD_APPS）はABOUTページとは別の仕組みのまま（`BRAND.beautyName`/`chatName`を直接参照）。共通データAPI化はしていない
- **Googleログイン（リピート施策 Phase 1、2026年10月・PR #31）**：Auth.js v5（`next-auth@beta`）＋Prisma Adapter、セッションはDB方式。設定は`auth.ts`（リポジトリ直下）、ログイン/ログアウトはServer Action（`app/actions/auth.ts`）。**middlewareは使わない**（Edge RuntimeでPrismaが動かないため）。閲覧はログイン不要で、書き込みボタンを押した時だけログインを促す
- 店舗詳細ページ `/spot/[spotId]`（Phase 1で新設）：ハート（`Favorite`、行きたいリスト）と「行った！」（`Visit`）。ホームの店カードと地図のSpotCardの店名横「詳細 ›」から開く
- 「行った！」はJSTで同一ユーザー・同一店舗1日1回。`Visit.visitDate`（JSTの"YYYY-MM-DD"、`lib/jst.ts`）の複合unique制約でDB側で保証している
- マイページ：Googleログイン中は延べ訪問数・訪問店舗数・エリア別件数（`Spot.nearestStation`で集計）・行きたいリスト・行った！履歴を表示
- `/terms`（利用規約）・`/privacy`（プライバシーポリシー）：Phase 1で新設。**文面はドラフト**（Googleログインで取得する情報・ユーザー投稿の扱いを記載）。Google OAuth同意画面のリンク先にもなっている

## リピート施策（引き継ぎ書のPhase 1〜4）

- **2種類の来店記録を並存させている**（オーナー決定）：
  - `VisitLog`：「今夜はここにする」で自動記録（従来通り、1日何回でも）。ランク・実績・Threadsシェアに使う。ログイン中は`User.id`、未ログインは従来の`x-user-id`ヘッダ（`demo-user`）で記録（`lib/auth.ts`の`getUserIdFromRequest`）
  - `Visit`：店舗詳細の「行った！」で手動記録（1日1回）。マイページの集計に使う
- ログイン導入前の`demo-user`名義の来店ログ・実績はそのまま残し、実ユーザーには引き継がない（オーナー決定）
- 書き込みAPI（`/api/favorites`・`/api/visits`）は`getLoggedInUserId()`でサーバー側のログイン確認をしている（未ログインは401）
- マイグレーションは**追加のみ**（新規テーブル作成だけ）。本番は`prisma migrate deploy`。`migrate reset`・`db push --force-reset`は禁止
- **Phase 2は「簡易版」から着手と決定**：「行った！」済みの店に写真を投稿でき、ホームの店カードに**最新の1枚を大きく**表示する（3枚の小さいサムネイルではなく1枚）。通報・自動非表示・管理画面（`ADMIN_EMAILS`）は後回し
- Phase 3（24時間店舗ノート）・Phase 4（貢献度ランキング・バッジ・ニックネーム）は未着手

## 認証・環境変数の構成（2026年10月時点）

| 環境変数 | scad-solo | mirai-dev-solo | 備考 |
|---|---|---|---|
| `DIRECT_URL` | 全環境 | 全環境（必須） | Neonの直接接続URL（Connection poolingオフ、ホスト名に`-pooler`なし）。ビルドの`prisma migrate deploy`が使う |
| `AUTH_SECRET` | Production・Preview | Production・Preview | 値は両プロジェクトで別々でよい |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Production・Preview | Production・Preview | Google CloudのOAuthクライアント |

- Google Cloudプロジェクトは**`scad-solo-maps`**（Maps APIキーと同居。地図用APIキーとは別物）。OAuthクライアント名は「ウェブクライアント1」、同意画面は「外部」・本番公開済み
- **同意画面にロゴを設定しない**。ロゴを入れるとGoogleのブランド審査（数日）が必要になる。ロゴなし＋基本スコープ（名前・メール・アイコン）なら審査不要
- 承認済みドメインは`scad-solo.vercel.app`・`mirai-dev-solo.vercel.app`（**`vercel.app`単体は登録できない**。パブリックサフィックス扱いのため）
- リダイレクトURI：本番・デモ・`localhost:3000`・ブランチのプレビュー固定URL（`scad-solo-git-claude-zen-newto-cf0258-motionimagingjps-projects.vercel.app`）の各`/api/auth/callback/google`

## 既知の落とし穴

- **ビルドが `P1002`（`Timed out trying to acquire a postgres advisory lock`）で失敗することがある。** NeonのFreeプランは5分無操作で休止（変更には有料プランが必要）し、起動待ちでマイグレーションのロック取得が10秒を超えるため。NeonのSQL Editorで何か実行して「Active」にしてから、間を置かずにRedeployすれば通る
- `DIRECT_URL`が無いプロジェクトはビルド冒頭の`P1012: Environment variable not found: DIRECT_URL`で即失敗する（mirai-dev-soloで発生）
- **Previewでログインを試すときは、ブランチの固定URL（`scad-solo-git-<ブランチ>-...vercel.app`）を使う。** デプロイごとのURLはGoogleのリダイレクトURIに登録していないので通らない。Preview環境に`AUTH_*`が無いと`/api/auth/signin/google`が「Server error（server configuration）」になる
- 環境変数は**次のビルドから**反映される。変更したらRedeployが必要
- Vercel MCPはチーム`motionimagingjps-projects`のスコープで403になり、デプロイログを取得できない。ログはオーナーに画面からコピーしてもらう（Build Logs枠のコピーアイコンで全文コピーできる）
- ビルドログの`旧仮データの削除に失敗しました（spot_demo_ike_meshi ... VisitLog_spotId_fkey）`は既存のseedの警告で、ビルドは止まらない

## 確定している設計決定

- アイコンはカクテルグラス＋グラスの縁のリップ跡（人物・夜景シルエットなし、シンプル）。ファイルは`app/apple-icon.png`（1024×1024）と`app/icon.svg`
- 配色はアプリ独自（白ベース×オレンジ）。イロナビの配色には合わせない
- ゲーム系機能（乾杯タイマー等）はナビに置かず結果画面にのみ表示。本体は未実装（`lib/data/activities.ts`の`ALL_GAMES`）

## 未決定・検討中

- 実店舗データの本格投入（Phase 0〜2で段階拡大予定、現状未着手）
- 地図画面の自由入力（AI検索）欄（コンテンツ検討中、未実装）
- マイページのエコシステムセクションも共通データAPI化するかどうか
- 利用規約・プライバシーポリシーの正式な文面（現状ドラフト。問い合わせ先・データ削除の手順が未記載）
- リピート施策の貢献度の配点・バッジの種類と名前・管理者メールアドレス（Phase 2本体〜Phase 4で決める）

---

# SCAD APPS LAB（統一トップサイト）── リポジトリ: motionimagingjp/scad-ai-lab

## 概要

Jake（写真家・個人開発者）のアプリ群（スクアド／イロナビ／ヨイナビ／SCADコネクト）を紹介する**トップ1ページだけの公開サイト**。各アプリへ人を送ることが唯一の目的。事業者向けページ・問い合わせ・開発LOG・CMSは今回は作らない方針（2026年9月時点）。ミゴロンは掲載しない。

**SCAD-Beauty/hub/（会社共有用デモ環境のハブ）とは別物。** hub/は社内共有用デモの入口、こちらは一般公開する本番サイト。混同しないこと。

**motion-imaging-lab.vercel.app というドメインはこのリポジトリ（scad-ai-lab）にエイリアスされている。** `motionimaging.vercel.app`（motionimagingjp/motionimagingリポジトリ、Jake個人のシンプルなハブページ）と名前が非常に紛らわしいが別プロジェクト。混同注意。

## 実装状況（コード確認済み・2026年9月時点）

- Next.js 16（App Router）／React 19。**JavaScriptのみ（TypeScriptなし）、Tailwindなし（`app/globals.css`に素のCSS1ファイル）**
- **デザインコンセプト：「写真のコンタクトシート（見本紙）×開発ログのインデックス」**。paper/navy/brass/cobaltの配色、見出しは明朝（Zen Old Mincho）、コマ番号・小ラベルは等幅（JetBrains Mono）でフィルムのコマ番号のような質感を出している。ヒーロー写真は枠付き・横書き（縦書きは廃止）。「アプリができるまで」のステップはフィルムのパーフォレーション（コマ送り穴）を模したドット装飾つき
- フォント：`next/font/google` の Zen Kaku Gothic New（和文本文）／Zen Old Mincho（見出し明朝）／JetBrains Mono（コマ番号・小ラベル）
- 環境変数なし。ページは完全に静的生成
- `app/site.config.js` に文言・リンク・SNSを一元管理。**修正は基本ここだけで完結する**設計。ヘッダーロゴ・フッターは`site.name`を分割して動的表示（直書きしない）
- `app/page.jsx` の `listImages()` が、ビルド時に `public/images/{hero,gallery}` を `fs.readdirSync` で読み込み、写真を自動反映（コード修正不要）。ヒーロー写真なし→ストライプ柄プレースホルダー、ギャラリー0枚→写真セクション自体を非表示
- **アプリ一覧カードはカード全体が1つのリンク**（`.app__link`が`display:grid`で組まれた`<a>`、アイコン・本文・CTA文言どこをクリックしても新しいタブでアプリが開く）
- **アプリカードのアイコン（`.app__swatch`）は文字アイコン（ス/イ/ヨ/コ）で固定。実際のアプリ画面のスクリーンショットは意図的に不採用**（下記「検討したが見送った変更」参照）
- 掲載リンクには計測用UTM（`utm_source=scad_apps_lab&utm_medium=referral&utm_campaign=top`）を`site.config.js`側で付与済み
- ビルド・PC(1440px)/スマホ(390px)の表示、写真ギャラリーの実写確認（日本語ファイル名含む）を確認済み

## 守るべき方針（重要）

1. **AI生成の人物・風景画像を使わない**。写真は本人（Jake）撮影の実写のみ
2. **顔は出さない**。名前のみ
3. 「AIエンジニア」という肩書きを強調しない。「写真を撮ってきた人間がAIを相棒に作っている」という見せ方
4. **手動更新が前提の機能は作らない**（Jakeは運用に時間を割けない）
5. コードは部分diffでなく全文で出力する。JakeはGitHubのWeb画面で「削除→新規作成」して貼り付ける運用

## 掲載アプリ（並び順固定・スクアドが先頭）

| アプリ | URL | 配色テーマ | mark |
|---|---|---|---|
| スクアド（SCAD CHAT） | scad-chat.vercel.app | 紺×金（特許出願済みバッジ付き） | ス |
| イロナビ（旧SCAD Beauty） | scad-beauty.vercel.app | 生成り×茶 | イ |
| ヨイナビ（旧Tokyo Solo Club、開発コード名SCAD-SOLO） | scad-solo.vercel.app | 白×オレンジ | ヨ |
| SCADコネクト（街コン運営サポートシステム） | scad-partyconnect.vercel.app | 白×緑（`#16a34a`） | コ |

ヨイナビはAI相談機能を廃止済みなので「AIに相談」系の説明文は書かないこと。SCADコネクトは2026年9月に4件目として追加（`app/site.config.js`の`apps`配列に`id: "partyconnect"`を追加、CSSに`.app--partyconnect`テーマを追加）。

## 未決定・検討中

- Vercelプロジェクト作成・本番デプロイ（Vercelプロジェクト名`scad-apps-lab`で稼働中。`motion-imaging-lab.vercel.app`がエイリアスされている）
- 独自ドメイン・OGP画像・開発LOG・事業者向けページは事業化時に検討（今回はやらない）

## 検討したが見送った変更：アプリカードへのスクリーンショット使用

Jakeが`public/images/apps/{sukuado,beauty,solo}.jpg`（各アプリの実際の画面）をアップロード済み。「使えたら使う、デザイン的に合わなければパスしてよい」という指示のもと、実際に`.app__swatch`（46〜72pxの正方形）に組み込んでPlaywrightで見た目を確認した。

**判断：不採用。文字アイコンのまま。**
- スクアド・ヨイナビは背景が白系で、46〜72pxまで縮小すると内容が判別できない薄い模様になる
- 3枚とも背景色・情報量がバラバラで、コンタクトシートのコンセプトが持つ統一感のある「色見本」的な世界観が崩れる
- 文字アイコンの方が遠目にも各アプリを瞬時に識別できる

画像ファイル自体（`public/images/apps/`）は削除せず残してある。将来カードデザインを見直す際の材料として使える。コード側（`findAppScreenshot()`等）は一旦削除済みなので、再度使う場合は実装からやり直しが必要。

## 実施済みメモ

- 実写真（ヒーロー1枚・ギャラリー7枚）はJakeがGitHub Web UIから`public/images/hero/` `gallery/`に配置済み（2026年9月）。日本語ファイル名（例：`DRA04944-強化-NR.jpg`）を含むが、`encodeURIComponent`済みのため404は発生していない（動作確認済み）

---

# ABOUTページ共通データ（motionimaging提供の共通API）

## 背景

各アプリのABOUTページにある「①私について」「②アプリ一覧」「③お問い合わせ・SNS」の3セクションは、以前はアプリごとにハードコードしており、アプリ名を改称するたびに4リポジトリ全てを手で直す必要があった（イロナビ／ヨイナビへの改称時に実際に表記漏れが発生した）。2026年9月、この3セクションを**motionimagingリポジトリが提供する共通データAPIに一本化**した。

## API本体

- 実装場所: `motionimagingjp/motionimaging` リポジトリの `src/app/api/shared-about/route.js`（データ本体は `src/lib/shared-about-data.js` の `SHARED_ABOUT` オブジェクト）
- エンドポイント: `https://motionimaging.vercel.app/api/shared-about`（`Access-Control-Allow-Origin: *`でCORS許可済み、5分キャッシュ）
- **アプリ名や紹介文を変更する場合は、このファイル（`shared-about-data.js`）を直すだけで全アプリに反映される。** 他4リポジトリのコード変更は不要（内容は自動反映、コードは変更不要という意味。各リポジトリは常にAPIから最新データをfetchする設計）
- レスポンス形式: `{ me: { name, text }, apps: [{ id, emoji, name, sub, prodUrl, demoUrl? }], sns: [{ label, icon, url }] }`
- `apps[].demoUrl`が無いアプリ（`partyconnect`・`migoron`）は、会社共有デモ版では「本番サイトへリンクしない」方針のため各アプリ側で一覧から除外する

## 各リポジトリでの利用方法

| リポジトリ | 実装 | 取得方式 |
|---|---|---|
| SCAD | `src/app/useSharedAbout.js`（クライアントフック） | ブラウザ側fetch（`"use client"`） |
| SCAD-Beauty | `public/index.html`内に直接実装 | ブラウザ側fetch（ビルド工程がないため唯一の選択肢） |
| scad-solo | `lib/getSharedAbout.ts` | サーバーコンポーネントでfetch（`next: { revalidate: 300 }`） |
| motionimaging（自サイトのABOUTページ） | `src/lib/shared-about-data.js`を直接import | サーバーコンポーネント、ネットワーク越しfetch不要（データの発生源そのものなので） |

いずれも**motionimaging側のAPIに到達できない場合は、各リポジトリに埋め込んだフォールバックデータを表示する**（表示が空にならないための保険）。フォールバックはAPI追加時点のスナップショットなので、将来アプリ名を変えた際はフォールバックまでは自動更新されない点に注意（大きな改称時は各リポジトリのフォールバックも手で合わせるのが望ましい）。

## デモ版での扱い

- SNSは`IS_DEMO`のとき各リポジトリ側で`url`を`null`に上書きしてリンクを消す（共通APIはSNSのURLを常に返す。null化はクライアント側の責務）
- アプリ一覧は`IS_DEMO`のとき`demoUrl`を持たないアプリ（`partyconnect`・`migoron`）を除外し、`demoUrl`を持つアプリは`prodUrl`の代わりに`demoUrl`を使う

## デプロイ順序の注意

motionimaging側のPRを**先に**マージ・本番反映しないと、他4リポジトリの変更はフォールバック表示のままになる（壊れはしないが、共通化の効果が出ない）。4リポジトリを同時に更新する際は必ずmotionimagingを先にマージすること。

## SNSアカウント

MOTION IMAGINGシリーズ全体の公式SNSとして、Instagram `@motion.imaging` / X `@motion_imaging` に統一（2026年9月）。以前はアプリごとに異なるアカウント（一部プレースホルダー、一部別ジャンルの誤ったアカウント）が設定されていた。

---

# Gemini APIキーと予算（全アプリ共通・2026年9月末時点）

- **APIキーは必ずサーバー側の環境変数 `GEMINI_API_KEY` に置く。`NEXT_PUBLIC_` 付きの変数に入れない**（ブラウザに丸見えになる）。スクアドは2026/8/24〜9/18の間、`NEXT_PUBLIC_GEMINI_API_KEY` で本番に露出していた（漏れたキーは konkatsu-jay プロジェクトの `…fKXk`）。9/30に新キーへ差し替え、Vercelの`NEXT_PUBLIC_GEMINI_API_KEY`は scad-chat-apps・mirai-dev-chat とも削除済み。`…fKXk`は利用停止を確認次第削除する
- Vercelで「Sensitive」にした環境変数は後から値を表示できない。どのキーか照合したい時は、AI Studioの利用状況（キー別）で判断する
- AI Studioのプロジェクト構成と月の費用上限：

| AI Studioプロジェクト | 使うアプリ | 課金 | 月の上限 |
|---|---|---|---|
| SCAD CHAT | スクアド本番・デモ（チャット＋音声） | 有料 | ¥15,000 |
| Default Gemini Project（キー名 HAIR RECIPEのAPI `…UcEg`、MIGORON `…fzRw`） | イロナビ、ミゴロン等 | 有料 | ¥5,000 |
| Gemini X fin | X自動投稿（と推定） | 無料枠 | ― |

- 費用上限に達するとそのプロジェクトのAPIが全部止まる（テキストチャットも）。音声の使いすぎはSupabaseの`voice_limits`（全体1日上限）で先に止め、費用上限は最後の安全装置として使う
- 最悪ケースの試算：音声を全体1日90分まで毎日使い切ると月約¥6,000〜15,500（Live APIは会話履歴も含めて課金されるため幅がある）

---

# 姉妹リポジトリ

- **motionimagingjp/motionimaging**（Jake個人のハブページ。Migoron本体、スクアードX自動投稿の実装場所。上記ABOUTページ共通データAPIの提供元でもある）: docsフォルダおよび`ai-cto-memory/`に開発ノウハウ・過去プロジェクトの記録を蓄積する運用あり。トップページ（`src/app/page.js`）にミゴロンナビ・SCADコネクトへのリンクカードあり
- **motionimagingjp/partyconnect**（SCADコネクトの実体。旧称PartyConnect。詳細はリポジトリ内のCLAUDE.md/READMEを参照）

---

# 会社共有用デモ環境（MIRAI-Dev-Apps）

## 目的と方針

開発活動を会社に共有するため、本番と同じアプリを別名・別URLで公開する
デモ環境。共有するのはURLのみで、GitHubリポジトリは非公開のまま。
**個人が特定できる情報（本人のSNSアカウント、本番サイトへの導線）を
一切表示しないこと**が最優先の要件。

| | 表示名 | URL |
|---|---|---|
| ハブ | MIRAI-Dev-Apps | `mirai-dev-apps.vercel.app` |
| チャット | MIRAI-Dev-Chat | `mirai-dev-chat.vercel.app` |
| ビューティー | MIRAI-Dev-Beauty | `mirai-dev-beauty.vercel.app` |
| ソロ | MIRAI-Dev-Solo | `mirai-dev-solo.vercel.app` |

## 切り替え方式（デモ用ブランチは作らない）

本番とデモで**同じブランチ（main）を共有**し、差分は1ファイルに集約した
ブランド設定だけで切り替える。デモ用ブランチを作ると本番の改修を都度
マージする運用が発生するため、意図的に避けている。

| リポジトリ | 設定ファイル | 判定方法 |
|---|---|---|
| SCAD | `src/app/brand.js` | 環境変数 `NEXT_PUBLIC_APP_VARIANT=demo` |
| SCAD-Beauty | `public/index.html` 内の `BRAND` | ホスト名が `mirai-dev` で始まるか |
| scad-solo | `lib/brand.ts` | 環境変数 `NEXT_PUBLIC_APP_VARIANT=demo` |

SCAD-Beautyだけビルド工程を持たない静的HTMLのため、環境変数が使えず
ホスト名判定にしている。

## 実装上の約束事

- **SNSアイコンはリンクを張らずに表示する。** `url` が `null` のときは
  `<a>` ではなく `<span>` で描画する分岐が各アプリに入っている。
  SNSを増やすときもこの形を崩さないこと（ABOUTページ共通データAPIを使う
  箇所も同様。APIはURLを常に返すので、null化は各リポジトリのクライアント
  側で行う）
- **姉妹アプリへのリンクはデモ版同士で閉じる。** 本番URLのままにすると、
  デモを見ている人がリンク1つで本番サイト（＝個人SNSリンクあり）に
  着地してしまう。過去にSCAD CHAT・イロナビ・ヨイナビの3本が
  相互に本番URLを直書きしていた
- **アバター画像を他アプリの本番ドメインから参照しない。** SCAD CHATは
  `scad-beauty.vercel.app/profile-avatar.jpg` を参照していたため、
  デモ版では自リポジトリの `public/profile-avatar.jpg` に切り替えている
- **デモ版では音声機能を出さない。** 予算を消費させないため、サキの「声で話す」ボタンは`IS_DEMO`で非表示、`/api/voice-token`も403を返す
- **mirai-dev-chat の環境変数は `GEMINI_API_KEY` と `NEXT_PUBLIC_APP_VARIANT` の2つ。** 2026/9/18〜9/30は`GEMINI_API_KEY`が未設定でデモ版チャットが動いていなかった（9/30に修正）
- **デモ版には `noindex` を付ける。** 本番と検索結果で競合させないため。
  Next.js側は `metadata.robots`、SCAD-Beautyは `vercel.json` の
  `X-Robots-Tag` ヘッダ（ホスト条件付き）で付与している

## scad-solo のDB共有について

デモ版は本番と同じNeonのDBを参照する（店舗データを作り直さないため）。
ただし来店ログ・実績が本番の記録に混ざらないよう、暫定ユーザーIDを
`lib/brand.ts` で分けている（本番 `demo-user` ／ デモ `mirai-demo-user`）。
ビルド時の `prisma db seed` は固定IDの `upsert` なので、両プロジェクトが
同じDBに対して走っても既存データは壊れない。

Googleログイン導入後（2026年10月）は、ログイン中のユーザーは本番・デモで
同じ`User`テーブルを使う（同じGoogleアカウントなら同じユーザー）。分離されるのは
未ログイン時の暫定ユーザーIDの記録だけ。mirai-dev-solo にも本番と同じ環境変数
（`DIRECT_URL`・`AUTH_*`）が必要（上記ヨイナビの「認証・環境変数の構成」参照）。

## ハブサイト

`SCAD-Beauty/hub/` に静的HTML1枚で置いてある（専用リポジトリを作れる
権限がなかったため、既存リポジトリのサブフォルダに配置）。Vercelでは
**Root Directory に `hub` を指定**した別プロジェクトとして公開する。
将来 `mirai-dev-apps` リポジトリを作る場合は、`hub/` の中身をそのまま
新リポジトリのルートに移せばよい（相対リンク・外部アセットを持たない）。

## デモ版の反映タイミング（本番は即時、デモは夜間バッチ）

本番（scad-chat / scad-beauty / scad-solo）は従来通り `main` へのpushで
即デプロイされる。**デモ4プロジェクト（mirai-dev-chat/beauty/solo/apps）
だけは、pushしても自動デプロイされない設定にしてある**（各Vercel
プロジェクトの Settings → Git → Ignored Build Step を `exit 0` に設定
済み）。コード側（`main`を共有する構成）は変更していない。

デモへの反映は以下の2通り:
- **定時の自動同期**: `SCAD-Beauty/.github/workflows/nightly-demo-sync.yml`
  が1日3回（JST 3:00・8:30・12:00）、4つのVercel Deploy Hookをまとめて
  叩き、その時点の`main`の内容でデプロイする。軽いビルドを起動するだけの
  処理なので回数を増やしても負荷・コストは無視できる範囲
- **オンデマンド同期**: GitHubの当該リポジトリのActionsタブから
  「Nightly demo sync」→「Run workflow」で手動実行すれば即座に同期できる
  （`workflow_dispatch`）

Deploy Hook URLは`motionimagingjp/SCAD-Beauty`リポジトリのSecrets
（`HOOK_MIRAI_DEV_CHAT` / `HOOK_MIRAI_DEV_BEAUTY` / `HOOK_MIRAI_DEV_SOLO` /
`HOOK_MIRAI_DEV_APPS`）に登録する。各Vercelプロジェクトの
Settings → Git → Deploy Hooks で作成したURL（`main`ブランチ向け）を
そのまま貼る。ここに置くワークフローは1本で4プロジェクト分をまとめて
処理するため、SCADやscad-soloリポジトリ側には何も追加しなくてよい。
