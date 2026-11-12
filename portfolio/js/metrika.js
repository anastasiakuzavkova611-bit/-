(() => {
  const counterId = 114209099;
  const ym = window.ym = window.ym || function () {
    (ym.a = ym.a || []).push(arguments);
  };
  ym.l = ym.l || Date.now();
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
  document.head.appendChild(tag);
  ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    accurateTrackBounce: true,
    trackLinks: true
  });
})();
