# CLAUDE.md — スクアドシリーズ（アプリ開発グループ）

## このファイルについて

スクアドを起点に展開する複数アプリ（スクアド／スクアドビューティー／スクアドソロ／SCAD APPS LAB）をまとめて管理するグループ用CLAUDE.mdです。**motionimagingjp/SCAD・SCAD-Beauty・scad-solo・scad-ai-lab の4リポジトリに同一内容をコミットして運用**しています（各リポジトリの直下に置くことで、そのリポジトリで作業するClaude Codeセッションが自動的に読み込みます）。アイコンデザインの系統を揃えて統一感を持たせる方針で開発中。

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
- `src/app/about/page.js`: アプリ説明ページ
- `src/app/privacy/page.js`: プライバシーポリシー
- `src/app/layout.js`: 共通レイアウト・テーマカラー
- `public/`: アイコン画像（`advisor-saki.png`、`advisor-ren.png` など）
- **アドバイザーは3人：サキ・レン・のり様**（手動選択方式）。`ADVISORS`オブジェクトで人格・プロンプトを管理
- X自動投稿（@scadchatapp）は**motionimagingjp/motionimaging側**に実装・稼働中（`app/api/post-sukuado-morning`等、`post-sukuado-core.js`に共通ロジック）。このリポジトリ自体にはX投稿コードはない
- **データ保存・DB・同意画面は未実装**（Supabase等の接続コード、consent画面のコードは現状リポジトリ内に存在しない）

## ブランディング

- アドバイザーアイコンは実写調アニメ塗りイラスト（丸型・バストアップ・正面向き・自然光の公園背景）で統一。
- 「のり様」は SCAD BEAUTY の `profile-avatar.jpg` を外部URL参照で共有（`https://scad-beauty.vercel.app/profile-avatar.jpg`）。サキ・レンは `public/advisor-*.png` としてリポジトリ内にホスト。
- UIカラーは白ベース（`#ffffff`）。アドバイザーごとのアクセントカラー: サキ `#e89bb8`、レン `#3a92b5`、のり様 `#b8860b`。
- 絵文字アイコンから画像アイコンへの切り替えは、`AdvisorIcon` コンポーネント（`icon` フィールドの有無で分岐）で統一的に扱う。
- 姉妹アプリ導線: aboutページの`SERIES_APPS`で、ヘアスタイル・ファッション相談はSCAD BEAUTYへの外部リンクとして案内している（アプリ内でアドバイザーを一時切替する設計ではなく、別アプリへ誘導する形）。

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
- 姉妹アプリ: SCAD Beauty（`motionimagingjp/SCAD-Beauty`）, スクアドソロ（`motionimagingjp/scad-solo`）

---

# スクアドビューティー（SCAD Beauty）── リポジトリ: motionimagingjp/SCAD-Beauty

## 概要

チャット型ヘアスタイル・ファッション・レストラン診断アプリ（旧称 HAIR Recipe）。`scad-beauty.vercel.app` で稼働中。

## 実装状況（コード確認済み）

- `api/`配下に5本のGemini呼び出しAPI：`analyze-face-shape.js`（顔型診断）、`analyze-screenshot.js`（スクショ解析）、`analyze-fashion-check.js`（ファッションチェック）、`generate-hairstyle-composite.js`（ヘア合成）、`restaurant-recommend.js`（レストラン推薦）
- フロントは`public/index.html`（vanilla JS）＋`public/catalog.json`（ヘアスタイル一覧データ）
- Gemini APIキーはサーバー環境変数のみで保持、フロント非露出。API未接続時はモックへ自動フォールバック（README記載・設計として確認済み）
- プロフィールアイコン `public/profile-avatar.jpg`（帽子・メガネの実写調イラスト）をSCAD CHATの「のり様」と共有している

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

# SCAD APPS LAB（統一トップサイト）── リポジトリ: motionimagingjp/scad-ai-lab

## 概要

Jake（写真家・個人開発者）のアプリ群（スクアド／SCAD Beauty／Tokyo Solo Club）を紹介する**トップ1ページだけの公開サイト**。各アプリへ人を送ることが唯一の目的。事業者向けページ・問い合わせ・開発LOG・CMSは今回は作らない方針（2026年9月時点）。ミゴロンは掲載しない。

**SCAD-Beauty/hub/（会社共有用デモ環境のハブ）とは別物。** hub/は社内共有用デモの入口、こちらは一般公開する本番サイト。混同しないこと。

## 実装状況（コード確認済み・2026年9月時点）

