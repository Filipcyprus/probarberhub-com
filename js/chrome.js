// Injects the shared topbar and left sidebar into every page.
// Pages provide: <div id="site-topbar"></div>, <div id="site-sidebar"></div>,
// <div id="sidebar-backdrop"></div>, <div id="site-footer"></div>, and <body data-page="...">.

(function () {
  const page = document.body.getAttribute('data-page') || '';

  const DEPTS = [
    { label: 'Tools', dept: 'Tools' },
    { label: 'Styling Products', dept: 'Styling Products' },
    { label: 'Aftershave & Cologne', dept: 'Aftershave & Cologne' },
    { label: 'Blades & Shaving', dept: 'Blades & Shaving' },
    { label: 'Tools & Accessories', dept: 'Tools & Accessories' },
    { label: 'Consumables & Hygiene', dept: 'Consumables & Hygiene' },
    { label: 'Hair & Skin Care', dept: 'Hair & Skin Care' },
    { label: 'Beard Care', dept: 'Beard Care' },
    { label: 'Dryers & Stylers', dept: 'Dryers & Stylers' },
    { label: 'Waxing & Salon', dept: 'Waxing & Salon' },
  ];

  const announce = `
    <div class="container">
      <span>Exclusive <strong>Rovra Pro</strong> Distributor in Cyprus &amp; Official <strong>Barbertime</strong> Supplier</span>
      <span class="dot"></span>
      <span>Better pricing on bulk orders, the more you buy, the lower the price</span>
    </div>
  `;

  const topbar = `
    <div class="topbar">
      <div class="topbar-nav-group">
        <button class="sidebar-toggle" aria-label="Menu" aria-expanded="false"><span></span></button>
        <form class="search" role="search" onsubmit="return false;">
          <input type="search" placeholder="Search products, brands, categories" aria-label="Search products">
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </form>
      </div>
      <a href="index.html" class="topbar-logo"><img src="assets/logo.png" alt="ProBarberHub" width="180" height="86"></a>
      <div class="topbar-actions">
        <a class="tool-btn tool-btn-secondary" href="contact.html">
          <span class="label">Trade Account</span>
        </a>
        <a class="tool-btn" href="quote.html" aria-label="Quote list">
          <span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L23 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.4" fill="currentColor"/><circle cx="18" cy="20" r="1.4" fill="currentColor"/></svg></span>
          <span class="label">Quote</span>
          <span class="quote-count" data-count="0"></span>
        </a>
      </div>
    </div>
  `;

  const sidebar = `
    <div class="sidebar-section">
      <div class="sidebar-nav">
        <a href="index.html" data-nav="home">Home</a>
        <a href="catalog.html" data-nav="catalog">All Products</a>
        <a href="clearance.html" data-nav="clearance" class="hot">Clearance Deals</a>
        <a href="brands.html" data-nav="brands">Brands</a>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-label">Shop by Category</div>
      <div class="sidebar-nav">
        ${DEPTS.map(d => `<a href="catalog.html?dept=${encodeURIComponent(d.dept)}">${d.label}</a>`).join('')}
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-nav">
        <a href="quote.html" data-nav="quote">Quote List <span class="quote-count" data-count="0"></span></a>
        <a href="test-visit.html" data-nav="test-visit">Request Product Test Visit</a>
        <a href="contact.html" data-nav="contact">Contact</a>
      </div>
      <div class="sidebar-cta">
        <a href="#" class="btn btn-red btn-block btn-sm" data-whatsapp="Hi, I'd like to open a wholesale account with ProBarberHub. Can you share pricing and terms?">WhatsApp Us</a>
      </div>
    </div>
  `;

  const footer = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="topbar-logo"><img src="assets/logo.png" alt="ProBarberHub" width="170" height="82"></a>
          <p style="color:#9a9ba3;font-size:.88rem;max-width:300px;">Cyprus's B2B wholesale supplier for barbershops &amp; salons. 1,300+ professional products, 35+ brands, island-wide delivery.</p>
          <p style="color:#6d6e77;font-size:.8rem;margin-top:10px;">Trade customers only — professional barbershops &amp; grooming businesses.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="catalog.html">All Products</a></li>
            <li><a href="clearance.html">Clearance Deals</a></li>
            <li><a href="brands.html">Brands</a></li>
            <li><a href="quote.html">Quote List</a></li>
          </ul>
        </div>
        <div>
          <h4>Trade</h4>
          <ul>
            <li><a href="contact.html">Open a Wholesale Account</a></li>
            <li><a href="contact.html">Request Pricing</a></li>
            <li><a href="test-visit.html">Request Product Test Visit</a></li>
            <li><a href="#" data-whatsapp="Hi, I'd like to open a wholesale account with ProBarberHub.">WhatsApp Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="footer-contact">
            <li><a href="tel:+35795742890">+357 95 742 890</a></li>
            <li><a href="mailto:contact@rovra.cy">contact@rovra.cy</a></li>
            <li>Nicosia, Cyprus — island-wide delivery</li>
            <li><a href="https://instagram.com/rovra.cy" target="_blank" rel="noopener">@rovra.cy</a> · <a href="https://instagram.com/barbertimecyprus" target="_blank" rel="noopener">@barbertimecyprus</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year"></span> ProBarberHub. Nicosia, Cyprus. B2B wholesale only.</span>
        <span>Prices and stock confirmed on inquiry.</span>
      </div>
    </div>
  `;

  const aEl = document.getElementById('site-announce');
  const tEl = document.getElementById('site-topbar');
  const sEl = document.getElementById('site-sidebar');
  const bEl = document.getElementById('sidebar-backdrop');
  const fEl = document.getElementById('site-footer');
  if (aEl) { aEl.innerHTML = announce; aEl.classList.add('announce-bar'); }
  if (tEl) tEl.innerHTML = topbar;
  if (sEl) { sEl.innerHTML = sidebar; sEl.classList.add('sidebar'); }
  if (bEl) bEl.classList.add('sidebar-backdrop');
  if (fEl) fEl.innerHTML = footer;

  // active state in sidebar
  if (page) {
    document.querySelectorAll('.sidebar-nav a[data-nav]').forEach(a => {
      if (a.getAttribute('data-nav') === page) a.classList.add('active');
    });
  }

  // ---- Entry prompt: ask new visitors if they run a barbershop/salon ----
  const entryModal = `
    <div class="entry-modal" id="entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-modal-title" aria-hidden="true">
      <div class="entry-modal-backdrop" data-entry-close></div>
      <div class="entry-modal-card">
        <button class="entry-modal-x" data-entry-close aria-label="Close">&times;</button>
        <span class="entry-modal-tag">Trade customers only</span>
        <h2 id="entry-modal-title">Do you have a barbershop or salon?</h2>
        <p>ProBarberHub supplies professional barbershops &amp; salons across Cyprus at real wholesale prices. Open a trade account — or have us pass by your shop so you can test our products first.</p>
        <div class="entry-modal-actions">
          <a href="contact.html" class="btn btn-red btn-block">Open a Trade Account</a>
          <a href="test-visit.html" class="btn btn-dark btn-block">Request a Product-Test Visit</a>
        </div>
        <button class="entry-modal-dismiss" data-entry-close>Just browsing for now</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', entryModal);
  const modal = document.getElementById('entry-modal');
  const SEEN_KEY = 'pbh_trade_prompt_seen';
  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {} };
  const closeEntry = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); markSeen(); };
  modal.querySelectorAll('[data-entry-close]').forEach(el => el.addEventListener('click', closeEntry));
  modal.querySelectorAll('.entry-modal-actions a').forEach(a => a.addEventListener('click', () => { markSeen(); setTimeout(closeEntry, 50); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeEntry(); });
  let seen = null; try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
  if (!seen) setTimeout(() => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }, 900);

  // ---- Discount popup: after 1 minute, offer discount on Rovra tools ----
  const discountModal = `
    <div class="entry-modal" id="discount-modal" role="dialog" aria-modal="true" aria-labelledby="discount-modal-title" aria-hidden="true">
      <div class="entry-modal-backdrop" data-discount-close></div>
      <div class="discount-card-v2">
        <button class="entry-modal-x" data-discount-close aria-label="Close">&times;</button>
        <div class="discount-v2-media">
          <img src="assets/impactv2clippertrimmer.452.jpg.jpeg" alt="Rovra Professional Tools">
          <span class="discount-v2-tag">Trade Pricing</span>
        </div>
        <div class="discount-v2-body">
          <span class="discount-v2-eyebrow">Rovra Pro Distributor</span>
          <h2 id="discount-modal-title">Save more on Rovra tools</h2>
          <p>Wholesale pricing on clippers, trimmers &amp; dryers, the more you order, the lower the price. Trusted by 40+ Cyprus barbershops.</p>
          <a href="catalog.html?brand=rovra" class="btn btn-red btn-block">Shop Rovra Tools</a>
          <button class="entry-modal-dismiss" data-discount-close>Skip for now</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', discountModal);
  const discountMod = document.getElementById('discount-modal');
  const DISCOUNT_KEY = 'pbh_discount_shown';
  const closeDiscount = () => { discountMod.classList.remove('open'); discountMod.setAttribute('aria-hidden', 'true'); try { localStorage.setItem(DISCOUNT_KEY, '1'); } catch (e) {} };
  discountMod.querySelectorAll('[data-discount-close]').forEach(el => el.addEventListener('click', closeDiscount));
  discountMod.querySelectorAll('.entry-modal-actions a').forEach(a => a.addEventListener('click', () => { closeDiscount(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && discountMod.classList.contains('open')) closeDiscount(); });
  let discountSeen = null; try { discountSeen = localStorage.getItem(DISCOUNT_KEY); } catch (e) {}
  if (!discountSeen) setTimeout(() => { discountMod.classList.add('open'); discountMod.setAttribute('aria-hidden', 'false'); }, 60000);
})();
