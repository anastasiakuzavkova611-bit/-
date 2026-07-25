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

// Плавный переход по внутренним якорям (напр. «Контакты» → футер).
// Через JS — чтобы работало и внутри iframe артефакта, где есть <base href>.
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
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

// Бейдж «Смотреть кейс/UI», следующий за курсором при наведении на карточку
const cursorCta = document.querySelector('.cursor-cta');
if (cursorCta) {
  document.querySelectorAll('.case-card__media').forEach((media) => {
    media.addEventListener('mouseenter', () => {
      cursorCta.textContent = media.dataset.cta || '';
      cursorCta.classList.add('is-visible');
    });
    media.addEventListener('mousemove', (e) => {
      cursorCta.style.left = e.clientX + 'px';
      cursorCta.style.top = e.clientY + 'px';
    });
    media.addEventListener('mouseleave', () => {
      cursorCta.classList.remove('is-visible');
    });
  });
}
