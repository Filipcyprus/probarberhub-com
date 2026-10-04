// Shared product-card rendering + "Add to Quote" wiring used across all pages.

window.PBH = (function () {
  const registry = new Map();

  function registerProducts(products) {
    products.forEach(p => registry.set(p.id, p));
  }

  // Clippers/trimmers/shavers on clearance are resealed open-box units, not consumables —
  // label them "Resealed" instead of the generic "Clearance" tag.
  function isResigilated(p) {
    return p.clearance && /clipper|trimmer|shaver/i.test(p.typeName || '');
  }
  function clearanceLabel(p) {
    return isResigilated(p) ? 'Resealed' : 'Clearance';
  }

  // Actual machines/hand tools (clippers, trimmers, dryers, scissors, razors) —
  // as opposed to accessories/consumables. Used to rank tools ahead of
  // accessories in the "Featured" sort so a brand's hero equipment shows first.
  const TOOL_TYPES = new Set([
    'Clippers', 'Trimmers', 'Shavers', 'Hair Dryers', 'Hair Dryers & Straighteners',
    'Scissors', 'Professional Scissors', 'Professional Tools',
    'Safety Razors', 'Straight Razors', 'Wax Heaters',
  ]);
  function isTool(p) {
    return TOOL_TYPES.has(p.typeName);
  }

  // Only clearance and bestSeller are worth a badge — isProfessional is true
  // on ~97% of the catalog, so it doesn't tell shoppers anything and was just
  // visual noise.
  function badgesHtml(p) {
    const b = [];
    if (p.customBadge) {
      b.push(`<span class="badge badge-clearance">${p.customBadge}</span>`);
      b.push(`<span class="badge-sub">also available new</span>`);
    }
    else if (p.clearance) b.push(`<span class="badge badge-clearance">${clearanceLabel(p)}</span>`);
    if (p.bestSeller) b.push('<span class="badge badge-hot">Best Seller</span>');
    if (p.isNew && !p.clearance && !p.customBadge) b.push('<span class="badge badge-new">New In</span>');
    return b.length ? `<div class="badges">${b.join('')}</div>` : '';
  }

  function productCardHtml(p) {
    return `
      <div class="product-card">
        <a class="product-thumb" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="${escapeHtml(p.name)}">
          ${badgesHtml(p)}
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
        </a>
        <div class="product-body">
          <div class="product-brand">${escapeHtml(p.brandName)}</div>
          <a class="product-name" href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a>
          <div class="product-meta-row">
            <span class="trade-chip">${p.clearance ? clearanceLabel(p) + ' price' : 'Trade price'} on request</span>
          </div>
          <div class="product-actions">
            <button class="btn-quote" data-quote-id="${escapeHtml(p.id)}">+ Add to Quote</button>
          </div>
        </div>
      </div>
    `;
  }

  // Delegated click handling for every "Add to Quote" button on the page.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-quote[data-quote-id]');
    if (!btn) return;
    e.preventDefault();
    const p = registry.get(btn.getAttribute('data-quote-id'));
    if (!p) return;
    addToQuote(p);
    btn.classList.add('added');
    btn.textContent = '✓ Added';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+ Add to Quote'; }, 1400);
  });

  return { registerProducts, productCardHtml, isResigilated, clearanceLabel, isTool };
})();
