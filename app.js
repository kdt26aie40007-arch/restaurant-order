// サニーテーブル メニュー・オーダーの画面処理

const STORAGE_KEY = 'sunnyTable.orders';
const MAX_QTY_PER_ITEM = 10;
const NO_IMAGE = 'images/noimage.svg';
const PAYMENT_KEY = 'sunnyTable.payments';
const MAX_RECEIVED = 1000000;
const RANKING_SIZE = 3;
const MIN_TABLE = 1;
const MAX_TABLE = 30;

const state = {
  cart: [],                    // { id, qty }
  allergies: new Set(),        // 選択中のアレルゲン
  category: 'すべて',           // 表示中のカテゴリ
  payConfirming: false,        // 会計の確認表示中か
};

// ---------- 共通 ----------

// 要素を作る小さなヘルパー（文字は textContent で入れる）
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

function yen(n) {
  return '¥' + n.toLocaleString('ja-JP');
}

function findItem(id) {
  return MENU.find((item) => item.id === id);
}

// 選択中アレルゲンのうち、その料理に含まれるもの
function conflictAllergens(item) {
  return item.allergens.filter((a) => state.allergies.has(a));
}

// テーブル番号を読み取る。不正なら null
function readTableNumber() {
  const raw = document.getElementById('table-number').value.trim();
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= MIN_TABLE && n <= MAX_TABLE ? n : null;
}

// ---------- 注文データの保存（localStorage） ----------

function loadOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}

