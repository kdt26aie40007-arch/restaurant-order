// メニューとアレルゲンのデータ
// 価格はすべて税込（円）

const STORE_NAME = 'サニーテーブル';

// 表示・絞り込みに使うアレルゲン（特定原材料8品目）
const ALLERGENS = ['卵', '乳', '小麦', 'えび', 'かに', 'そば', '落花生', 'くるみ'];

// カテゴリの表示順
const CATEGORIES = ['ハンバーグ・ステーキ', 'パスタ', 'サラダ・サイド', 'キッズ', 'デザート', 'ドリンク'];

// メイン料理として扱うカテゴリ（おすすめ機能で使う）
const MAIN_CATEGORIES = ['ハンバーグ・ステーキ', 'パスタ', 'キッズ'];

// ---------- あなたへのおすすめ（年代・性別から選ぶ） ----------

// 料理の特徴（MENU の tags）と、おすすめの理由に出す説明
const TAG_LABELS = {
  hearty: 'ボリュームのある料理',
  classic: '定番の味',
  trend: '今どきの人気メニュー',
  healthy: '野菜もとれるヘルシーな料理',
  japanese: '和風の味つけ',
  light: 'あっさりした料理',
  snack: 'みんなでつまめるもの',
  sweet: '甘いもの',
  kids: 'お子さま向けメニュー',
  value: 'おかわり自由でお得なもの',
  fruit: 'フルーツを使ったもの',
};

// 年代ごとに、どの特徴を何点で好むか（点数の合計が高い料理をおすすめする）
const AGE_GROUPS = [
  { id: 'kid', label: '12歳以下', weights: { kids: 6, sweet: 3, fruit: 3, snack: 2 } },
  { id: 'teen', label: '10代（13〜19歳）', weights: { hearty: 3, snack: 3, sweet: 2, value: 2, trend: 1 } },
  { id: 'young', label: '20〜30代', weights: { trend: 3, hearty: 2, value: 2, sweet: 1 } },
  { id: 'middle', label: '40〜50代', weights: { classic: 3, healthy: 2, japanese: 2, value: 1 } },
  { id: 'senior', label: '60代以上', weights: { japanese: 3, light: 3, healthy: 2, fruit: 1 } },
];

// 性別は答えなくてもよい。結果に与える影響は年代より小さくしている
const GENDERS = [
  { id: 'none', label: '回答しない', weights: {} },
  { id: 'male', label: '男性', weights: { hearty: 1 } },
  { id: 'female', label: '女性', weights: { sweet: 1 } },
];

