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
- Gemini API (gemini-2.5-flash) でAI応答生成

## リポジトリ構造の注意点（コード確認済み・2026年9月時点）

- **本番で実際に使われるルートページは `src/app/page.js`**。同じディレクトリに `src/app/scad-page.js` という似た名前のファイルが存在するが、これは**Next.jsのルーティングには使われない未使用ファイル**（`page.js`という名前でなければルーティングされない）。過去に誤って`scad-page.js`を編集し、本番に変更が反映されない事故が発生しているため、編集前に必ずどちらが実際にルーティングされているか確認すること。
- `src/app/about/page.js`: アプリ説明ページ（「私について」「アプリ一覧」「お問い合わせ・SNS」はmotionimaging提供の共通データAPIを使用。下記「ABOUTページ共通データ」参照）
- `src/app/useSharedAbout.js`: 上記共通データAPIをクライアント側でfetchするフック（フォールバック埋め込み済み）
- `src/app/privacy/page.js`: プライバシーポリシー
- `src/app/layout.js`: 共通レイアウト・テーマカラー
- `public/`: アイコン画像（`advisor-saki.png`、`advisor-ren.png` など）
- **アドバイザーは3人：サキ・レン・のり様**（手動選択方式）。`ADVISORS`オブジェクトで人格・プロンプトを管理
- X自動投稿（@scadchatapp）は**motionimagingjp/motionimaging側**に実装・稼働中（`app/api/post-sukuado-morning`等、`post-sukuado-core.js`に共通ロジック）。このリポジトリ自体にはX投稿コードはない
- **データ保存・DB・同意画面は未実装**（Supabase等の接続コード、consent画面のコードは現状リポジトリ内に存在しない）

## ブランディング

- アドバイザーアイコンは実写調アニメ塗りイラスト（丸型・バストアップ・正面向き・自然光の公園背景）で統一。
- 「のり様」は イロナビ（旧SCAD Beauty） の `profile-avatar.jpg` を外部URL参照で共有（`https://scad-beauty.vercel.app/profile-avatar.jpg`）。サキ・レンは `public/advisor-*.png` としてリポジトリ内にホスト。
- UIカラーは白ベース（`#ffffff`）。アドバイザーごとのアクセントカラー: サキ `#e89bb8`、レン `#3a92b5`、のり様 `#b8860b`。
- 絵文字アイコンから画像アイコンへの切り替えは、`AdvisorIcon` コンポーネント（`icon` フィールドの有無で分岐）で統一的に扱う。
- 姉妹アプリ導線: aboutページの姉妹アプリ一覧はmotionimaging提供の共通データAPIから取得（旧`SERIES_APPS`のハードコード配列は廃止）。アプリ内でアドバイザーを一時切替する設計ではなく、別アプリへ誘導する形は維持。

## 確定している設計決定（一部は未実装）

- **アプリ名**: スクアド（英語表記 SCAD）／スクショ＋アドバイスの意味
- **データ方針（未実装・設計のみ）**: 会話本文は履歴として保管するのみで統計・学習には使わない。個人情報を除去したメタデータ（返信時間・文字数・絵文字有無など）のみを中間サーバーで抽出・保存する設計（特許構造に準拠）
- **同意画面（未実装）**: スクロール必須＋同意ボタン方式（チェックボックスなし）を予定
- **統計活用**: 今はデータ蓄積のみに専念する方針。実運用（統計に基づくアドバイス最適化）は1年後を目安に着手
- **集客**: X（@scadchatapp）で1日2回（朝データ寄り／夜共感寄り）＋宣伝枠の自動投稿。motionimaging側で実装・本番投稿済み

## 未決定・検討中

- 中間サーバー（メタデータ抽出・保存）の具体的な実装場所・構成
- 同意画面・データ保存基盤（DB）の実装着手時期

## デプロイフロー

1. 機能ブランチで変更
2. PR作成
3. Vercelのデプロイステータスチェック（`Vercel: Deployment has completed`）が成功するのを確認
4. mainにマージ → 本番反映

## 既知の落とし穴

- GitHub MCPの `create_or_update_file` はバイナリ（画像）アップロードに不向き。ローカルにリポジトリクローンがある場合は `git add`/`commit`/`push` で直接コミットする方が確実。
- チャットに添付された画像は環境のファイルシステムに自動保存されない。zipファイルとしてアップロードしてもらう運用が有効。

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

## 確定している設計決定

- アイコンはカクテルグラス＋グラスの縁のリップ跡（人物・夜景シルエットなし、シンプル）
- 配色はアプリ独自（白ベース×オレンジ）。イロナビの配色には合わせない
- ゲーム系機能（乾杯タイマー等）はナビに置かず結果画面にのみ表示。本体は未実装（`lib/data/activities.ts`の`ALL_GAMES`）

## 未決定・検討中

- 実店舗データの本格投入（Phase 0〜2で段階拡大予定、現状未着手）
- 地図画面の自由入力（AI検索）欄（コンテンツ検討中、未実装）
- マイページのエコシステムセクションも共通データAPI化するかどうか

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
- **デモ版には `noindex` を付ける。** 本番と検索結果で競合させないため。
  Next.js側は `metadata.robots`、SCAD-Beautyは `vercel.json` の
  `X-Robots-Tag` ヘッダ（ホスト条件付き）で付与している

## scad-solo のDB共有について

デモ版は本番と同じNeonのDBを参照する（店舗データを作り直さないため）。
ただし来店ログ・実績が本番の記録に混ざらないよう、暫定ユーザーIDを
`lib/brand.ts` で分けている（本番 `demo-user` ／ デモ `mirai-demo-user`）。
ビルド時の `prisma db seed` は固定IDの `upsert` なので、両プロジェクトが
同じDBに対して走っても既存データは壊れない。

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
