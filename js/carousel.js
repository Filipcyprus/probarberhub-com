// Lightweight auto-advancing promo carousel. No dependencies.

(function () {
  const root = document.getElementById('promo-carousel');
  if (!root) return;

  const slides = [...root.querySelectorAll('.promo-slide')];
  const dotsWrap = root.querySelector('.promo-dots');
  const prevBtn = root.querySelector('.promo-nav.prev');
  const nextBtn = root.querySelector('.promo-nav.next');
  if (slides.length < 2) return;

  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) index = 0;
  let timer = null;
  const INTERVAL = 5500;

  dotsWrap.innerHTML = slides.map((_, i) => `<button class="promo-dot${i === index ? ' active' : ''}" aria-label="Go to slide ${i + 1}"></button>`).join('');
  const dots = [...dotsWrap.querySelectorAll('.promo-dot')];

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === index));
    dots.forEach((d, n) => d.classList.toggle('active', n === index));
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function start() { stop(); timer = setInterval(next, INTERVAL); }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  prevBtn.addEventListener('click', () => { prev(); start(); });
  nextBtn.addEventListener('click', () => { next(); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  // swipe left/right on touch screens
  let touchX = null;
  root.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    start();
  }, { passive: true });

  start();
})();

// Arrow-scroll product carousels (New In / Clearance) — content (cards) is
// injected asynchronously elsewhere via innerHTML. A MutationObserver catches
// that, since ResizeObserver only reports the track's own box size, which
// doesn't change when overflowing children are added inside it.
(function () {
  const tracks = [...document.querySelectorAll('.carousel-track')];
  if (!tracks.length) return;

  tracks.forEach(track => {
    const wrap = track.closest('.carousel-wrap');
    if (!wrap) return;
    const prevBtn = wrap.querySelector('.carousel-arrow.prev');
    const nextBtn = wrap.querySelector('.carousel-arrow.next');
    if (!prevBtn || !nextBtn) return;

    const updateArrows = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft <= 4;
      nextBtn.disabled = maxScroll <= 4 || track.scrollLeft >= maxScroll - 4;
    };

    prevBtn.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.85, behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.85, behavior: 'smooth' }));
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    if (window.MutationObserver) {
      new MutationObserver(updateArrows).observe(track, { childList: true });
    }
    updateArrows();
  });
})();
