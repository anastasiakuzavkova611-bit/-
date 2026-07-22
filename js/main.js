const header = document.querySelector('.site-header');
const scrollTopBtn = document.querySelector('.scroll-top');

// Тень хедеру при прокрутке + показ кнопки «Вверх» после старта скролла
function onScroll() {
  const y = window.scrollY;

  header.style.boxShadow = y > 4 ? '0 4px 20px rgba(40, 40, 46, 0.08)' : 'none';

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
