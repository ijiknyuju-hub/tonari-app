# Ingredients search screen (食材から探す) — copy source of truth

Transcribed from owner's concept design image (2026-06-12).
Layout reference: `mocks/concept/ingredients-search.png` (owner to place the image file).

## Header

```text
食材から探す
冷蔵庫にある食材から、作れる料理を見つけよう
```

- Button (deferred for MVP): 絞り込み
- Search box placeholder: `食材名で検索（例：豚こま、豆腐、キャベツ）`
  - MVP: chips only; free-text search deferred

## Ingredient chips

```text
最近よく使う食材               すべての食材を見る >
豚こま / 鶏むね / 豆腐 / キャベツ / 玉ねぎ / もやし
```

MVP note: 「最近よく使う」の学習はしない。料理データの mainIngredients から頻出順に静的に出す。

## Selected ingredients

```text
選択中の食材                          クリア
{食材チップ ×}  [+ 追加]
```

## Result tabs (3, with count badges)

```text
作ったことがある {n} / 作りたいリスト {n} / チャレンジしてみたい {n}
```

- Caption under tab 1: `あなたが作ったことがある料理を、食材に合わせて表示しています`
- Sort control (deferred for MVP): `並び替え：おすすめ順`
- Tab mapping:
  - 作ったことがある = madeAt がある料理 + ベース料理
  - 作りたいリスト = 保存済み（未作成）
  - チャレンジしてみたい = 未保存の提案カード

## Result cards

Fields: bookmark icon, title, short copy (1-2 lines), tags row:
`かんたん|ふつう` + `工程：{n}`, chevron to detail.

## Add-ingredient suggestion block

```text
もう少し食材を足すと、こんな料理も作れます
```

Card fields: title + `+ {足りない食材（読点区切り）}`
Example: `回鍋肉 ＋ピーマン、キャベツ`

## Bottom nav (3 tabs)

```text
今日のおすすめ / 広がりマップ / 食材から探す
```
