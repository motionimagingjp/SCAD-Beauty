# MIRAI-Dev-Apps（社内共有用デモ環境のハブ）

デモ版3アプリへの入口となる1枚ものの静的サイト。`index.html` だけで完結する。

## デプロイ方法

このリポジトリを Vercel にもう1つのプロジェクトとしてインポートし、

- Project Name: `mirai-dev-apps`
- Settings → General → **Root Directory: `hub`**

を設定する。ビルド工程は無く、`index.html` がそのまま配信される。
`vercel.json` でサイト全体に `X-Robots-Tag: noindex` を付けているため、
検索エンジンには登録されない。

## 掲載内容を変えるとき

`index.html` を直接編集する。リンク先は以下の3つに固定してある。

- https://mirai-dev-chat.vercel.app/
- https://mirai-dev-beauty.vercel.app/
- https://mirai-dev-solo.vercel.app/

本番サイト（scad-*.vercel.app）や個人のSNSアカウントへのリンクは
意図的に一切含めていない。追記する際もこの方針を維持すること。

## 将来、専用リポジトリに移す場合

`hub/` の中身をそのまま新リポジトリのルートに置き、Root Directory の
設定を外せばよい。`index.html` は相対リンクも外部アセットも持たないため、
配置場所を選ばない。
