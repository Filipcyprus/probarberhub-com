// Quote list page: review items, set quantities, and send the whole list as a wholesale inquiry.

(function () {
  const root = document.getElementById('quote-root');
  let referralCodes = [];
  fetch('data/referral-codes.json?v=47').then(r => r.json()).then(list => { referralCodes = list; }).catch(() => {});

  function findReferral(code) {
    const c = (code || '').trim().toUpperCase();
    if (!c) return null;
    return referralCodes.find(r => r.code.toUpperCase() === c) || undefined;
  }

  function render() {
    const items = getQuote();
    if (!items.length) {
      root.innerHTML = `
        <div class="empty-state">
          <h3>Your quote list is empty</h3>
          <p>Browse the catalog and add the products your shop needs — then send us the list for trade pricing.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:6px;">
            <a href="catalog.html" class="btn btn-red">Browse Catalog</a>
            <a href="clearance.html" class="btn btn-outline">See Clearance</a>
          </div>
        </div>`;
      return;
    }

    const totalUnits = items.reduce((s, i) => s + (i.qty || 1), 0);
    root.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:flex-start;" class="quote-grid">
        <div>
          <div class="quote-list">
            ${items.map(itemRow).join('')}
          </div>
          <button class="btn btn-outline btn-sm" id="clear-quote">Clear list</button>
        </div>
        <aside class="quote-summary">
          <h3 style="margin-bottom:14px;">Quote summary</h3>
          <div style="display:flex;justify-content:space-between;font-size:.9rem;margin-bottom:8px;"><span>Product lines</span><strong>${items.length}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:.9rem;margin-bottom:16px;"><span>Total units</span><strong>${totalUnits}</strong></div>
          <p style="font-size:.82rem;">Send your list and we'll reply with wholesale pricing and current stock, usually within a few hours.</p>
          <form id="quote-form" style="margin-top:14px;">
            <div class="form-row"><label for="q-name">Your name *</label><input id="q-name" required></div>
            <div class="form-row"><label for="q-business">Barbershop / business *</label><input id="q-business" required></div>
            <div class="form-row"><label for="q-phone">Phone / WhatsApp *</label><input id="q-phone" type="tel" required></div>
            <div class="form-row">
              <label for="q-referral">Referral code (optional)</label>
              <input id="q-referral" autocomplete="off" placeholder="e.g. MARIOS10">
              <div id="q-referral-status" style="font-size:.8rem;margin-top:6px;min-height:1.2em;"></div>
            </div>
            <button type="submit" class="btn btn-red btn-block">Send Quote via WhatsApp</button>
            <p class="form-note">Opens WhatsApp with your full list pre-filled. Prefer email? <a href="mailto:contact@rovra.cy" style="font-weight:700;">contact@rovra.cy</a></p>
          </form>
        </aside>
      </div>`;

    root.querySelector('#clear-quote').addEventListener('click', () => { clearQuote(); });
    root.querySelector('#quote-form').addEventListener('submit', onSubmit);
    root.querySelector('#q-referral').addEventListener('input', (e) => {
      const status = root.querySelector('#q-referral-status');
      const val = e.target.value.trim();
      if (!val) { status.textContent = ''; return; }
      const match = findReferral(val);
      if (match) { status.textContent = `✓ Referred by ${match.ambassador}`; status.style.color = 'var(--brand, #E32227)'; }
      else { status.textContent = '✗ Referral code doesn\'t exist'; status.style.color = '#c0392b'; }
    });

    root.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => { const id = b.getAttribute('data-inc'); const it = getQuote().find(i => i.id === id); setQty(id, (it.qty || 1) + 1); }));
    root.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => { const id = b.getAttribute('data-dec'); const it = getQuote().find(i => i.id === id); setQty(id, (it.qty || 1) - 1); }));
    root.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => setQty(inp.getAttribute('data-qty'), parseInt(inp.value, 10) || 1)));
    root.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromQuote(b.getAttribute('data-remove'))));
  }

  function itemRow(i) {
    return `
      <div class="quote-item">
        <a href="product.html?id=${encodeURIComponent(i.id)}"><img src="${i.image}" alt="${escapeHtml(i.name)}"></a>
        <div class="quote-item-info">
          <div class="b">${escapeHtml(i.brandName || '')}</div>
          <a class="n" href="product.html?id=${encodeURIComponent(i.id)}">${escapeHtml(i.name)}</a>
        </div>
        <div class="qty">
          <button type="button" data-dec="${escapeHtml(i.id)}" aria-label="Decrease">−</button>
          <input type="number" min="1" value="${i.qty || 1}" data-qty="${escapeHtml(i.id)}" aria-label="Quantity">
          <button type="button" data-inc="${escapeHtml(i.id)}" aria-label="Increase">+</button>
        </div>
        <button class="quote-remove" data-remove="${escapeHtml(i.id)}" aria-label="Remove">×</button>
      </div>`;
  }

  function onSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('q-name').value.trim();
    const business = document.getElementById('q-business').value.trim();
    const phone = document.getElementById('q-phone').value.trim();
    const referralInput = document.getElementById('q-referral').value.trim();
    const referral = findReferral(referralInput);
    const items = getQuote();
    const lines = [
      `Wholesale quote request — ${name}`,
      `Business: ${business}`,
      `Phone: ${phone}`,
      ...(referral ? [`Referral code: ${referral.code} (Ambassador: ${referral.ambassador})`] : []),
      '',
      'Products:',
      ...items.map((i, n) => `${n + 1}. ${i.qty || 1} × ${i.name} (${i.brandName || ''})`),
      '',
      'Please confirm trade pricing and stock. Thank you.',
    ];
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener');
    showToast('Opening WhatsApp with your quote…');
  }

  document.addEventListener('quote:changed', render);
  render();
})();
