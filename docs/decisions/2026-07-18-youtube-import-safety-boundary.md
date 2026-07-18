# 2026-07-18 — YouTube取り込みはリンク保存とAI解析を分離する

Status: Accepted for validation

## Context

YouTube取り込みはv1の中核候補だが、公開動画の字幕本文を取得するYouTube公式汎用APIはない。一方、Gemini APIはpreview機能として公開YouTube URLを映像・音声入力にできる。

固定10ケースのphase 1では、閲覧可能な9本のoEmbedメタデータ取得が9/9成功し、取得不能ケースはHTTP 403になった。Geminiによる料理同定・材料・手順抽出は、検証環境にAPIキーがないため未測定。

現在のデモはCloudflare Pagesの静的サイトであり、ブラウザへGemini APIキーを置くことはできない。

## Decision

- URLを受け取ったら、AI解析を待たず参考リンクとして端末へ保存する。
- YouTube動画IDを抽出できる場合は、解析前でもYouTubeのサムネイルと外部再生導線を表示する。
- oEmbed取得とGemini解析は別の状態として扱う。どちらが失敗しても保存済みリンクを消さない。
- Gemini解析を製品へ入れる場合はCloudflare Worker等のサーバー側から呼び、APIキーはsecretに置く。ブラウザや静的出力へ含めない。
- 抽出結果は必ず「更新候補」として表示する。既存レシピを自動上書きしない。
- 動画で明示されない分量は「不明」「適量」のまま返し、モデルに補完させない。
- 非料理、複数料理、低信頼、取得不能、解析エラーは`confirm`、`manual`、または`link-only`へ戻す。
- 自動反映の可否は最低30本の固定ケースを測るまで決めない。

## Consequences

- リンク保存はネットワークやAI精度に依存せず即時完了する。
- 解析失敗でユーザーの入力が消える最悪ケースを避けられる。
- AI取り込みには静的Pagesとは別に小さなバックエンドと秘密情報管理が必要になる。
- 30本検証で精度や費用が合わなくても、参考リンク保存と動画閲覧はv1に残せる。

## Evidence

- `docs/validations/youtube-recipe-import-results.json`
- `docs/validations/youtube-recipe-import-results.csv`
- `docs/validations/youtube-recipe-import-limit-test.md`
- https://ai.google.dev/gemini-api/docs/video-understanding
- https://developers.google.com/youtube/v3/docs/captions/download
