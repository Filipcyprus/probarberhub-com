// Catalog: search, department/brand/type filters, clearance & new toggles, sort, paginate, add-to-quote.

(function () {
  const PAGE_SIZE = 35;
  let allProducts = [], brands = [], types = [], departments = [];
  let filtered = [], visibleCount = 0;

  // Fuzzy search: Levenshtein distance to allow typos (e.g., "clipper" matches "cliper")
  function levenshteinDistance(a, b) {
    const m = a.length, n = b.length;
    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[0][i] = i;
    for (let j = 0; j <= n; j++) dp[j][0] = j;
    for (let j = 1; j <= n; j++)
      for (let i = 1; i <= m; i++)
        dp[j][i] = a[i - 1] === b[j - 1] ? dp[j - 1][i - 1] : 1 + Math.min(dp[j][i - 1], dp[j - 1][i], dp[j - 1][i - 1]);
    return dp[n][m];
  }
  function fuzzyMatch(text, query) {
    if (!query) return { exact: true, distance: 0 };
    const normalText = text.toLowerCase(), normalQuery = query.toLowerCase();
    if (normalText.includes(normalQuery)) return { exact: true, distance: 0 };
    const queryWords = normalQuery.split(/\s+/);
    const textWords = normalText.split(/\s+/);
    let totalDistance = 0;
    for (const qw of queryWords) {
      let bestMatch = false;
      for (const tw of textWords) {
        if (tw.includes(qw)) { bestMatch = true; break; }
        const dist = levenshteinDistance(tw, qw);
        if (dist <= Math.max(2, Math.floor(qw.length * 0.3))) { bestMatch = true; break; }
      }
      if (!bestMatch) return null;
    }
    return { exact: false, distance: 1 };
  }

  const els = {
    search: document.getElementById('f-search'),
    dept: document.getElementById('f-dept'),
    brand: document.getElementById('f-brand'),
    type: document.getElementById('f-type'),
    clearance: document.getElementById('f-clearance'),
    onlyNew: document.getElementById('f-new'),
    sort: document.getElementById('f-sort'),
    clear: document.getElementById('f-clear'),
    gridWrap: document.getElementById('grid-wrap'),
    resultsCount: document.getElementById('results-count'),
    activeFilters: document.getElementById('active-filters'),
    loadMoreWrap: document.getElementById('load-more-wrap'),
    loadMore: document.getElementById('load-more'),
    pageSub: document.getElementById('page-sub'),
  };

  const debounce = (fn, w) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), w); }; };

  function readParams() {
    const p = new URLSearchParams(location.search);
    return {
      q: p.get('q') || '', brand: p.get('brand') || '', type: p.get('type') || '',
      dept: p.get('dept') || '', clearance: p.get('clearance') === '1', isNew: p.get('new') === '1',
    };
  }
  function writeParams() {
    const p = new URLSearchParams();
    if (els.search.value.trim()) p.set('q', els.search.value.trim());
    if (els.dept.value) p.set('dept', els.dept.value);
    if (els.brand.value) p.set('brand', els.brand.value);
    if (els.type.value) p.set('type', els.type.value);
    if (els.clearance.checked) p.set('clearance', '1');
    if (els.onlyNew.checked) p.set('new', '1');
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function populate() {
    els.dept.innerHTML = '<option value="">All Categories</option>' +
      departments.map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)} (${d.count})</option>`).join('');
    els.brand.innerHTML = '<option value="">All Brands</option>' +
      brands.map(b => `<option value="${b.id}">${escapeHtml(b.name)} (${b.productCount})</option>`).join('');
    els.type.innerHTML = '<option value="">All Types</option>' +
      types.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }
  function applyParams() {
    const p = readParams();
    els.search.value = p.q;
    els.dept.value = departments.some(d => d.name === p.dept) ? p.dept : '';
    els.brand.value = brands.some(b => b.id === p.brand) ? p.brand : '';
    els.type.value = types.includes(p.type) ? p.type : '';
    els.clearance.checked = p.clearance;
    els.onlyNew.checked = p.isNew;
  }
  function cur() {
    return {
      q: els.search.value.trim().toLowerCase(), dept: els.dept.value, brand: els.brand.value,
      type: els.type.value, clearance: els.clearance.checked, onlyNew: els.onlyNew.checked, sort: els.sort.value,
    };
  }

  function compute() {
    const f = cur();
    let list = allProducts;
    if (f.dept) list = list.filter(p => p.department === f.dept);
    if (f.brand) list = list.filter(p => p.brandId === f.brand);
    if (f.type) list = list.filter(p => p.typeName === f.type);
    if (f.clearance) list = list.filter(p => p.clearance);
    if (f.onlyNew) list = list.filter(p => p.isNew);
    if (f.q) {
      list = list.map(p => {
        const nameMatch = fuzzyMatch(p.name, f.q);
        const brandMatch = fuzzyMatch(p.brandName, f.q);
        const typeMatch = fuzzyMatch(p.typeName, f.q);
        const descMatch = p.description ? fuzzyMatch(p.description, f.q) : null;
        const match = nameMatch || brandMatch || typeMatch || descMatch;
        return match ? { ...p, matchQuality: (match.exact ? 0 : match.distance) } : null;
      }).filter(p => p !== null);
      list.sort((a, b) => a.matchQuality - b.matchQuality);
    }
    list = list.slice();
    // "Featured" (default): when searching, prioritize relevance; otherwise best sellers first
    if (f.sort === 'featured' && !f.q) list.sort((a, b) =>
      (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) ||
      (a.brandId === 'rovra' ? 0 : 1) - (b.brandId === 'rovra' ? 0 : 1) ||
      (PBH.isTool(a) ? 0 : 1) - (PBH.isTool(b) ? 0 : 1) ||
      a.name.localeCompare(b.name));
    else if (f.sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (f.sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    else if (f.sort === 'brand') list.sort((a, b) => a.brandName.localeCompare(b.brandName) || a.name.localeCompare(b.name));
    else if (f.sort === 'clearance') list.sort((a, b) => (b.clearance - a.clearance) || a.name.localeCompare(b.name));
    filtered = list;
  }

  function renderActive() {
    const f = cur(); const pills = [];
    if (f.dept) pills.push(pill('dept', f.dept));
    if (f.brand) { const b = brands.find(x => x.id === f.brand); pills.push(pill('brand', b ? b.name : f.brand)); }
    if (f.type) pills.push(pill('type', f.type));
    if (f.clearance) pills.push(pill('clearance', 'Clearance'));
    if (f.onlyNew) pills.push(pill('new', 'New'));
    if (f.q) pills.push(pill('q', `"${f.q}"`));
    els.activeFilters.innerHTML = pills.join('');
    els.activeFilters.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-remove');
      if (k === 'dept') els.dept.value = '';
      if (k === 'brand') els.brand.value = '';
      if (k === 'type') els.type.value = '';
      if (k === 'clearance') els.clearance.checked = false;
      if (k === 'new') els.onlyNew.checked = false;
      if (k === 'q') els.search.value = '';
      changed();
    }));
  }
  const pill = (k, l) => `<span class="filter-pill">${escapeHtml(l)} <button type="button" data-remove="${k}" aria-label="Remove">×</button></span>`;

  function render(reset) {
    if (reset) { els.gridWrap.innerHTML = '<div class="product-grid" id="product-grid"></div>'; visibleCount = 0; }
    const grid = document.getElementById('product-grid');
    const next = filtered.slice(visibleCount, visibleCount + PAGE_SIZE);
    const tmp = document.createElement('div');
    tmp.innerHTML = next.map(PBH.productCardHtml).join('');
    const frag = document.createDocumentFragment();
    while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    grid.appendChild(frag);
    visibleCount += next.length;
    els.loadMoreWrap.style.display = visibleCount < filtered.length ? 'flex' : 'none';
    if (filtered.length === 0) {
      els.gridWrap.innerHTML = `<div class="empty-state"><h3>No products match your filters</h3><p>Try clearing a filter or searching a different term.</p><button class="btn btn-outline" id="empty-clear">Clear Filters</button></div>`;
      const b = document.getElementById('empty-clear'); if (b) b.addEventListener('click', clearAll);
    }
  }

  function count() {
    const total = allProducts.length;
    els.resultsCount.textContent = filtered.length === total
      ? `Showing all ${total.toLocaleString()} products`
      : `${filtered.length.toLocaleString()} of ${total.toLocaleString()} products`;
  }

  function changed() { writeParams(); compute(); renderActive(); count(); render(true); }
  function clearAll() {
    els.search.value = ''; els.dept.value = ''; els.brand.value = ''; els.type.value = '';
    els.clearance.checked = false; els.onlyNew.checked = false; changed();
  }

  els.search.addEventListener('input', debounce(changed, 220));
  [els.dept, els.brand, els.type, els.sort].forEach(e => e.addEventListener('change', changed));
  [els.clearance, els.onlyNew].forEach(e => e.addEventListener('change', changed));
  els.clear.addEventListener('click', clearAll);
  els.loadMore.addEventListener('click', () => render(false));

  // phones: filter fields stay folded away until asked for
  const filtersBox = document.querySelector('.filters');
  const filtersToggle = document.getElementById('f-toggle');
  filtersToggle.addEventListener('click', () => {
    filtersToggle.setAttribute('aria-expanded', String(filtersBox.classList.toggle('open')));
  });

  Promise.all([
    fetch('data/products.json?v=50').then(r => r.json()),
    fetch('data/brands.json?v=50').then(r => r.json()),
    fetch('data/types.json?v=50').then(r => r.json()),
    fetch('data/departments.json?v=50').then(r => r.json()),
  ]).then(([p, b, t, d]) => {
    allProducts = p; brands = b; types = t; departments = d;
    PBH.registerProducts(p);
    els.pageSub.textContent = `${p.length.toLocaleString()} products from ${b.length} brands — filter, then add to your wholesale quote.`;
    populate(); applyParams(); changed();
  }).catch(err => {
    console.error('Failed to load catalog', err);
    els.gridWrap.innerHTML = '<div class="empty-state"><h3>Could not load the catalog</h3><p>Please refresh and try again.</p></div>';
    els.pageSub.textContent = 'Could not load the catalog right now.';
  });
})();
