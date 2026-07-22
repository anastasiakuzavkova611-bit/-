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

// Клик по «Вверх» — плавно в начало страницы
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
