// Product detail: gallery, details, add-to-quote, related products.

(function () {
  const id = new URLSearchParams(location.search).get('id');
  const root = document.getElementById('pd-root');
  if (!id) { root.innerHTML = notFound(); return; }

  Promise.all([
    fetch('data/products.json?v=49').then(r => r.json()),
    fetch('data/brands.json?v=49').then(r => r.json()),
  ]).then(([products, brands]) => {
    PBH.registerProducts(products);
    const p = products.find(x => x.id === id);
    if (!p) { root.innerHTML = notFound(); return; }
    const brand = brands.find(b => b.id === p.brandId);

    document.getElementById('doc-title').textContent = `${p.name} — ${p.brandName} | ProBarberHub`;
    document.getElementById('doc-desc').setAttribute('content', (p.description || '').slice(0, 155));
    document.getElementById('bc-name').textContent = p.name;

    root.innerHTML = render(p, brand);
    initGallery(p);
    initGenericWhatsAppButtons();

    // add-to-quote (main button)
    const addBtn = document.getElementById('pd-add');
    addBtn.addEventListener('click', () => {
      addToQuote(p);
      addBtn.textContent = '✓ Added to quote';
      addBtn.classList.add('added');
      setTimeout(() => { addBtn.textContent = '+ Add to Quote'; addBtn.classList.remove('added'); }, 1500);
    });

    // related
    const sameBrand = products.filter(x => x.id !== p.id && x.brandId === p.brandId);
    const sameType = products.filter(x => x.id !== p.id && x.brandId !== p.brandId && x.typeName === p.typeName);
    const related = sameBrand.concat(sameType).slice(0, 5);
    if (related.length) {
      document.getElementById('related-head').style.display = 'flex';
      document.getElementById('related-heading').textContent = `More from ${p.brandName}`;
      document.getElementById('related-carousel-wrap').style.display = 'block';
      document.getElementById('related-grid').innerHTML = related.map(PBH.productCardHtml).join('');
    }
  }).catch(err => { console.error(err); root.innerHTML = notFound(); });

  function render(p, brand) {
    const label = PBH.clearanceLabel(p);
    const waMsg = `Hi, I'd like a wholesale quote for "${p.name}" (${p.brandName}). Can you confirm ${p.clearance ? `the ${label.toLowerCase()} price` : 'trade pricing'} and stock?`;
    return `
      <div class="product-detail">
        <div>
          <div class="gallery-main"><img id="gallery-main-img" src="${p.images[0]}" alt="${escapeHtml(p.name)}"></div>
          ${p.images.length > 1 ? `<div class="gallery-thumbs">${p.images.map((img, i) => `<img src="${img}" alt="" data-idx="${i}" class="${i === 0 ? 'active' : ''}">`).join('')}</div>` : ''}
        </div>
        <div>
          <div class="pd-brand"><a href="catalog.html?brand=${encodeURIComponent(p.brandId)}">${escapeHtml(p.brandName)}${brand && brand.isOfficialDistributor ? ' · Official Distributor' : ''}</a></div>
          <h1 class="pd-title">${escapeHtml(p.name)}</h1>
          <div class="pd-meta">
            ${p.clearance ? `<span class="pd-tag clr">${label}</span>` : ''}
            <span class="pd-tag">${escapeHtml(p.typeName)}</span>
            ${p.isNew ? '<span class="pd-tag">New In</span>' : ''}
          </div>
          <p>${escapeHtml(p.description)}</p>
          <div class="pd-trade${p.clearance ? ' clr' : ''}">
            <strong>${p.clearance ? `${label} — limited stock.` : 'B2B wholesale only.'}</strong>
            Add it to your quote and we'll confirm your ${p.clearance ? label.toLowerCase() : 'trade'} price and availability. Trade customers only.
            ${!p.clearance ? ' Better pricing on bulk orders — the more you buy, the lower the price.' :
              PBH.isResigilated(p) ? ' This unit is also available brand new — let us know which you\'d prefer (new or resealed) when you send your quote request.' :
              ' Clearing current stock doesn\'t mean we\'re dropping this line — we\'ll keep supplying it once this batch sells through.'}
          </div>
          <div class="pd-actions">
            <button class="btn btn-red" id="pd-add">+ Add to Quote</button>
            <a href="quote.html" class="btn btn-dark">View Quote List</a>
            <a href="#" class="btn btn-wa" data-whatsapp="${waMsg}">WhatsApp</a>
          </div>
          ${p.features && p.features.length ? `<h3>Key Features</h3><ul class="pd-features">${p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`;
  }

  function initGallery(p) {
    const main = document.getElementById('gallery-main-img');
    document.querySelectorAll('.gallery-thumbs img').forEach(thumb => thumb.addEventListener('click', () => {
      main.src = p.images[Number(thumb.getAttribute('data-idx'))];
      document.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    }));
  }

  function notFound() {
    return `<div class="empty-state"><h3>Product not found</h3><p>This product may have moved. Try the full catalog instead.</p><a href="catalog.html" class="btn btn-outline">Browse Catalog</a></div>`;
  }
})();