// image: 料理の画像。写真に差し替えるときは images フォルダに置き、ここのパスを書き換える（例: 'images/h1.jpg'）
const MENU = [
  { id: 'h1', image: 'images/h1.svg', category: 'ハンバーグ・ステーキ', name: 'サニーハンバーグ', price: 890, allergens: ['卵', '乳', '小麦'], recommended: true, tags: ['hearty', 'classic'], description: '肉汁たっぷりの看板メニュー。デミグラスソースで。' },
  { id: 'h2', image: 'images/h2.svg', category: 'ハンバーグ・ステーキ', name: 'チーズインハンバーグ', price: 990, allergens: ['卵', '乳', '小麦'], recommended: false, tags: ['hearty', 'trend'], description: '中からとろけるチーズがあふれます。' },
  { id: 'h3', image: 'images/h3.svg', category: 'ハンバーグ・ステーキ', name: 'サーロインステーキ 150g', price: 1490, allergens: [], recommended: false, tags: ['hearty', 'classic'], description: '岩塩とわさびでさっぱりと。' },
  { id: 'h4', image: 'images/h4.svg', category: 'ハンバーグ・ステーキ', name: 'チキングリル ガーリックソース', price: 850, allergens: ['小麦'], recommended: false, tags: ['hearty', 'healthy'], description: '皮はパリッと、中はジューシーに焼き上げました。' },
  { id: 'p1', image: 'images/p1.svg', category: 'パスタ', name: 'ミートソーススパゲティ', price: 790, allergens: ['乳', '小麦'], recommended: false, tags: ['classic'], description: 'じっくり煮込んだ定番の味。' },
  { id: 'p2', image: 'images/p2.svg', category: 'パスタ', name: 'えびとトマトのクリームパスタ', price: 950, allergens: ['乳', '小麦', 'えび'], recommended: true, tags: ['trend'], description: 'ぷりぷりのえびと濃厚トマトクリーム。' },
  { id: 'p3', image: 'images/p3.svg', category: 'パスタ', name: '和風きのこパスタ', price: 820, allergens: ['小麦'], recommended: false, tags: ['japanese', 'light', 'healthy'], description: '3種のきのこをしょうゆバターで。' },
  { id: 'p4', image: 'images/p4.svg', category: 'パスタ', name: 'たらこと大葉のスパゲティ', price: 850, allergens: ['乳', '小麦'], recommended: false, tags: ['japanese', 'trend'], description: 'たらこバターに大葉の香りをそえて。' },
  { id: 's1', image: 'images/s1.svg', category: 'サラダ・サイド', name: 'シーザーサラダ', price: 490, allergens: ['卵', '乳', '小麦'], recommended: false, tags: ['healthy', 'trend'], description: 'パルメザンチーズとクルトン入り。' },
  { id: 's2', image: 'images/s2.svg', category: 'サラダ・サイド', name: 'フライドポテト', price: 390, allergens: [], recommended: false, tags: ['snack'], description: '揚げたてのシンプルな塩味。' },
  { id: 's3', image: 'images/s3.svg', category: 'サラダ・サイド', name: 'コーンスープ', price: 290, allergens: ['乳'], recommended: false, tags: ['light', 'classic'], description: 'やさしい甘さのポタージュ。' },
  { id: 's4', image: 'images/s4.svg', category: 'サラダ・サイド', name: 'かにクリームコロッケ（2個）', price: 490, allergens: ['卵', '乳', '小麦', 'かに'], recommended: false, tags: ['classic', 'hearty'], description: 'かにの風味たっぷりのとろーりクリーム。' },
  { id: 's5', image: 'images/s5.svg', category: 'サラダ・サイド', name: '温野菜サラダ ピーナッツドレッシング', price: 450, allergens: ['落花生'], recommended: false, tags: ['healthy', 'light'], description: '彩り野菜にコクのあるピーナッツだれ。' },
  { id: 's6', image: 'images/s6.svg', category: 'サラダ・サイド', name: 'ミニざるそば', price: 390, allergens: ['小麦', 'そば'], recommended: false, tags: ['japanese', 'light'], description: 'お食事にちょっと足せるハーフサイズ。' },
  { id: 'k1', image: 'images/k1.svg', category: 'キッズ', name: 'お子さまプレート', price: 690, allergens: ['卵', '乳', '小麦', 'えび'], recommended: false, tags: ['kids'], description: 'ミニハンバーグ・えびフライ・ゼリー付き。' },
  { id: 'k2', image: 'images/k2.svg', category: 'キッズ', name: 'お子さまカレー', price: 590, allergens: ['乳', '小麦'], recommended: false, tags: ['kids'], description: '甘口のカレーにミニサラダ付き。' },
  { id: 'd1', image: 'images/d1.svg', category: 'デザート', name: 'ストロベリーパフェ', price: 650, allergens: ['卵', '乳', '小麦'], recommended: true, tags: ['sweet', 'trend'], description: 'いちごをたっぷり使った季節のパフェ。' },
  { id: 'd2', image: 'images/d2.svg', category: 'デザート', name: 'くるみのガトーショコラ', price: 480, allergens: ['卵', '乳', '小麦', 'くるみ'], recommended: false, tags: ['sweet', 'classic'], description: '濃厚チョコに香ばしいくるみ。' },
  { id: 'd3', image: 'images/d3.svg', category: 'デザート', name: 'フルーツシャーベット', price: 290, allergens: [], recommended: false, tags: ['sweet', 'light'], description: '乳・卵を使わないさっぱりデザート。' },
  { id: 'd4', image: 'images/d4.svg', category: 'デザート', name: 'ティラミス', price: 450, allergens: ['卵', '乳', '小麦'], recommended: false, tags: ['sweet', 'trend'], description: 'マスカルポーネとほろ苦いエスプレッソ。' },
  { id: 'r1', image: 'images/r1.svg', category: 'ドリンク', name: 'ドリンクバー', price: 290, allergens: [], recommended: false, tags: ['value'], description: 'ソフトドリンク・コーヒー・紅茶が飲み放題。' },
  { id: 'r2', image: 'images/r2.svg', category: 'ドリンク', name: 'オレンジジュース', price: 250, allergens: [], recommended: false, tags: ['fruit'], description: '果汁100%。' },
  { id: 'r3', image: 'images/r3.svg', category: 'ドリンク', name: 'メロンソーダフロート', price: 350, allergens: ['乳'], recommended: false, tags: ['sweet'], description: 'バニラアイスをのせたメロンソーダ。' },
];
