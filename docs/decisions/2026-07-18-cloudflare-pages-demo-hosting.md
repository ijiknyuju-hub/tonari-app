# 2026-07-18 — デモ公開先をCloudflare Pagesにする

Status: Accepted

## Context

友人がPCまたはスマートフォンから触れるWeb v2.9デモを、同日18時までに安定した公開URLへ配置する必要がある。
アプリはNext.jsだが、現在のデモ機能はブラウザのlocalStorageで完結し、サーバーAPIやSSRを必要としない。

Cloudflare Workers + OpenNextも検証したが、Windowsで生成したバンドルは公式の非保証範囲に該当し、ローカルpreviewと公開Workerの全ルートで500になった。

## Decision

- Web v2.9デモはNext.jsの静的書き出し（`output: "export"`）をCloudflare Pagesへ配備する。
- Pagesプロジェクト名は `tonari-gohan`、本番URLは `https://tonari-gohan.pages.dev` とする。
- 旧来の `force-dynamic` 指定は、サーバー機能を使用していない画面から外す。
- `npm run deploy` をPages向けの正規デプロイコマンドとする。

## Consequences

- PCの稼働や一時Tunnelに依存せず、CloudflareのCDNから配信できる。
- OpenNextのWindows互換問題を回避できる。
- 将来サーバーAPI、SSR、Server Actionsが必要になった時点でWorkers構成をLinux CI上で再検討する。
- ホームの日付はビルド時点で生成されるため、日次更新が必要になったらクライアント側の日付導出へ移す。

## Verification

- `npm run build`: 75ページの静的書き出し成功。
- Pages本番URLの `/`, `/onboarding`, `/home`, `/search`, `/repertoire`, `/weekset`, `/shopping`, `/dish/tori-ten`: すべてHTTP 200。
