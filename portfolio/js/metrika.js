(() => {
  const counterId = 114209099;
  const tagUrl = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
  const ym = window.ym = window.ym || function () {
    (ym.a = ym.a || []).push(arguments);
  };
  ym.l = ym.l || Date.now();
  if (!Array.from(document.scripts).some(script => script.src === tagUrl)) {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = tagUrl;
    document.head.appendChild(tag);
  }
  ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true
  });
})();
