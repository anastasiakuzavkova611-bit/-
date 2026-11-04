const scrollTopBtn = document.querySelector('.scroll-top');

// Показ кнопки «Наверх» после старта скролла (без тени у хедера)
function onScroll() {
  const y = window.scrollY;

  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('is-visible', y > 100);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Клик по «Наверх» — плавно в начало страницы
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Anchor navigation is distinct from manual scrolling for scroll-driven sections.
let finishAnchorNavigation = null;
function navigateToSection(target) {
  if (finishAnchorNavigation) finishAnchorNavigation();
  let frame = 0, previousY = window.scrollY, stableSince = performance.now();
  const started = stableSince;
  const finish = () => {
    cancelAnimationFrame(frame);
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.removeEventListener(type, interrupt, true));
    window.dispatchEvent(new CustomEvent('portfolio:anchor-end'));
    if (finishAnchorNavigation === finish) finishAnchorNavigation = null;
  };
  const interrupt = event => {
    if (event.type === 'keydown' && !['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) return;
    window.scrollTo({top:window.scrollY,behavior:'instant'});
    finish();
  };
  const settle = now => {
    if (Math.abs(window.scrollY - previousY) > .5) stableSince = now;
    previousY = window.scrollY;
    if ((now - stableSince > 120 && now - started > 180) || now - started > 4000) finish();
    else frame = requestAnimationFrame(settle);
  };
  finishAnchorNavigation = finish;
  window.dispatchEvent(new CustomEvent('portfolio:anchor-start'));
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, interrupt, {capture:true,passive:true}));
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  frame = requestAnimationFrame(settle);
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigateToSection(target);
  });
});

// Слайдшоу десктоп-концепта: плавная смена кадров
document.querySelectorAll('.concept-slideshow').forEach((box) => {
  const slides = box.querySelectorAll('.concept-slide');
  if (slides.length < 2) return;
  const interval = Number(box.dataset.interval) || 3500;
  let i = 0;
  let timer = null;

  function next() {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  }
  function start() {
    if (!timer) timer = setInterval(next, interval);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  // Крутим только когда карточка на экране и вкладка активна
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0.25 });
  io.observe(box);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });
});

// Reveal the cursor label only after an actual mouse movement, never on scroll entry.
const cursorCta = document.querySelector('.cursor-cta');
if (cursorCta) {
  let pointerX = null, pointerY = null;
  const hideCursorCta = () => cursorCta.classList.remove('is-visible');
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') { hideCursorCta(); return; }
    const moved = event.clientX !== pointerX || event.clientY !== pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    const media = event.target.closest?.('.case-card__media');
    if (!media) { hideCursorCta(); return; }
    if (!moved) return;
    cursorCta.style.left = pointerX + 'px';
    cursorCta.style.top = pointerY + 'px';
    cursorCta.textContent = media.dataset.cta || '';
    cursorCta.classList.toggle('is-visible', Boolean(cursorCta.textContent));
  }, { passive: true });
  document.querySelectorAll('.case-card__media').forEach((media) => {
    media.addEventListener('pointerleave', hideCursorCta);
  });
  window.addEventListener('scroll', hideCursorCta, { passive: true, capture: true });
  window.addEventListener('blur', hideCursorCta);
  window.addEventListener('resize', hideCursorCta);
  document.addEventListener('pointerleave', hideCursorCta);
  document.addEventListener('visibilitychange', hideCursorCta);
}

// Copy buttons are separate from links so copying never opens a contact page.
document.querySelectorAll('.contact-copy').forEach((button) => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('.contact-copy-status');
    try {
      // Synchronous copy also works in embedded previews without a clipboard prompt.
      const field = document.createElement('textarea');
      field.value = button.dataset.copy;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } finally { field.remove(); button.focus({ preventScroll: true }); }
      if (!copied) await navigator.clipboard.writeText(button.dataset.copy);
      document.querySelectorAll('.contact-copy').forEach((item) => delete item.dataset.copied);
      button.dataset.copied = 'true';
      status.textContent = button.dataset.copy.includes('@tasimit') ? 'Ник скопирован' : 'Почта скопирована';
    } catch {
      status.textContent = 'Не удалось скопировать. Выделите и скопируйте текст.';
    }
  });
});
