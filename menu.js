// メニューとアレルゲンのデータ
// 価格はすべて税込（円）

const STORE_NAME = 'サニーテーブル';

// 表示・絞り込みに使うアレルゲン（特定原材料8品目）
const ALLERGENS = ['卵', '乳', '小麦', 'えび', 'かに', 'そば', '落花生', 'くるみ'];

// カテゴリの表示順
const CATEGORIES = ['ハンバーグ・ステーキ', 'パスタ', 'サラダ・サイド', 'キッズ', 'デザート', 'ドリンク'];

// メイン料理として扱うカテゴリ（おすすめ機能で使う）
const MAIN_CATEGORIES = ['ハンバーグ・ステーキ', 'パスタ', 'キッズ'];

const MENU = [
  { id: 'h1', category: 'ハンバーグ・ステーキ', name: 'サニーハンバーグ', price: 890, allergens: ['卵', '乳', '小麦'], recommended: true, description: '肉汁たっぷりの看板メニュー。デミグラスソースで。' },
  { id: 'h2', category: 'ハンバーグ・ステーキ', name: 'チーズインハンバーグ', price: 990, allergens: ['卵', '乳', '小麦'], recommended: false, description: '中からとろけるチーズがあふれます。' },
  { id: 'h3', category: 'ハンバーグ・ステーキ', name: 'サーロインステーキ 150g', price: 1490, allergens: [], recommended: false, description: '岩塩とわさびでさっぱりと。' },
  { id: 'h4', category: 'ハンバーグ・ステーキ', name: 'チキングリル ガーリックソース', price: 850, allergens: ['小麦'], recommended: false, description: '皮はパリッと、中はジューシーに焼き上げました。' },
  { id: 'p1', category: 'パスタ', name: 'ミートソーススパゲティ', price: 790, allergens: ['乳', '小麦'], recommended: false, description: 'じっくり煮込んだ定番の味。' },
  { id: 'p2', category: 'パスタ', name: 'えびとトマトのクリームパスタ', price: 950, allergens: ['乳', '小麦', 'えび'], recommended: true, description: 'ぷりぷりのえびと濃厚トマトクリーム。' },
  { id: 'p3', category: 'パスタ', name: '和風きのこパスタ', price: 820, allergens: ['小麦'], recommended: false, description: '3種のきのこをしょうゆバターで。' },
  { id: 'p4', category: 'パスタ', name: 'たらこと大葉のスパゲティ', price: 850, allergens: ['乳', '小麦'], recommended: false, description: 'たらこバターに大葉の香りをそえて。' },
  { id: 's1', category: 'サラダ・サイド', name: 'シーザーサラダ', price: 490, allergens: ['卵', '乳', '小麦'], recommended: false, description: 'パルメザンチーズとクルトン入り。' },
  { id: 's2', category: 'サラダ・サイド', name: 'フライドポテト', price: 390, allergens: [], recommended: false, description: '揚げたてのシンプルな塩味。' },
  { id: 's3', category: 'サラダ・サイド', name: 'コーンスープ', price: 290, allergens: ['乳'], recommended: false, description: 'やさしい甘さのポタージュ。' },
  { id: 's4', category: 'サラダ・サイド', name: 'かにクリームコロッケ（2個）', price: 490, allergens: ['卵', '乳', '小麦', 'かに'], recommended: false, description: 'かにの風味たっぷりのとろーりクリーム。' },
  { id: 's5', category: 'サラダ・サイド', name: '温野菜サラダ ピーナッツドレッシング', price: 450, allergens: ['落花生'], recommended: false, description: '彩り野菜にコクのあるピーナッツだれ。' },
  { id: 's6', category: 'サラダ・サイド', name: 'ミニざるそば', price: 390, allergens: ['小麦', 'そば'], recommended: false, description: 'お食事にちょっと足せるハーフサイズ。' },
  { id: 'k1', category: 'キッズ', name: 'お子さまプレート', price: 690, allergens: ['卵', '乳', '小麦', 'えび'], recommended: false, description: 'ミニハンバーグ・えびフライ・ゼリー付き。' },
  { id: 'k2', category: 'キッズ', name: 'お子さまカレー', price: 590, allergens: ['乳', '小麦'], recommended: false, description: '甘口のカレーにミニサラダ付き。' },
  { id: 'd1', category: 'デザート', name: 'ストロベリーパフェ', price: 650, allergens: ['卵', '乳', '小麦'], recommended: true, description: 'いちごをたっぷり使った季節のパフェ。' },
  { id: 'd2', category: 'デザート', name: 'くるみのガトーショコラ', price: 480, allergens: ['卵', '乳', '小麦', 'くるみ'], recommended: false, description: '濃厚チョコに香ばしいくるみ。' },
  { id: 'd3', category: 'デザート', name: 'フルーツシャーベット', price: 290, allergens: [], recommended: false, description: '乳・卵を使わないさっぱりデザート。' },
  { id: 'd4', category: 'デザート', name: 'ティラミス', price: 450, allergens: ['卵', '乳', '小麦'], recommended: false, description: 'マスカルポーネとほろ苦いエスプレッソ。' },
  { id: 'r1', category: 'ドリンク', name: 'ドリンクバー', price: 290, allergens: [], recommended: false, description: 'ソフトドリンク・コーヒー・紅茶が飲み放題。' },
  { id: 'r2', category: 'ドリンク', name: 'オレンジジュース', price: 250, allergens: [], recommended: false, description: '果汁100%。' },
  { id: 'r3', category: 'ドリンク', name: 'メロンソーダフロート', price: 350, allergens: ['乳'], recommended: false, description: 'バニラアイスをのせたメロンソーダ。' },
];
