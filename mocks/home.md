# Home screen (今日のおすすめ) — copy source of truth

Transcribed from owner's concept design image (2026-06-12).
Layout reference: `mocks/concept/home.png` (owner to place the image file).

## Header

- App title: `となりごはん`
- (Deferred for MVP: hamburger menu, notification bell)

## Greeting block

```text
おはようございます！
今日のおすすめはこちら
```

- Greeting varies by time of day: おはようございます！ / こんにちは！ / こんばんは！
- Button (deferred for MVP): おすすめ条件

## Mode tabs (3 cards, single select)

```text
かんたん
すぐ作れる・工程少なめ

少し広げる
いつもと少し違う

しっかり作る
満足感のある一品
```

## Featured suggestion block

```text
{起点料理}から広げる
いつもの料理から、少し変えてみませんか？
```

- Button: `起点を変更`
- Featured card fields:
  - badge: `おすすめ！`
  - tags: `かんたん` `人気`
  - title example: `油淋鶏（ユーリンチー）`
  - short copy example: `唐揚げにねぎだれをかけるだけで、中華風のさっぱりおかずに。`
  - detail rows:
    - `変わるところ` → e.g. `ねぎだれをかける`
    - `工程量` → e.g. `唐揚げ＋1工程`
    - `新しく必要な食材` → e.g. `長ねぎ、酢、ごま油`
  - buttons: `詳しく見る` + bookmark (save) icon
  - carousel dots (multiple featured cards)

## Secondary suggestions block

```text
他にもこんな広げ方があります
```

- Link: `すべて見る`
- Card fields: mode tag (かんたん / 少し広げる / しっかり作る), bookmark icon, title,
  short copy (2 lines), `工程量` row e.g. `唐揚げ＋2工程`, chevron to detail

## Bottom blocks (2 columns)

```text
作りたいリスト        一覧を見る >
（保存した料理名のリスト）

最近作った料理        一覧を見る >
（料理名 + 作った日：YYYY/MM/DD）
```

Note: v2.7 までの「作ってみたいリスト」は、この設計では「作りたいリスト」と表記する。

## Bottom nav (3 tabs)

```text
今日のおすすめ / 広がりマップ / 食材から探す
```
