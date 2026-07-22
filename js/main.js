// Добавляет тень хедеру при прокрутке страницы вниз
const header = document.querySelector('.site-header');

function updateHeaderShadow() {
  if (window.scrollY > 4) {
    header.style.boxShadow = '0 4px 20px rgba(40, 40, 46, 0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true });
updateHeaderShadow();
