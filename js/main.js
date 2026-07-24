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