- Next.js 16（App Router）／React 19。**JavaScriptのみ（TypeScriptなし）、Tailwindなし（`app/globals.css`に素のCSS1ファイル）**
- **デザインコンセプト：「写真のコンタクトシート（見本紙）×開発ログのインデックス」**。paper/navy/brass/cobaltの配色、見出しは明朝（Zen Old Mincho）、コマ番号・小ラベルは等幅（JetBrains Mono）でフィルムのコマ番号のような質感を出している。ヒーロー写真は枠付き・横書き（縦書きは廃止）。「アプリができるまで」のステップはフィルムのパーフォレーション（コマ送り穴）を模したドット装飾つき
- フォント：`next/font/google` の Zen Kaku Gothic New（和文本文）／Zen Old Mincho（見出し明朝）／JetBrains Mono（コマ番号・小ラベル）
- 環境変数なし。ページは完全に静的生成
- `app/site.config.js` に文言・リンク・SNSを一元管理。**修正は基本ここだけで完結する**設計。ヘッダーロゴ・フッターは`site.name`を分割して動的表示（直書きしない）
- `app/page.jsx` の `listImages()` が、ビルド時に `public/images/{hero,gallery}` を `fs.readdirSync` で読み込み、写真を自動反映（コード修正不要）。ヒーロー写真なし→ストライプ柄プレースホルダー、ギャラリー0枚→写真セクション自体を非表示
- **アプリ一覧カードはカード全体が1つのリンク**（`.app__link`が`display:grid`で組まれた`<a>`、アイコン・本文・CTA文言どこをクリックしても新しいタブでアプリが開く）
- **アプリカードのアイコン（`.app__swatch`）は文字アイコン（ス/B/S）で固定。実際のアプリ画面のスクリーンショットは意図的に不採用**（下記「検討したが見送った変更」参照）
- 掲載リンクには計測用UTM（`utm_source=scad_apps_lab&utm_medium=referral&utm_campaign=top`）を`site.config.js`側で付与済み
- ビルド・PC(1440px)/スマホ(390px)の表示、写真ギャラリーの実写確認（日本語ファイル名含む）を確認済み

## 守るべき方針（重要）

1. **AI生成の人物・風景画像を使わない**。写真は本人（Jake）撮影の実写のみ
2. **顔は出さない**。名前のみ
3. 「AIエンジニア」という肩書きを強調しない。「写真を撮ってきた人間がAIを相棒に作っている」という見せ方
4. **手動更新が前提の機能は作らない**（Jakeは運用に時間を割けない）
5. コードは部分diffでなく全文で出力する。JakeはGitHubのWeb画面で「削除→新規作成」して貼り付ける運用

## 掲載アプリ（並び順固定・スクアドが先頭）

| アプリ | URL | 配色テーマ |
|---|---|---|
| スクアド（SCAD CHAT） | scad-chat.vercel.app | 紺×金（特許出願済みバッジ付き） |
| SCAD Beauty | scad-beauty.vercel.app | 生成り×茶 |
| Tokyo Solo Club（開発名 SCAD-SOLO） | scad-solo.vercel.app | 白×オレンジ |

Tokyo Solo ClubはAI相談機能を廃止済みなので「AIに相談」系の説明文は書かないこと。

## 未決定・検討中

- Vercelプロジェクト作成・本番デプロイ（Vercelプロジェクト名は`SCAD-APPS-LAB`で作成中。GitHub連携が完了すればpush/マージのたびに自動デプロイされる）
- 独自ドメイン・OGP画像・開発LOG・事業者向けページは事業化時に検討（今回はやらない）

## 検討したが見送った変更：アプリカードへのスクリーンショット使用

Jakeが`public/images/apps/{sukuado,beauty,solo}.jpg`（各アプリの実際の画面）をアップロード済み。「使えたら使う、デザイン的に合わなければパスしてよい」という指示のもと、実際に`.app__swatch`（46〜72pxの正方形）に組み込んでPlaywrightで見た目を確認した。

**判断：不採用。文字アイコン（ス/B/S）のまま。**
- スクアド・Tokyo Solo Clubは背景が白系で、46〜72pxまで縮小すると内容が判別できない薄い模様になる
- 3枚とも背景色・情報量がバラバラで、コンタクトシートのコンセプトが持つ統一感のある「色見本」的な世界観が崩れる
- 文字アイコンの方が遠目にも各アプリを瞬時に識別できる

画像ファイル自体（`public/images/apps/`）は削除せず残してある。将来カードデザインを見直す際の材料として使える。コード側（`findAppScreenshot()`等）は一旦削除済みなので、再度使う場合は実装からやり直しが必要。

## 実施済みメモ

- 実写真（ヒーロー1枚・ギャラリー7枚）はJakeがGitHub Web UIから`public/images/hero/` `gallery/`に配置済み（2026年9月）。日本語ファイル名（例：`DRA04944-強化-NR.jpg`）を含むが、`encodeURIComponent`済みのため404は発生していない（動作確認済み）

---

# 姉妹リポジトリ

- **motionimagingjp/motionimaging**（Migoron本体、スクアードX自動投稿の実装場所）: docsフォルダおよび`ai-cto-memory/`に開発ノウハウ・過去プロジェクトの記録を蓄積する運用あり

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
  SNSを増やすときもこの形を崩さないこと
- **姉妹アプリへのリンクはデモ版同士で閉じる。** 本番URLのままにすると、
  デモを見ている人がリンク1つで本番サイト（＝個人SNSリンクあり）に
  着地してしまう。過去にSCAD CHAT・SCAD Beauty・scad-soloの3本が
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
