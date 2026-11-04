(() => {
 const media = matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1023px) and (max-height: 600px)');
 const screen = document.querySelector('.mobile-coming-soon');
 const sync = () => {
   screen.setAttribute('aria-hidden', String(!media.matches));
   for (const element of document.body.children) {
     if (element === screen || element.tagName === 'SCRIPT') continue;
     if (media.matches) {
       if (!element.hasAttribute('inert')) { element.inert = true; element.dataset.mobileInert = ''; }
     } else if (element.hasAttribute('data-mobile-inert')) {
       element.inert = false; delete element.dataset.mobileInert;
     }
   }
   if (media.matches) document.querySelectorAll('video,audio').forEach(video => video.pause());
 };
 document.addEventListener('play', event => { if(media.matches && event.target.pause) event.target.pause(); }, true);
 media.addEventListener('change', sync); sync();
})();