function loadPayments() {
  try {
    const data = JSON.parse(localStorage.getItem(PAYMENT_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function savePayments(payments) {
  try {
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
    return true;
  } catch {
    return false;
  }
}

// ---------- アレルギー絞り込み ----------

function renderAllergyFilter() {
  const box = document.getElementById('allergy-options');
  box.replaceChildren(...ALLERGENS.map((name) => {
    const input = el('input', { type: 'checkbox', value: name, checked: state.allergies.has(name) });
    input.addEventListener('change', () => {
      if (input.checked) state.allergies.add(name);
      else state.allergies.delete(name);
      renderMenu();
      renderRanking();
      renderCart();
    });
    return el('label', { className: 'chip' }, [input, name]);
  }));
}

// ---------- カテゴリタブ ----------

function renderTabs() {
  const tabs = ['すべて', 'おすすめ', ...CATEGORIES];
  const box = document.getElementById('category-tabs');
  box.replaceChildren(...tabs.map((name) => {
    const button = el('button', {
      type: 'button',
      className: 'tab' + (state.category === name ? ' is-active' : ''),
      textContent: name,
    });
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(state.category === name));
    button.addEventListener('click', () => {
      state.category = name;
      renderTabs();
      renderMenu();
    });
    return button;
  }));
}

// ---------- メニュー表示 ----------

function renderMenuCard(item) {
  const conflicts = conflictAllergens(item);
  const blocked = conflicts.length > 0;

  const qtyInput = el('input', {
    type: 'number', min: 1, max: MAX_QTY_PER_ITEM, step: 1, value: 1,
    className: 'qty-input', disabled: blocked,
  });
  qtyInput.setAttribute('aria-label', `${item.name}の数量`);

  const error = el('p', { className: 'message' });
  const addButton = el('button', { type: 'button', className: 'primary', textContent: '追加', disabled: blocked });
  addButton.addEventListener('click', () => {
    error.textContent = addToCart(item.id, qtyInput.value);
    if (!error.textContent) qtyInput.value = 1;
  });

  // 画像が見つからないときは代わりの画像を出す
  const img = el('img', { className: 'menu-img', src: item.image || NO_IMAGE, alt: item.name, loading: 'lazy' });
  img.addEventListener('error', () => {
    if (!img.src.endsWith(NO_IMAGE)) img.src = NO_IMAGE;
  }, { once: true });

  return el('article', { className: 'menu-card' + (blocked ? ' is-blocked' : '') }, [
    img,
    el('div', { className: 'menu-card-head' }, [
      el('h3', { textContent: item.name }),
      item.recommended ? el('span', { className: 'badge', textContent: 'おすすめ' }) : null,
    ]),
    el('p', { className: 'desc', textContent: item.description }),
    el('p', { className: 'allergens' },
      'アレルゲン：' + (item.allergens.length ? item.allergens.join('・') : 'なし（8品目）')),
    blocked ? el('p', { className: 'warning', textContent: `⚠ ${conflicts.join('・')}を含むため注文できません` }) : null,
    el('div', { className: 'menu-card-foot' }, [
      el('span', { className: 'price', textContent: yen(item.price) }),
      qtyInput,
      addButton,
    ]),
    error,
  ]);
}

function renderMenu() {
  const list = document.getElementById('menu-list');
  let items = MENU;
  if (state.category === 'おすすめ') items = MENU.filter((i) => i.recommended);
  else if (state.category !== 'すべて') items = MENU.filter((i) => i.category === state.category);

  list.replaceChildren(...items.map(renderMenuCard));
}

// ---------- カート ----------

// 追加できたら空文字、できなければエラーメッセージを返す
function addToCart(id, rawQty) {
  const item = findItem(id);
  if (conflictAllergens(item).length) return '選択中のアレルゲンを含むため追加できません。';

  const text = String(rawQty).trim();
  if (!/^\d+$/.test(text)) return '数量は整数で入力してください。';
  const qty = Number(text);
  if (qty < 1 || qty > MAX_QTY_PER_ITEM) return `数量は1〜${MAX_QTY_PER_ITEM}で入力してください。`;

  const line = state.cart.find((l) => l.id === id);
  const current = line ? line.qty : 0;
  if (current + qty > MAX_QTY_PER_ITEM) {
    return `1品につき${MAX_QTY_PER_ITEM}個までです（カートに${current}個あります）。`;
  }

  if (line) line.qty += qty;
  else state.cart.push({ id, qty });
  setCartMessage('');
  renderCart();
  return '';
}

function changeQty(id, diff) {
  const line = state.cart.find((l) => l.id === id);
  if (!line) return;
  const next = line.qty + diff;
  if (next > MAX_QTY_PER_ITEM) {
    setCartMessage(`1品につき${MAX_QTY_PER_ITEM}個までです。`);
    return;
  }
  if (next < 1) state.cart = state.cart.filter((l) => l.id !== id);
  else line.qty = next;
  setCartMessage('');
  renderCart();
}

function cartTotal() {
  return state.cart.reduce((sum, l) => sum + findItem(l.id).price * l.qty, 0);
}

function setCartMessage(text, ok = false) {
  const p = document.getElementById('cart-message');
  p.textContent = text;
  p.classList.toggle('is-ok', ok);
}

function renderCart() {
  const list = document.getElementById('cart-list');
  if (state.cart.length === 0) {
    list.replaceChildren(el('li', { className: 'empty', textContent: 'カートは空です' }));
  } else {
    list.replaceChildren(...state.cart.map((line) => {
      const item = findItem(line.id);
      const minus = el('button', { type: 'button', className: 'small', textContent: '−' });
      const plus = el('button', { type: 'button', className: 'small', textContent: '+' });
      const remove = el('button', { type: 'button', className: 'small link', textContent: '削除' });
      minus.setAttribute('aria-label', `${item.name}を1つ減らす`);
      plus.setAttribute('aria-label', `${item.name}を1つ増やす`);
      minus.addEventListener('click', () => changeQty(line.id, -1));
      plus.addEventListener('click', () => changeQty(line.id, 1));
      remove.addEventListener('click', () => changeQty(line.id, -line.qty));

      const conflicts = conflictAllergens(item);
      return el('li', { className: 'cart-line' + (conflicts.length ? ' is-blocked' : '') }, [
        el('span', { className: 'cart-name' }, [
          item.name,
          conflicts.length ? el('small', { className: 'warning', textContent: ` ⚠ ${conflicts.join('・')}を含む` }) : null,
        ]),
        el('span', { className: 'cart-qty' }, [minus, el('span', { textContent: line.qty }), plus]),
        el('span', { className: 'cart-sub', textContent: yen(item.price * line.qty) }),
        remove,
      ]);
    }));
  }
  document.getElementById('cart-total').textContent = yen(cartTotal());
  renderSuggestion();
}

// ---------- おすすめ機能 ----------

// カートの内容から、追加でおすすめする料理を1つ選ぶ
function pickSuggestion() {
  const inCart = state.cart.map((l) => findItem(l.id));
  const has = (category) => inCart.some((i) => i.category === category);
  const hasMain = inCart.some((i) => MAIN_CATEGORIES.includes(i.category));
  const ok = (item) => item && !conflictAllergens(item).length && !state.cart.some((l) => l.id === item.id);

  if (hasMain && !has('ドリンク')) {
    const drinkBar = findItem('r1');
    if (ok(drinkBar)) return { item: drinkBar, reason: 'お食事と一緒にドリンクバーはいかがですか？' };
  }
  if (hasMain && !has('デザート')) {
    const dessert = MENU.filter((i) => i.category === 'デザート').sort((a, b) => b.recommended - a.recommended).find(ok);
    if (dessert) return { item: dessert, reason: '食後のデザートはいかがですか？' };
  }
  if (inCart.length === 0) {
    const pick = MENU.find((i) => i.recommended && ok(i));
    if (pick) return { item: pick, reason: '本日のおすすめです。' };
  }
  return null;
}

function renderSuggestion() {
  const box = document.getElementById('suggestion');
  const s = pickSuggestion();
  if (!s) {
    box.hidden = true;
    return;
  }
  const add = el('button', { type: 'button', className: 'small', textContent: '追加する' });
  add.addEventListener('click', () => {
    const msg = addToCart(s.item.id, 1);
    if (msg) setCartMessage(msg);
  });
  box.replaceChildren(
    el('p', { textContent: s.reason }),
    el('p', { className: 'suggest-item' }, [`${s.item.name}（${yen(s.item.price)}）`, ' ', add]),
  );
  box.hidden = false;
}

// ---------- 注文 ----------

function placeOrder() {
  const table = readTableNumber();
  if (table === null) {
    setCartMessage(`テーブル番号を${MIN_TABLE}〜${MAX_TABLE}の整数で入力してください。`);
    document.getElementById('table-number').focus();
    return;
  }
  if (state.cart.length === 0) {
    setCartMessage('カートに料理がありません。');
    return;
  }
  const blocked = state.cart.map((l) => findItem(l.id)).filter((i) => conflictAllergens(i).length);
  if (blocked.length) {
    setCartMessage(`選択中のアレルゲンを含む料理があります：${blocked.map((i) => i.name).join('、')}。削除してから注文してください。`);
    return;
  }

  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    table,
    items: state.cart.map((l) => {
      const item = findItem(l.id);
      return { id: item.id, name: item.name, price: item.price, qty: l.qty };
    }),
    total: cartTotal(),
    orderedAt: new Date().toISOString(),
    paid: false,
  };

  const orders = loadOrders();
  orders.push(order);
  if (!saveOrders(orders)) {
    setCartMessage('注文を保存できませんでした。ブラウザの設定を確認してください。');
    return;
  }

  state.cart = [];
  state.payConfirming = false;
  renderCart();
  renderBill();
  renderRanking();
  setCartMessage(`テーブル${table}番のご注文を承りました。`, true);
}

// ---------- 注文履歴・会計 ----------

function renderBill() {
  const box = document.getElementById('bill');
  const table = readTableNumber();
  if (table === null) {
    box.replaceChildren(el('p', { className: 'empty', textContent: 'テーブル番号を入力すると、注文履歴とお会計が表示されます。' }));
    return;
  }

  const unpaid = loadOrders().filter((o) => o.table === table && !o.paid);
  if (unpaid.length === 0) {
    box.replaceChildren(el('p', { className: 'empty', textContent: `テーブル${table}番の未会計の注文はありません。` }));
    return;
  }

  const total = unpaid.reduce((sum, o) => sum + o.total, 0);
  const history = el('ol', { className: 'history' }, unpaid.map((o) => {
    const time = new Date(o.orderedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    return el('li', {}, [
      el('p', { className: 'history-time', textContent: `${time} のご注文` }),
      el('ul', {}, o.items.map((i) => el('li', { textContent: `${i.name} × ${i.qty}　${yen(i.price * i.qty)}` }))),
    ]);
  }));

  const controls = el('div', { className: 'bill-controls' });
  if (state.payConfirming) {
    const received = el('input', { type: 'number', min: total, max: MAX_RECEIVED, step: 1, inputMode: 'numeric', className: 'received-input' });
    const error = el('p', { className: 'message', role: 'alert' });
    const confirm = el('button', { type: 'button', className: 'primary', textContent: 'お会計を確定する' });
    const back = el('button', { type: 'button', textContent: '戻る' });
    confirm.addEventListener('click', () => {
      error.textContent = payTable(table, total, received.value);
    });
    back.addEventListener('click', () => { state.payConfirming = false; renderBill(); });
    controls.append(
      el('p', { textContent: `合計 ${yen(total)} をお会計します。お預かり金額を入力してください。` }),
      el('label', { className: 'received' }, ['お預かり金額 ¥', received]),
      error,
      confirm,
      back,
    );
  } else {
    const pay = el('button', { type: 'button', className: 'primary', textContent: 'お会計へ進む' });
    pay.addEventListener('click', () => { state.payConfirming = true; renderBill(); });
    controls.append(pay);
  }

  box.replaceChildren(
    history,
    el('p', { className: 'cart-total' }, ['お会計合計 ', el('strong', { textContent: yen(total) }), '（税込）']),
    controls,
  );
}

// 会計できたら空文字、できなければエラーメッセージを返す
function payTable(table, total, rawReceived) {
  const text = String(rawReceived).trim();
  if (!/^\d+$/.test(text)) return 'お預かり金額を整数で入力してください。';
  const received = Number(text);
  if (received < total) return `お預かり金額が ${yen(total - received)} 足りません。`;
  if (received > MAX_RECEIVED) return `お預かり金額は ${yen(MAX_RECEIVED)} までです。`;

  const paidAt = new Date().toISOString();
  const orderIds = [];
  const orders = loadOrders().map((o) => {
    if (o.table !== table || o.paid) return o;
    orderIds.push(o.id);
    return { ...o, paid: true, paidAt };
  });
  const change = received - total;
  const payments = loadPayments();
  payments.push({ table, orderIds, total, received, change, paidAt });

  if (!saveOrders(orders) || !savePayments(payments)) {
    return '会計を保存できませんでした。ブラウザの設定を確認してください。';
  }
  state.payConfirming = false;
  renderBill();
  document.getElementById('bill').prepend(el('div', { className: 'receipt' }, [
    el('p', { className: 'message is-ok', textContent: `テーブル${table}番のお会計が完了しました。ありがとうございました！` }),
    el('p', { textContent: `合計 ${yen(total)}　お預かり ${yen(received)}` }),
    el('p', { className: 'change' }, ['おつり ', el('strong', { textContent: yen(change) })]),
  ]));
  return '';
}

// ---------- 人気ランキング（注文データから集計） ----------

// これまでの全注文から、注文数の多い料理を順に返す
function popularItems(limit) {
  const counts = new Map();
  for (const order of loadOrders()) {
    for (const i of order.items) counts.set(i.id, (counts.get(i.id) || 0) + i.qty);
  }
  return MENU
    .filter((item) => counts.has(item.id))
    .map((item) => ({ item, count: counts.get(item.id) }))
    .sort((a, b) => b.count - a.count) // 同数のときは MENU の順
    .slice(0, limit);
}

function renderRanking() {
  const box = document.getElementById('ranking-list');
  const ranking = popularItems(RANKING_SIZE);
  if (ranking.length === 0) {
    box.replaceChildren(el('li', { className: 'empty', textContent: 'まだ注文がありません。注文が入るとランキングが表示されます。' }));
    return;
  }
  box.replaceChildren(...ranking.map(({ item, count }, index) => {
    const conflicts = conflictAllergens(item);
    const add = el('button', { type: 'button', className: 'small', textContent: '追加', disabled: conflicts.length > 0 });
    add.setAttribute('aria-label', `${item.name}をカートに追加`);
    add.addEventListener('click', () => {
      const msg = addToCart(item.id, 1);
      if (msg) setCartMessage(msg);
    });
    return el('li', { className: 'rank-line' }, [
      el('span', { className: `rank rank-${index + 1}`, textContent: `${index + 1}位` }),
      el('span', { className: 'rank-name' }, [
        item.name,
        conflicts.length ? el('small', { className: 'warning', textContent: ` ⚠ ${conflicts.join('・')}を含む` }) : null,
      ]),
      el('span', { className: 'rank-count', textContent: `${count}食` }),
      add,
    ]);
  }));
}

// ---------- 初期化 ----------

function init() {
  document.getElementById('store-name').textContent = STORE_NAME;
  document.title = `${STORE_NAME} メニュー・オーダー`;

  renderAllergyFilter();
  renderTabs();
  renderMenu();
  renderRanking();
  renderCart();
  renderBill();

  document.getElementById('order-button').addEventListener('click', placeOrder);
  document.getElementById('table-number').addEventListener('input', () => {
    state.payConfirming = false;
    renderBill();
  });
}

init();
