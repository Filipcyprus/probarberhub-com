// Shared site behavior: search, mobile nav, WhatsApp helpers, and the B2B quote list.

const WHATSAPP_NUMBER = '35795742890';
const QUOTE_KEY = 'pbh_quote_v1';

/* ---------- utils ---------- */
function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

/* ---------- quote list (localStorage) ---------- */
function getQuote() {
  try { return JSON.parse(localStorage.getItem(QUOTE_KEY)) || []; }
  catch { return []; }
}
function saveQuote(items) {
  localStorage.setItem(QUOTE_KEY, JSON.stringify(items));
  updateQuoteCount();
  document.dispatchEvent(new CustomEvent('quote:changed'));
}
function quoteCount() {
  return getQuote().reduce((s, i) => s + (i.qty || 1), 0);
}
function addToQuote(product) {
  const items = getQuote();
  const existing = items.find(i => i.id === product.id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else items.push({ id: product.id, name: product.name, brandName: product.brandName, image: product.image, qty: 1 });
  saveQuote(items);
  showToast(`Added to quote — ${quoteCount()} item${quoteCount() === 1 ? '' : 's'}`);
}
function removeFromQuote(id) {
  saveQuote(getQuote().filter(i => i.id !== id));
}
function setQty(id, qty) {
  const items = getQuote();
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, qty);
  saveQuote(items);
}
function clearQuote() { saveQuote([]); }

function updateQuoteCount() {
  const c = quoteCount();
  document.querySelectorAll('.quote-count').forEach(el => {
    el.textContent = c;
    el.setAttribute('data-count', c);
  });
}

/* ---------- toast ---------- */
let toastTimer;
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<span class="chk">✓</span> ${escapeHtml(msg)}`;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- nav (sidebar drawer on mobile) + search ---------- */
function initNav() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (!toggle || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
  };
  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  if (backdrop) backdrop.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}
function initSearch() {
  document.querySelectorAll('form.search, .search').forEach(box => {
    const input = box.querySelector('input');
    const go = () => {
      const q = (input.value || '').trim();
      location.href = 'catalog.html' + (q ? `?q=${encodeURIComponent(q)}` : '');
    };
    const btn = box.querySelector('button');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); go(); });
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  });
}
function initGenericWhatsAppButtons() {
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    const msg = el.getAttribute('data-whatsapp') || "Hi, I'm interested in ordering barber products from ProBarberHub. Can you share availability and wholesale pricing?";
    el.href = whatsappLink(msg);
    el.target = '_blank';
    el.rel = 'noopener';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearch();
  initGenericWhatsAppButtons();
  updateQuoteCount();
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
