export type RecipeIngredient = {
  name: string
  amount: string
}

export type RecipeDetail = {
  ingredients: readonly RecipeIngredient[]
  steps: readonly string[]
}

export const RECIPE_DETAILS_BY_DISH_ID: Readonly<Record<string, RecipeDetail>> = {
  curry: {
    ingredients: [
      { name: '豚こま切れ肉', amount: '200g' }, { name: '玉ねぎ', amount: '1個' },
      { name: 'じゃがいも', amount: '2個' }, { name: 'にんじん', amount: '1/2本' },
      { name: 'カレールー', amount: '4皿分' }, { name: '水', amount: '600ml' }, { name: 'サラダ油', amount: '大さじ1' },
    ],
    steps: ['玉ねぎ、じゃがいも、にんじんを食べやすい大きさに切る。', '鍋に油を熱し、豚肉と野菜を炒める。', '水を加え、アクを取りながら野菜がやわらかくなるまで煮る。', '火を止めてルーを溶かし、弱火でとろみがつくまで煮る。'],
  },
  'fried-rice': {
    ingredients: [
      { name: '温かいごはん', amount: '茶碗2杯分' }, { name: '卵', amount: '2個' },
      { name: '長ねぎ', amount: '1/3本' }, { name: 'ハム', amount: '4枚' },
      { name: 'しょうゆ', amount: '小さじ2' }, { name: 'ごま油', amount: '大さじ1' }, { name: '塩・こしょう', amount: '少々' },
    ],
    steps: ['長ねぎとハムを細かく切り、卵を溶く。', 'フライパンにごま油を強めの中火で熱し、卵とごはんを続けて入れてほぐす。', '長ねぎとハムを加えて炒め、鍋肌からしょうゆを回し入れる。', '塩・こしょうで味をととのえる。'],
  },
  karaage: {
    ingredients: [
      { name: '鶏もも肉', amount: '300g' }, { name: 'しょうゆ', amount: '大さじ1と1/2' },
      { name: '酒', amount: '大さじ1' }, { name: 'おろし生姜', amount: '小さじ1' },
      { name: 'おろしにんにく', amount: '小さじ1/2' }, { name: '片栗粉', amount: '大さじ5' }, { name: '揚げ油', amount: '適量' },
    ],
    steps: ['鶏肉をひと口大に切り、しょうゆ、酒、生姜、にんにくをもみ込んで10分置く。', '汁気を軽く切り、片栗粉を全体にまぶす。', '170℃の油で3〜4分揚げ、一度取り出して2分休ませる。', '180℃で約1分、表面がからりとするまで二度揚げする。'],
  },
  'mapo-tofu': {
    ingredients: [
      { name: '木綿豆腐', amount: '1丁（300g）' }, { name: '豚ひき肉', amount: '150g' },
      { name: '長ねぎ', amount: '1/2本' }, { name: '豆板醤', amount: '小さじ1' },
      { name: 'みそ', amount: '大さじ1' }, { name: 'しょうゆ', amount: '大さじ1' },
      { name: '鶏がらスープ', amount: '150ml' }, { name: '片栗粉', amount: '小さじ2' },
    ],
    steps: ['豆腐を2cm角、長ねぎをみじん切りにする。', 'フライパンで豚ひき肉を炒め、豆板醤とみそを加えて香りを出す。', '鶏がらスープ、しょうゆ、豆腐を加えて弱めの中火で5分煮る。', '水溶き片栗粉でとろみをつけ、長ねぎを加える。'],
  },
  napolitan: {
    ingredients: [
      { name: 'スパゲッティ', amount: '160g' }, { name: '玉ねぎ', amount: '1/2個' },
      { name: 'ピーマン', amount: '2個' }, { name: 'ウインナー', amount: '4本' },
      { name: 'ケチャップ', amount: '大さじ5' }, { name: 'バター', amount: '10g' }, { name: '塩・こしょう', amount: '少々' },
    ],
    steps: ['スパゲッティを表示時間どおりに茹でる。', '玉ねぎ、ピーマン、ウインナーを薄切りにしてバターで炒める。', '具を端に寄せ、ケチャップを1分ほど炒めて酸味を飛ばす。', 'スパゲッティを加えて全体を合わせ、塩・こしょうでととのえる。'],
  },
  nikujaga: {
    ingredients: [
      { name: '牛こま切れ肉', amount: '200g' }, { name: 'じゃがいも', amount: '3個' },
      { name: '玉ねぎ', amount: '1個' }, { name: 'にんじん', amount: '1/2本' },
      { name: 'だし汁', amount: '300ml' }, { name: 'しょうゆ', amount: '大さじ3' },
      { name: 'みりん', amount: '大さじ2' }, { name: '砂糖', amount: '大さじ1と1/2' },
    ],
    steps: ['じゃがいも、玉ねぎ、にんじんを食べやすい大きさに切る。', '鍋で牛肉と野菜をさっと炒める。', 'だし汁、砂糖、みりんを加え、落としぶたをして10分煮る。', 'しょうゆを加え、じゃがいもがやわらかくなるまでさらに10分煮る。'],
  },
  omurice: {
    ingredients: [
      { name: '温かいごはん', amount: '茶碗2杯分' }, { name: '鶏もも肉', amount: '120g' },
      { name: '玉ねぎ', amount: '1/2個' }, { name: '卵', amount: '4個' },
      { name: 'ケチャップ', amount: '大さじ5' }, { name: 'バター', amount: '15g' }, { name: '塩・こしょう', amount: '少々' },
    ],
    steps: ['鶏肉と玉ねぎを小さく切り、バター半量で炒める。', 'ごはんとケチャップを加えて炒め、2皿に分ける。', '卵2個を溶き、残りのバター半量で半熟に焼く。', 'チキンライスに卵をのせる。同じ手順でもう1皿作る。'],
  },
  oyakodon: {
    ingredients: [
      { name: '鶏もも肉', amount: '200g' }, { name: '玉ねぎ', amount: '1/2個' }, { name: '卵', amount: '3個' },
      { name: '温かいごはん', amount: '丼2杯分' }, { name: 'だし汁', amount: '120ml' },
      { name: 'しょうゆ', amount: '大さじ2' }, { name: 'みりん', amount: '大さじ2' }, { name: '砂糖', amount: '小さじ2' },
    ],
    steps: ['鶏肉をひと口大、玉ねぎを薄切りにし、卵を軽く溶く。', 'フライパンにだし汁と調味料、玉ねぎを入れて中火で煮る。', '鶏肉を加えて火を通し、溶き卵を2回に分けて回し入れる。', '半熟で火を止め、ごはんにのせる。'],
  },
  peperoncino: {
    ingredients: [
      { name: 'スパゲッティ', amount: '160g' }, { name: 'にんにく', amount: '2片' },
      { name: '赤唐辛子', amount: '1本' }, { name: 'オリーブオイル', amount: '大さじ3' }, { name: '塩', amount: '適量' },
    ],
    steps: ['湯1.5Lに塩大さじ1を入れ、スパゲッティを表示より1分短く茹でる。', 'フライパンにオリーブオイル、薄切りのにんにく、唐辛子を入れて弱火にかける。', '香りが立ったら茹で汁80mlを加え、よく混ぜて乳化させる。', 'スパゲッティを加え、ソースを絡める。'],
  },
  yakisoba: {
    ingredients: [
      { name: '焼きそば麺', amount: '2玉' }, { name: '豚こま切れ肉', amount: '150g' },
      { name: 'キャベツ', amount: '2枚' }, { name: 'もやし', amount: '1/2袋' },
      { name: '中濃ソース', amount: '大さじ3' }, { name: 'サラダ油', amount: '大さじ1' }, { name: '塩・こしょう', amount: '少々' },
    ],
    steps: ['豚肉とキャベツを食べやすい大きさに切る。', 'フライパンに油を熱し、豚肉、キャベツ、もやしを炒める。', '麺と水大さじ2を加え、ほぐしながら炒める。', 'ソースを加えて水分を飛ばすように炒める。'],
  },
  'cold-tofu': {
    ingredients: [{ name: '絹ごし豆腐', amount: '1丁' }, { name: '万能ねぎ', amount: '2本' }, { name: 'かつお節', amount: '1袋' }, { name: 'しょうゆ', amount: '小さじ2' }],
    steps: ['豆腐の水気を切り、食べやすく分けて器に盛る。', '小口切りのねぎとかつお節をのせ、しょうゆをかける。'],
  },
  'cucumber-sunomono': {
    ingredients: [{ name: 'きゅうり', amount: '1本' }, { name: '乾燥わかめ', amount: '3g' }, { name: '酢', amount: '大さじ2' }, { name: '砂糖', amount: '大さじ1' }, { name: 'しょうゆ', amount: '小さじ1' }],
    steps: ['きゅうりを薄切りにして塩少々をもみ、5分置いて水気を絞る。', '戻したわかめと調味料を加え、全体を和える。'],
  },
  'spinach-ohitashi': {
    ingredients: [{ name: 'ほうれん草', amount: '1束' }, { name: 'だし汁', amount: '100ml' }, { name: 'しょうゆ', amount: '大さじ1' }, { name: 'かつお節', amount: '1袋' }],
    steps: ['ほうれん草を塩少々を入れた湯で茹で、冷水に取って水気を絞る。', '4cm幅に切り、だし汁としょうゆに5分浸す。', '器に盛り、かつお節をのせる。'],
  },
  'bean-sprout-namul': {
    ingredients: [{ name: 'もやし', amount: '1袋' }, { name: 'ごま油', amount: '大さじ1' }, { name: '鶏がらスープの素', amount: '小さじ1/2' }, { name: 'いりごま', amount: '小さじ1' }],
    steps: ['もやしを2分茹で、ざるに上げてしっかり水気を切る。', '温かいうちにごま油、鶏がらスープの素、いりごまで和える。'],
  },
  'tomato-onion-marinade': {
    ingredients: [{ name: 'トマト', amount: '2個' }, { name: '玉ねぎ', amount: '1/4個' }, { name: '酢', amount: '大さじ1' }, { name: 'オリーブオイル', amount: '大さじ1' }, { name: '塩', amount: '小さじ1/4' }],
    steps: ['トマトをひと口大、玉ねぎを薄切りにする。', '調味料を混ぜ、トマトと玉ねぎを和えて5分なじませる。'],
  },
}

export function estimatedAmount(name: string) {
  if (/(ごはん)/.test(name)) return '茶碗2杯分'
  if (/(パスタ|スパゲッティ)/.test(name)) return '160g'
  if (/(麺|うどん|ビーフン|米麺)/.test(name)) return '2人分'
  if (/(鶏|豚|牛|ひき肉|肉)/.test(name)) return '200g'
  if (/(卵)/.test(name)) return '2個'
  if (/(玉ねぎ)/.test(name)) return '1/2個'
  if (/(じゃがいも)/.test(name)) return '2個'
  if (/(にんじん)/.test(name)) return '1/2本'
  if (/(キャベツ)/.test(name)) return '1/4個'
  if (/(豆腐)/.test(name)) return '1丁'
  if (/(チーズ)/.test(name)) return '50g'
  if (/(牛乳|生クリーム|ワイン|だし)/.test(name)) return '100ml'
  if (/(にんにく)/.test(name)) return '1片'
  if (/(唐辛子)/.test(name)) return '1本'
  if (/(パン粉|片栗粉|小麦粉)/.test(name)) return '大さじ3'
  if (/(油|しょうゆ|みりん|酒|酢|ソース|ケチャップ)/.test(name)) return '大さじ1'
  return '適量'
}
