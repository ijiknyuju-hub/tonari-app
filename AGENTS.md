# sekaishi-chizu — Codex実装ガイド

世界史地図ワークノートのタブレット（iPad）アプリ。
教科書を読みながら白地図に書き込み、自分で歴史地図を作って復習できる学習ツール。

**重要: Expo v56 のドキュメントは https://docs.expo.dev/versions/v56.0.0/ を参照すること。**

## スタック

- Expo SDK 56 + React Native 0.85
- expo-router（ファイルベースルーティング）
- react-native-svg（SVGレンダリング）
- react-native-gesture-handler（描画ジェスチャー）
- react-native-reanimated（アニメーション）
- @react-native-async-storage（永続化）
- TypeScript（strict）

## ファイル構成

```
app/
  _layout.tsx         ← GestureHandlerRootView wrapper（実装済み）
  index.tsx           ← ホーム画面（TODO多数）
  map/[id].tsx        ← 地図編集画面（TODO多数）
components/
  MapCanvas.tsx       ← 最重要コンポーネント（TODO多数）
  DrawingToolbar.tsx  ← ツールバー（スタブ）
  LayerPanel.tsx      ← レイヤーパネル（動作する）
  TemplateChecklist.tsx ← チェックリスト（動作する）
lib/
  types.ts            ← 型定義（完成）
  storage.ts          ← AsyncStorage操作（完成）
constants/
  layers.ts           ← レイヤー定義（完成）
data/templates/       ← 4単元のJSONデータ（完成）
assets/maps/          ← SVGファイル（未追加、別途用意）
```

## 優先実装タスク（Phase 1）

### 1. MapCanvas.tsx — 描画エンジン（最優先）

`MapCanvas.tsx`のTODOを実装する。

**要件：**
- `GestureDetector`（react-native-gesture-handler）でApple Pencil/タッチを検知
- ペンモード：パン開始→ポイント追加→終了時にStrokeElement生成
- 消しゴム：タップ近傍のStrokeElementを削除（半径30px以内）
- 矢印モード：ドラッグで始点→終点のArrowElement生成
- ラベルモード：タップ位置にTextInputモーダルを表示→LabelElement生成
- `reviewMode=true`のとき全LabelElementのopacityを0にする
- 白地図SVGは`SvgXml`（react-native-svg）でレンダリング

### 2. DrawingToolbar.tsx — アイコン整備

`@expo/vector-icons`の`Ionicons`を使ってツールボタンを整備する。

| ツール | アイコン名 |
|--------|------------|
| pen | pencil |
| highlighter | brush |
| arrow | arrow-forward |
| label | pricetag |
| eraser | backspace |

### 3. app/map/[id].tsx — 単元テンプレート表示

`unitId`が存在するとき、対応するJSONをimportして`TemplateChecklist`に渡す。

```typescript
const templateMap: Record<string, UnitTemplate> = {
  orient:      require('../../data/templates/orient.json'),
  islam:       require('../../data/templates/islam.json'),
  mongol:      require('../../data/templates/mongol.json'),
  exploration: require('../../data/templates/exploration.json'),
};
```

### 4. app/index.tsx — 単元選択フロー

新規作成時に地域選択→単元選択のモーダルを追加する。

## Phase 2（後回し）

- 時代比較ビュー（同地域を複数時代で横並び表示）
- 矢印のラベル紐づけ
- PDF出力
- アンドゥ/リドゥ

## 型定義（参照）

`lib/types.ts`を参照。主要な型：

- `DrawingElement = StrokeElement | LabelElement | ArrowElement`
- `MapSession` — 地図1枚分のデータ（要素・レイヤー・メタデータ）
- `UnitTemplate` — 書き込み項目リスト

## 注意事項

- コメントは書かない（型と名前で自明にする）
- console.logは残さない
- AsyncStorageの操作は必ずtry/catchで囲む
- iPad横向きを基準にレイアウト設計する（orientation: landscape）
